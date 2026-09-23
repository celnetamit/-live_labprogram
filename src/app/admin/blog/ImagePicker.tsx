"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { type UploadedImage, altFromFilename, uploadImage } from "@/lib/imageUpload";
import { Tool } from "./toolbarUi";

/**
 * Choosing an image for a post.
 *
 * Three ways in, because they are the three things people actually do: pick a
 * file, drag one onto the editor, or paste a screenshot. All of them land in
 * `uploadImage`, which shrinks the picture in the browser and posts it to
 * `/api/admin/blog/images`.
 *
 * Typing a path still works and is still first-class — the site's own
 * `/showcase` pictures live on disk, and an image already on the web does not
 * need copying into the database to be linked.
 */

const FIELD =
  "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

/** Pictures the file dialog should offer. SVG is refused by the server. */
export const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

function kb(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} kB`;
}

/* ------------------------------------------------------------------------ */
/* A button that uploads one file                                           */
/* ------------------------------------------------------------------------ */

/**
 * "Upload" next to a field that holds an image address — used by the cover
 * image. Replaces whatever the field held with the uploaded picture's URL.
 */
export function UploadButton({
  onUploaded,
  label = "Upload",
}: {
  onUploaded: (image: UploadedImage, filename: string) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function take(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onUploaded(await uploadImage(file), file.name);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(event) => take(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy ? "Uploading" : label}
      </button>
      {error ? <p className="mt-1.5 w-full text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* The toolbar's image button                                               */
/* ------------------------------------------------------------------------ */

export function ImageButton({ onInsert }: { onInsert: (src: string, alt: string) => void }) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<{ image: UploadedImage; filename: string } | null>(null);

  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const altField = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function reset() {
    setSrc("");
    setAlt("");
    setError(null);
    setUploaded(null);
    setDragging(false);
  }

  async function take(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const image = await uploadImage(file);
      setSrc(image.url);
      setUploaded({ image, filename: file.name });
      // Only when the file name is made of words — see altFromFilename.
      const guess = altFromFilename(file.name);
      if (guess && !alt.trim()) setAlt(guess);
      altField.current?.focus();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function insert() {
    const address = src.trim();
    if (!address) {
      setError("Choose a file, or type an image address.");
      return;
    }
    onInsert(address, alt.trim());
    setOpen(false);
    reset();
  }

  return (
    <div ref={box} className="relative">
      <Tool
        title="Insert image"
        active={open}
        onClick={() => {
          setOpen((was) => !was);
          setError(null);
        }}
      >
        <ImageIcon className="h-4 w-4" />
      </Tool>

      {open ? (
        <div
          id={id}
          className="absolute left-0 top-full z-30 mt-1 w-80 rounded-xl border border-border bg-popover p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Insert an image</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <input
            ref={input}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(event) => take(event.target.files?.[0])}
          />

          {uploaded ? (
            <div className="flex items-center gap-3 rounded-lg border border-border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- a just-uploaded file of unknown size, served from this origin. */}
              <img
                src={uploaded.image.url}
                alt=""
                className="h-12 w-12 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium">{uploaded.filename}</p>
                <p className="text-muted-foreground">
                  {uploaded.image.width}&times;{uploaded.image.height} · {kb(uploaded.image.size)}
                  {uploaded.image.reused ? " · already in the library" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="ml-auto shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Change
              </button>
            </div>
          ) : (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                take(Array.from(event.dataTransfer.files).find((file) => file.type.startsWith("image/")));
              }}
              className={`flex flex-col items-center gap-2 rounded-lg border border-dashed px-3 py-5 text-center transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Uploading…</p>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => input.current?.click()}
                    className="btn-brand rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    Choose a file
                  </button>
                  <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">
                    or drop one here. You can also paste an image straight into the article.
                  </p>
                </>
              )}
            </div>
          )}

          <div className="mt-3 space-y-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">
                {uploaded ? "Address" : "…or paste an image address"}
              </span>
              <input
                value={src}
                onChange={(event) => setSrc(event.target.value)}
                placeholder="/showcase/virtual-ai.jpg"
                readOnly={Boolean(uploaded)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    insert();
                  }
                }}
                className={`${FIELD} mt-1 ${uploaded ? "text-muted-foreground" : ""}`}
              />
            </label>

            <label className="block">
              <span className="text-xs text-muted-foreground">Alt text — what the image shows</span>
              <input
                ref={altField}
                value={alt}
                onChange={(event) => setAlt(event.target.value)}
                placeholder="A diffraction peak with its width marked"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    insert();
                  }
                }}
                className={`${FIELD} mt-1`}
              />
            </label>
          </div>

          {error ? <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}

          <button
            type="button"
            onClick={insert}
            disabled={busy}
            className="btn-brand mt-3 w-full rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
          >
            Insert image
          </button>
        </div>
      ) : null}
    </div>
  );
}
