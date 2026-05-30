const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
/** Stored in MongoDB as data URL — works on Netlify (no disk). */
const MAX_BYTES = 2_500_000;

/**
 * Converts an uploaded image to a data URL stored in the database.
 * Netlify/serverless has no persistent filesystem; local disk paths break in production.
 */
export async function saveEntryImage(
  _userId: string,
  file: File
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 2.5MB — try a smaller photo");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}
