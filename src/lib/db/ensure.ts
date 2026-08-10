import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { hashSecret, verifySecret } from "@/lib/auth/password";
import { db, dbClient, getLocalDbPath, reopenLocalDb } from "@/lib/db";
import {
  hasDurableDb,
  pullDbFromBlob,
  pushDbToBlob,
} from "@/lib/db/persist";
import { adminUsers, companySettings } from "@/lib/db/schema";

let readyPromise: Promise<void> | null = null;
let lastSyncAt = 0;
let gate: Promise<void> = Promise.resolve();
const SYNC_THROTTLE_MS = 2_000;

async function withDbGate<T>(fn: () => Promise<T>): Promise<T> {
  const run = gate.then(fn, fn);
  // Keep the chain alive even when a caller fails.
  gate = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

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
  show_logo_on_documents INTEGER NOT NULL DEFAULT 1,
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
  amount_paid REAL NOT NULL DEFAULT 0,
  start_date TEXT,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'orcamento',
  progress INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  document_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
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
  track_payments INTEGER NOT NULL DEFAULT 0,
  amount_paid REAL NOT NULL DEFAULT 0,
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
DROP TABLE IF EXISTS project_tasks;
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

async function ensureColumn(
  table: string,
  column: string,
  definition: string
) {
  if (!(await tableExists(table))) return;
  if (await tableHasColumn(table, column)) return;
  await dbClient.execute(
    `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`
  );
}

async function ensureSchemaMigrations() {
  await ensureColumn("projects", "progress", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn("projects", "amount_paid", "REAL NOT NULL DEFAULT 0");
  await ensureColumn("documents", "track_payments", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn("documents", "amount_paid", "REAL NOT NULL DEFAULT 0");
  await ensureColumn("payables", "recurrence", "TEXT DEFAULT 'unica'");
  await ensureColumn(
    "company_settings",
    "show_logo_on_documents",
    "INTEGER NOT NULL DEFAULT 1"
  );

  // Old preview documents schema is incompatible with the current app.
  if (
    (await tableExists("documents")) &&
    ((await tableHasColumn("documents", "title")) ||
      !(await tableHasColumn("documents", "delivery_deadline")))
  ) {
    await dbClient.executeMultiple(`
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS document_installments;
DROP TABLE IF EXISTS document_items;
DROP TABLE IF EXISTS document_counters;
DROP TABLE IF EXISTS documents;
PRAGMA foreign_keys = ON;
`);
  }

  // Normalize activity log table name if an older alias exists alone.
  if (
    !(await tableExists("activity_log")) &&
    (await tableExists("activity_logs"))
  ) {
    await dbClient.execute(
      `ALTER TABLE activity_logs RENAME TO activity_log`
    );
  }
}

export async function persistAdminDb() {
  // Turso is already remote-durable; local/tmp SQLite needs a snapshot push.
  if (process.env.TURSO_DATABASE_URL) return;
  try {
    await dbClient.execute("PRAGMA wal_checkpoint(FULL)");
  } catch {
    // local file may not be in WAL mode
  }
  await pushDbToBlob(getLocalDbPath());
  lastSyncAt = Date.now();
}

async function syncRemoteSnapshot() {
  if (process.env.TURSO_DATABASE_URL) return;
  if (!hasDurableDb()) return;

  const now = Date.now();
  if (now - lastSyncAt < SYNC_THROTTLE_MS) return;

  const localPath = getLocalDbPath();
  const before = fs.existsSync(localPath)
    ? `${fs.statSync(localPath).size}:${fs.statSync(localPath).mtimeMs}`
    : "";

  await pullDbFromBlob(localPath);

  const after = fs.existsSync(localPath)
    ? `${fs.statSync(localPath).size}:${fs.statSync(localPath).mtimeMs}`
    : "";

  // Only reopen when the snapshot file actually changed (avoids killing live queries).
  if (before !== after) {
    reopenLocalDb();
  }

  lastSyncAt = Date.now();
}

async function ensureSchemaAndSeed() {
  if (await needsSchemaReset()) {
    await dbClient.executeMultiple(RESET_SQL);
  }

  // Migrations + CREATE must run on every boot (readyPromise is cached per instance).
  await ensureSchemaMigrations();
  await dbClient.executeMultiple(CREATE_SQL);

  const username = (process.env.ADMIN_USERNAME || "deividaragaoo").trim();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  // Migrate away from the old default typo even if still set in env.
  const password =
    !envPassword || envPassword === "Aragao212054@"
      ? "Aragao212504@"
      : envPassword;
  const keyword = process.env.ADMIN_KEYWORD || "deividgostoso";
  const now = new Date().toISOString();
  let dirty = false;

  const existingUsers = await db.select().from(adminUsers);
  const matched =
    existingUsers.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    ) || existingUsers[0];

  if (!matched) {
    await db.insert(adminUsers).values({
      username,
      passwordHash: await hashSecret(password),
      keywordHash: await hashSecret(keyword),
      createdAt: now,
      updatedAt: now,
    });
    dirty = true;
  } else {
    const passwordOk = await verifySecret(password, matched.passwordHash);
    const keywordOk = await verifySecret(keyword, matched.keywordHash);
    // Also accept the previous default while migrating credentials.
    const legacyPasswordOk =
      passwordOk ||
      (await verifySecret("Aragao212054@", matched.passwordHash)) ||
      (await verifySecret("Aragao212504@", matched.passwordHash));
    if (!legacyPasswordOk || !keywordOk || matched.username !== username) {
      await db
        .update(adminUsers)
        .set({
          username,
          passwordHash: await hashSecret(password),
          keywordHash: await hashSecret(keyword),
          updatedAt: now,
        })
        .where(eq(adminUsers.id, matched.id));
      dirty = true;
    } else if (!passwordOk) {
      // Hash still on a legacy password — normalize to the preferred one.
      await db
        .update(adminUsers)
        .set({
          passwordHash: await hashSecret(password),
          updatedAt: now,
        })
        .where(eq(adminUsers.id, matched.id));
      dirty = true;
    }
  }

  const settings = (
    await db.select().from(companySettings).limit(1)
  )[0];
  if (!settings) {
    await db.insert(companySettings).values({
      name: "Aragão Dev",
      tagline: "Sistemas Sob Medida",
      email: "contato@aragaodev.com",
      whatsapp: "(79) 98157-5179",
      instagram: "@aragao_Dev",
      website: "https://aragaodev.com",
      logoPath: "/brand/aragaodev-logo.png",
      showLogoOnDocuments: 1,
    });
    dirty = true;
  }

  if (dirty) {
    await persistAdminDb();
  }
}

export async function ensureAdminReady() {
  return withDbGate(async () => {
    if (!process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }

    // Keep serverless instances aligned with the durable snapshot.
    await syncRemoteSnapshot();

    // Always apply additive migrations (idempotent), even on warm instances.
    await ensureSchemaMigrations();
    await dbClient.executeMultiple(CREATE_SQL);

    if (!readyPromise) {
      readyPromise = ensureSchemaAndSeed().catch((error) => {
        readyPromise = null;
        throw error;
      });
    }

    await readyPromise;
  });
}
