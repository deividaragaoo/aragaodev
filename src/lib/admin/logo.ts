import { existsSync, readFileSync } from "fs";
import path from "path";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/**
 * Resolve a public logo path (e.g. `/brand/aragaodev-logo.png`) to a data URI
 * for @react-pdf/renderer Image. Returns null when the file is missing.
 */
export function resolveLogoDataUri(logoPath?: string | null): string | null {
  if (!logoPath) return null;

  const cleaned = logoPath.trim();
  if (!cleaned) return null;

  if (cleaned.startsWith("data:image/")) return cleaned;

  const relative = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;
  const absolute = path.join(process.cwd(), "public", relative);

  if (!existsSync(absolute)) return null;

  const ext = path.extname(absolute).toLowerCase();
  const mime = MIME_BY_EXT[ext] || "image/png";
  const base64 = readFileSync(absolute).toString("base64");
  return `data:${mime};base64,${base64}`;
}
