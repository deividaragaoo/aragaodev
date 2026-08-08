import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import fs from "fs";
import path from "path";
import { hashSecret } from "../src/lib/auth/password";
import * as schema from "../src/lib/db/schema";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "admin.db");

async function main() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const url = process.env.TURSO_DATABASE_URL ?? `file:${dbPath}`;
  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  await client.executeMultiple(`
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
  `);

  const username = process.env.ADMIN_USERNAME || "deividaragaoo";
  const password = process.env.ADMIN_PASSWORD || "Aragao212054@";
  const keyword = process.env.ADMIN_KEYWORD || "deividgostoso";

  const existing = await db.query.adminUsers.findFirst({
    where: eq(schema.adminUsers.username, username),
  });

  if (!existing) {
    await db.insert(schema.adminUsers).values({
      username,
      passwordHash: await hashSecret(password),
      keywordHash: await hashSecret(keyword),
    });
    console.log(`Admin user created: ${username}`);
  } else {
    console.log(`Admin user already exists: ${username}`);
  }

  const settings = await db.query.companySettings.findFirst();
  if (!settings) {
    await db.insert(schema.companySettings).values({
      name: "Aragão Dev",
      tagline: "Sistemas Sob Medida",
      email: "contato@aragaodev.com",
      whatsapp: "(79) 98157-5179",
      instagram: "@aragao_Dev",
      website: "https://aragaodev.com",
      logoPath: "/brand/aragaodev-logo.png",
    });
    console.log("Company settings seeded");
  }

  console.log("Database ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
