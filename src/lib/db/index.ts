import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "fs";
import os from "os";
import path from "path";
import * as schema from "./schema";

function resolveDbUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  // On Vercel the app filesystem is read-only; keep the local SQLite file in /tmp.
  const baseDir = process.env.VERCEL
    ? path.join(os.tmpdir(), "aragaodev-admin")
    : path.join(process.cwd(), "data");

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  return `file:${path.join(baseDir, "admin.db")}`;
}

const client = createClient({
  url: resolveDbUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { client as dbClient };
