/** Client-side resize/compress (WhatsApp-style) before upload. */
export async function compressImageForUpload(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<File> {
  const maxWidth = options?.maxWidth ?? 1280;
  const maxHeight = options?.maxHeight ?? 1280;
  const quality = options?.quality ?? 0.88;

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  if (file.size < 280_000 && file.type === "image/jpeg") {
    return file;
  }

  let sourceWidth: number;
  let sourceHeight: number;
  let draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  let cleanup = () => {};

  try {
    const bitmap = await createImageBitmap(file);
    sourceWidth = bitmap.width;
    sourceHeight = bitmap.height;
    draw = (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h);
    cleanup = () => bitmap.close();
  } catch {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not load image"));
      el.src = url;
    });
    sourceWidth = img.naturalWidth;
    sourceHeight = img.naturalHeight;
    draw = (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h);
    cleanup = () => URL.revokeObjectURL(url);
  }

  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    cleanup();
    throw new Error("Could not process image");
  }
  draw(ctx, width, height);
  cleanup();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not compress image"))),
      "image/jpeg",
      quality
    );
  });

  const base = file.name.replace(/\.[^.]+$/i, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}
