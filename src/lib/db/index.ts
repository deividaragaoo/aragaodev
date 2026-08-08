import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import fs from "fs";
import os from "os";
import path from "path";
import * as schema from "./schema";

export function getLocalDbPath() {
  const baseDir = process.env.VERCEL
    ? path.join(os.tmpdir(), "aragaodev-admin")
    : path.join(process.cwd(), "data");

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  return path.join(baseDir, "admin.db");
}

function resolveDbUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  return `file:${getLocalDbPath()}`;
}

type AppSchema = typeof schema;

let client: Client = createClient({
  url: resolveDbUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let dbInstance: LibSQLDatabase<AppSchema> = drizzle(client, { schema });

/** Re-open local SQLite after replacing the file from a remote snapshot. */
export function reopenLocalDb() {
  if (process.env.TURSO_DATABASE_URL) {
    return;
  }

  try {
    client.close();
  } catch {
    // ignore close errors on fresh clients
  }

  client = createClient({
    url: resolveDbUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  dbInstance = drizzle(client, { schema });
}

export const db = new Proxy({} as LibSQLDatabase<AppSchema>, {
  get(_target, prop, receiver) {
    const value = Reflect.get(dbInstance as object, prop, receiver);
    return typeof value === "function" ? value.bind(dbInstance) : value;
  },
});

export const dbClient = new Proxy({} as Client, {
  get(_target, prop, receiver) {
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
