/**
 * Rename each lab cover to include a short hash of its own contents.
 *
 * Replacing an image in place keeps its URL, and `/_next/image` is served with
 * `Cache-Control: max-age=14400`, so every browser that already saw the old
 * picture keeps showing it for four hours. Swapping the RepurposeAI cover is
 * exactly how that was found. A query string does not help — the optimiser
 * rejects one on a local path with a 400 — so the filename has to carry the
 * hash instead. Change the picture, change the URL, and no cache anywhere can
 * hold the old one.
 *
 * Run after adding or replacing anything in `public/labs/`, then paste the
 * printed paths into COVER_PHOTO in `src/lib/learnerLabs.ts`.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DIR = "public/labs";
const out = {};
for (const file of fs.readdirSync(DIR).sort()) {
  if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;
  const ext = path.extname(file);
  // strip any hash this script added before, so re-running is idempotent
  const slug = path.basename(file, ext).replace(/\.[0-9a-f]{8}$/, "");
  const buf = fs.readFileSync(path.join(DIR, file));
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 8);
  const renamed = `${slug}.${hash}${ext}`;
  if (file !== renamed) fs.renameSync(path.join(DIR, file), path.join(DIR, renamed));
  out[slug] = `/labs/${renamed}`;
}
for (const [slug, url] of Object.entries(out)) console.log(`${slug.padEnd(20)} ${url}`);
