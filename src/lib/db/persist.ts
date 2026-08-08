import { neon } from "@neondatabase/serverless";
import { list, put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const BLOB_PATH = "aragaodev/admin.db";
const SNAPSHOT_KEY = "admin.db";

/**
 * Neon Claimable Postgres used as durable SQLite snapshot storage on Vercel.
 * Claim within 72h so the database does not expire:
 * https://neon.new/claim/019fdfda-532f-7708-bff8-4c2a0042365f
 *
 * Prefer TURSO_* or BLOB_READ_WRITE_TOKEN / NEON_DATABASE_URL via Vercel env
 * when available. The claimable bootstrap keeps production working without CLI.
 */
const NEON_CLAIMABLE_DB_ID =
  process.env.NEON_CLAIMABLE_DB_ID || "019fdfda-532f-7708-bff8-4c2a0042365f";

const NEON_HARDCODED_URL =
  "postgresql://neondb_owner:npg_x7skvDJ1mqYi@ep-withered-hat-axjh2gev-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

function pickPostgresUrl(...candidates: Array<string | undefined>) {
  return candidates.find((value) => value?.startsWith("postgres")) ?? null;
}

export const NEON_CLAIM_URL = `https://neon.new/claim/${NEON_CLAIMABLE_DB_ID}`;

let cachedNeonUrl: string | null = null;

export function hasDurableBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function hasDurableNeon() {
  return Boolean(
    pickPostgresUrl(
      process.env.NEON_DATABASE_URL,
      process.env.DATABASE_URL,
      NEON_HARDCODED_URL
    ) || NEON_CLAIMABLE_DB_ID
  );
}

export function hasDurableDb() {
  return (
    Boolean(process.env.TURSO_DATABASE_URL) ||
    hasDurableBlob() ||
    hasDurableNeon()
  );
}

async function resolveNeonUrl() {
  if (cachedNeonUrl) return cachedNeonUrl;

  const fromEnv = pickPostgresUrl(
    process.env.NEON_DATABASE_URL,
    process.env.DATABASE_URL
  );

  if (fromEnv) {
    cachedNeonUrl = fromEnv;
    return cachedNeonUrl;
  }

  try {
    const response = await fetch(
      `https://neon.new/api/v1/database/${NEON_CLAIMABLE_DB_ID}`,
      { cache: "no-store" }
    );
    if (response.ok) {
      const payload = (await response.json()) as {
        connection_string?: string | null;
      };
      if (payload.connection_string) {
        cachedNeonUrl = payload.connection_string;
        return cachedNeonUrl;
      }
    }
  } catch (error) {
    console.error("Failed to resolve Neon claimable URL:", error);
  }

  cachedNeonUrl = NEON_HARDCODED_URL;
  return cachedNeonUrl;
}

async function getNeonSql() {
  const url = await resolveNeonUrl();
  return neon(url);
}

async function ensureNeonSnapshotTable() {
  const sql = await getNeonSql();
  await sql`
    CREATE TABLE IF NOT EXISTS admin_db_snapshots (
      id TEXT PRIMARY KEY,
      data BYTEA NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function pullDbFromNeon(localPath: string) {
  if (!hasDurableNeon()) return;

  try {
    await ensureNeonSnapshotTable();
    const sql = await getNeonSql();
    const rows = await sql`
      SELECT data FROM admin_db_snapshots WHERE id = ${SNAPSHOT_KEY} LIMIT 1
    `;
    const row = rows[0] as { data?: ArrayBuffer | Buffer | Uint8Array } | undefined;
    if (!row?.data) return;

    const buffer = Buffer.from(row.data as ArrayBuffer);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, buffer);
  } catch (error) {
    console.error("Failed to pull admin DB from Neon:", error);
  }
}

export async function pushDbToNeon(localPath: string) {
  if (!hasDurableNeon()) return;
  if (!fs.existsSync(localPath)) return;

  try {
    await ensureNeonSnapshotTable();
    const sql = await getNeonSql();
    const data = fs.readFileSync(localPath);
    await sql`
      INSERT INTO admin_db_snapshots (id, data, updated_at)
      VALUES (${SNAPSHOT_KEY}, ${data}, NOW())
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
  } catch (error) {
    console.error("Failed to push admin DB to Neon:", error);
  }
}

export async function pullDbFromBlob(localPath: string) {
  if (hasDurableBlob()) {
    try {
      const result = await list({ prefix: "aragaodev/" });
      const blob = result.blobs.find((item) => item.pathname === BLOB_PATH);
      if (blob?.url) {
        const response = await fetch(blob.url, {
          headers: {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          },
          cache: "no-store",
        });

        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          fs.mkdirSync(path.dirname(localPath), { recursive: true });
          fs.writeFileSync(localPath, buffer);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to pull admin DB from Blob:", error);
    }
  }

  await pullDbFromNeon(localPath);
}

export async function pushDbToBlob(localPath: string) {
  if (hasDurableBlob()) {
    if (!fs.existsSync(localPath)) return;

    try {
      await put(BLOB_PATH, fs.readFileSync(localPath), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/x-sqlite3",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return;
    } catch (error) {
      console.error("Failed to push admin DB to Blob:", error);
    }
  }

  await pushDbToNeon(localPath);
}
