/**
 * Reads an image's format and pixel size out of its own header.
 *
 * This is the upload validator. A browser's `File.type` is whatever the
 * operating system guessed from the file extension, so it is a claim, not a
 * fact — renaming `payload.html` to `photo.png` produces a `File` that says
 * `image/png`. Parsing the header instead means a file is accepted only if it
 * really is one of the four formats below, and the dimensions stored alongside
 * it are measured rather than reported.
 *
 * Deliberately no SVG. An SVG is a script-bearing document, and one served from
 * the site's own origin can read the session cookie of whoever opens it.
 */

export type ImageFormat = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

export type ImageMeta = { mimeType: ImageFormat; width: number; height: number };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function readPng(bytes: Uint8Array): ImageMeta | null {
  // The IHDR chunk is mandatory and always first; width and height are the two
  // big-endian 32-bit numbers that open it.
  if (bytes.length < 24 || !startsWith(bytes, PNG_SIGNATURE) || ascii(bytes, 12, 4) !== "IHDR") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { mimeType: "image/png", width: view.getUint32(16), height: view.getUint32(20) };
}

function readGif(bytes: Uint8Array): ImageMeta | null {
  if (bytes.length < 10 || ascii(bytes, 0, 3) !== "GIF") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // The logical screen descriptor is little-endian, unlike everything else here.
  return { mimeType: "image/gif", width: view.getUint16(6, true), height: view.getUint16(8, true) };
}

function readJpeg(bytes: Uint8Array): ImageMeta | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // Walk the marker segments to the start-of-frame, which is the only one that
  // carries the dimensions. Everything before it (EXIF, colour profiles, an
  // embedded thumbnail) is skipped by its own declared length.
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    // Padding and standalone markers carry no length field.
    if (marker === 0xff) {
      offset++;
      continue;
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    const length = view.getUint16(offset + 2);
    if (length < 2) return null;
    // SOF0..SOF15, excluding the four that are not frame headers.
    const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) {
      return { mimeType: "image/jpeg", height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function readWebp(bytes: Uint8Array): ImageMeta | null {
  if (bytes.length < 30 || ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunk = ascii(bytes, 12, 4);

  // Three encodings, three layouts. All little-endian.
  if (chunk === "VP8X") {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { mimeType: "image/webp", width, height };
  }
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return { mimeType: "image/webp", width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }
  if (chunk === "VP8 ") {
    // The 14-bit dimensions sit just past the three-byte start code.
    return {
      mimeType: "image/webp",
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }
  return null;
}

/**
 * The image's real format and size, or null if these bytes are not a PNG,
 * JPEG, WebP or GIF — which is the same thing as "refuse this upload".
 */
export function readImageMeta(bytes: Uint8Array): ImageMeta | null {
  const meta = readPng(bytes) ?? readGif(bytes) ?? readJpeg(bytes) ?? readWebp(bytes);
  if (!meta) return null;
  // A header can parse and still be nonsense; a zero dimension would render as
  // an invisible image and look like the upload silently failed.
  if (!Number.isFinite(meta.width) || !Number.isFinite(meta.height)) return null;
  if (meta.width < 1 || meta.height < 1 || meta.width > 20_000 || meta.height > 20_000) return null;
  return meta;
}
