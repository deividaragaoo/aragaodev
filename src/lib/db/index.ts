import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const databaseUrl = process.env.TURSO_DATABASE_URL
  ? process.env.TURSO_DATABASE_URL
  : (process.env.DATABASE_URL ?? "file:./data/admin.db");

const authToken = process.env.TURSO_AUTH_TOKEN;

if (databaseUrl.startsWith("file:")) {
  const dbPath = databaseUrl.replace("file:", "");
  mkdirSync(path.dirname(path.resolve(process.cwd(), dbPath)), {
    recursive: true,
  });
}

export const client = createClient({
  url: databaseUrl,
  authToken,
});

export const db = drizzle(client, { schema });
