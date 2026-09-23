/**
 * Browser-side half of image upload for the blog editor.
 *
 * A photograph off a phone is four megabytes and six thousand pixels wide. An
 * article never displays more than about eight hundred, so sending the original
 * would cost the reader a slow page and the database a hundred times the space
 * for no visible gain. This shrinks and re-encodes the picture before it leaves
 * the machine.
 *
 * Every step degrades to sending the original file rather than failing: a
 * browser that cannot decode the format, a canvas that refuses to export, an
 * image the re-encode happens to make larger. Losing the upload would be worse
 * than sending a big file.
 */

/** Wider than any column the blog renders, with room for high-density screens. */
export const MAX_WIDTH = 1600;

const QUALITY = 0.85;

export type UploadedImage = {
  url: string;
  width: number;
  height: number;
  size: number;
  /** True when this picture was already in the library — the same bytes reuse one row. */
  reused: boolean;
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Shrink to `MAX_WIDTH` and re-encode as WebP, keeping whichever of the two is
 * smaller. WebP is used rather than JPEG because it keeps transparency, so a
 * diagram with a clear background survives the trip.
 *
 * Animated GIFs are passed through untouched: a canvas only ever sees their
 * first frame, so re-encoding one would quietly throw the animation away.
 */
export async function prepareImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await canvasToBlob(canvas, "image/webp", QUALITY);
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^./\\]+$/, "") || "image";
    return new File([blob], `${base}.webp`, { type: "image/webp" });
  } catch {
    // An unreadable or exotic file: let the server's header check decide.
    return file;
  }
}

/** Send one prepared image. Throws with the server's own wording on refusal. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const prepared = await prepareImage(file);
  const form = new FormData();
  form.append("file", prepared);

  const response = await fetch("/api/admin/blog/images", { method: "POST", body: form });
  const payload = (await response.json().catch(() => ({}))) as Partial<UploadedImage> & { error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error || `The upload failed (${response.status}).`);
  }
  return {
    url: payload.url,
    width: payload.width ?? 0,
    height: payload.height ?? 0,
    size: payload.size ?? prepared.size,
    reused: Boolean(payload.reused),
  };
}

/** The image files in a paste or a drop, ignoring everything else on the clipboard. */
export function imageFilesFrom(data: DataTransfer | null): File[] {
  if (!data) return [];
  return Array.from(data.files).filter((file) => file.type.startsWith("image/"));
}

/** Cameras and screenshot tools produce names like these, which describe nothing. */
const MEANINGLESS_NAME = /^(img|dsc|dscn|pxl|p|photo|image|screenshot|screen[ -]?shot|untitled|pasted)[-_ ]?\d*$/i;

/**
 * A starting point for alt text, taken from the file name.
 *
 * Only when the name is made of words: "peak-width-diagram.png" describes the
 * picture, "IMG_4821.jpg" does not, and filling the field with the second would
 * tick the checklist's alt-text box while telling a blind reader nothing.
 */
export function altFromFilename(filename: string): string {
  const base = filename.replace(/\.[^./\\]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!base || MEANINGLESS_NAME.test(base.replace(/\s+/g, ""))) return "";
  const words = base.split(" ").filter((word) => /[a-z]{3,}/i.test(word));
  if (words.length < 2) return "";
  return base.charAt(0).toUpperCase() + base.slice(1);
}
