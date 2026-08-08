import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { hashSecret } from "@/lib/auth/password";
import { db, dbClient, getLocalDbPath } from "@/lib/db";
import { hasDurableBlob, pullDbFromBlob, pushDbToBlob } from "@/lib/db/persist";
import { adminUsers, companySettings } from "@/lib/db/schema";

let readyPromise: Promise<void> | null = null;

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  keyword_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS company_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT 'Aragão Dev',
  tagline TEXT NOT NULL DEFAULT 'Sistemas Sob Medida',
  document TEXT,
  address TEXT,
  whatsapp TEXT,
  email TEXT,
  instagram TEXT,
  website TEXT,
  bank_info TEXT,
  logo_path TEXT DEFAULT '/brand/aragaodev-logo.png',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  document TEXT,
  whatsapp TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  description TEXT,
  value REAL NOT NULL DEFAULT 0,
  start_date TEXT,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'orcamento',
  progress INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  document_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS receivables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  project_id INTEGER REFERENCES projects(id),
  document_id INTEGER,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT NOT NULL,
  payment_method TEXT,
  installment TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'outros',
  supplier TEXT,
  amount REAL NOT NULL,
  due_date TEXT NOT NULL,
  recurrence TEXT DEFAULT 'unica',
  status TEXT NOT NULL DEFAULT 'pendente',
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  number TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  project_id INTEGER REFERENCES projects(id),
  status TEXT NOT NULL DEFAULT 'rascunho',
  issue_date TEXT NOT NULL,
  valid_until TEXT,
  delivery_deadline TEXT,
  warranty TEXT,
  notes TEXT,
  conditions TEXT,
  payment_method TEXT,
  down_payment REAL DEFAULT 0,
  installments_count INTEGER DEFAULT 1,
  subtotal REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS document_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity REAL NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS document_installments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  due_date TEXT NOT NULL,
  amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS document_counters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0
);
`;

const RESET_SQL = `
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS document_installments;
DROP TABLE IF EXISTS document_items;
DROP TABLE IF EXISTS document_counters;
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS receivables;
DROP TABLE IF EXISTS payables;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS company_settings;
DROP TABLE IF EXISTS admin_users;
PRAGMA foreign_keys = ON;
`;

async function tableExists(table: string) {
  const result = await dbClient.execute({
    sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    args: [table],
  });
  return result.rows.length > 0;
}

async function tableHasColumn(table: string, column: string) {
  if (!(await tableExists(table))) return false;
  const result = await dbClient.execute(`PRAGMA table_info(${table})`);
  return result.rows.some((row) => {
    const name = (row as Record<string, unknown>).name ?? row[1];
    return name === column;
  });
}

async function needsSchemaReset() {
  if (!(await tableExists("company_settings"))) return false;
  // Only wipe when we detect the incompatible preview schema.
  if (await tableHasColumn("company_settings", "company_name")) return true;
  if (!(await tableHasColumn("company_settings", "name"))) return true;
  return false;
}

async function ensureProjectProgressColumn() {
  if (!(await tableExists("projects"))) return;
  if (await tableHasColumn("projects", "progress")) return;
  await dbClient.execute(
    `ALTER TABLE projects ADD COLUMN progress INTEGER NOT NULL DEFAULT 0`
  );
}

export async function persistAdminDb() {
  if (process.env.TURSO_DATABASE_URL) return;
  await pushDbToBlob(getLocalDbPath());
}

export async function ensureAdminReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      if (!process.env.TURSO_DATABASE_URL) {
        const localPath = getLocalDbPath();
        if (!process.env.VERCEL) {
          const dataDir = path.join(process.cwd(), "data");
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }
        }

        // Restore durable SQLite snapshot on cold starts (Vercel /tmp is ephemeral).
        if (hasDurableBlob() && !fs.existsSync(localPath)) {
          await pullDbFromBlob(localPath);
        } else if (hasDurableBlob()) {
          // Prefer remote snapshot when available so every instance shares state.
          await pullDbFromBlob(localPath);
        }
      }

      if (await needsSchemaReset()) {
        await dbClient.executeMultiple(RESET_SQL);
      }

      await dbClient.executeMultiple(CREATE_SQL);
      await ensureProjectProgressColumn();

      const username = (
        process.env.ADMIN_USERNAME || "deividaragaoo"
      ).trim();
      const password = process.env.ADMIN_PASSWORD || "Aragao212054@";
      const keyword = process.env.ADMIN_KEYWORD || "deividgostoso";
      const passwordHash = await hashSecret(password);
      const keywordHash = await hashSecret(keyword);
      const now = new Date().toISOString();

      // Keep the configured admin credentials in sync on every boot.
      const existingUsers = await db.select().from(adminUsers);
      const matched =
        existingUsers.find(
          (user) => user.username.toLowerCase() === username.toLowerCase()
        ) || existingUsers[0];

      if (!matched) {
        await db.insert(adminUsers).values({
          username,
          passwordHash,
          keywordHash,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        await db
          .update(adminUsers)
          .set({
            username,
            passwordHash,
            keywordHash,
            updatedAt: now,
          })
          .where(eq(adminUsers.id, matched.id));
      }

      const settings = await db.query.companySettings.findFirst();
      if (!settings) {
        await db.insert(companySettings).values({
          name: "Aragão Dev",
          tagline: "Sistemas Sob Medida",
          email: "contato@aragaodev.com",
          whatsapp: "(79) 98157-5179",
          instagram: "@aragao_Dev",
          website: "https://aragaodev.com",
          logoPath: "/brand/aragaodev-logo.png",
        });
      }

      await persistAdminDb();
    })().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }

  await readyPromise;
}
