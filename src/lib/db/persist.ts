import { list, put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const BLOB_PATH = "aragaodev/admin.db";

export function hasDurableBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function hasDurableDb() {
  return Boolean(process.env.TURSO_DATABASE_URL) || hasDurableBlob();
}

export async function pullDbFromBlob(localPath: string) {
  if (!hasDurableBlob()) return;

  try {
    const result = await list({ prefix: "aragaodev/" });
    const blob = result.blobs.find((item) => item.pathname === BLOB_PATH);
    if (!blob?.url) return;

    const response = await fetch(blob.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return;

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, buffer);
  } catch (error) {
    console.error("Failed to pull admin DB from Blob:", error);
  }
}

export async function pushDbToBlob(localPath: string) {
  if (!hasDurableBlob()) return;
  if (!fs.existsSync(localPath)) return;

  try {
    await put(BLOB_PATH, fs.readFileSync(localPath), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/x-sqlite3",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error("Failed to push admin DB to Blob:", error);
  }
}
