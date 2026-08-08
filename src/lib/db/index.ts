import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import path from "path";
import * as schema from "./schema";

function resolveDbUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  const filePath = path.join(process.cwd(), "data", "admin.db");
  return `file:${filePath}`;
}

const client = createClient({
  url: resolveDbUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { client as dbClient };
