import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { client, db } from "./index";
import { adminUsers, companySettings, documentCounters } from "./schema";

const DEFAULT_ADMIN_USERNAME = "deividaragaoo";
const DEFAULT_ADMIN_PASSWORD = "Aragao212054@";
const DEFAULT_ADMIN_KEYWORD = "deividgostoso";

let ensurePromise: Promise<void> | null = null;

const now = () => new Date().toISOString();

const migrationStatements = [
  "PRAGMA foreign_keys = ON",
  `CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    keyword_hash TEXT NOT NULL,
    last_login_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS company_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    legal_name TEXT NOT NULL,
    document_number TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    website TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    default_payment_terms TEXT NOT NULL,
    default_document_notes TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    document_number TEXT,
    address TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS clients_name_idx ON clients(name)`,
  `CREATE INDEX IF NOT EXISTS clients_status_idx ON clients(status)`,
  `CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning',
    total_cents INTEGER NOT NULL DEFAULT 0,
    paid_cents INTEGER NOT NULL DEFAULT 0,
    start_date TEXT,
    due_date TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS projects_client_idx ON projects(client_id)`,
  `CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status)`,
  `CREATE TABLE IF NOT EXISTS receivables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    paid_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS receivables_client_idx ON receivables(client_id)`,
  `CREATE INDEX IF NOT EXISTS receivables_project_idx ON receivables(project_id)`,
  `CREATE INDEX IF NOT EXISTS receivables_due_date_idx ON receivables(due_date)`,
  `CREATE INDEX IF NOT EXISTS receivables_status_idx ON receivables(status)`,
  `CREATE TABLE IF NOT EXISTS payables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    vendor TEXT NOT NULL,
    category TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    paid_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS payables_due_date_idx ON payables(due_date)`,
  `CREATE INDEX IF NOT EXISTS payables_status_idx ON payables(status)`,
  `CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'estimate',
    number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    valid_until TEXT,
    approved_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS documents_client_idx ON documents(client_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS documents_number_idx ON documents(number)`,
  `CREATE INDEX IF NOT EXISTS documents_status_idx ON documents(status)`,
  `CREATE TABLE IF NOT EXISTS document_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cents INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS document_items_document_idx ON document_items(document_id)`,
  `CREATE TABLE IF NOT EXISTS document_installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    receivable_id INTEGER REFERENCES receivables(id) ON DELETE SET NULL,
    installment_number INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  )`,
  `CREATE INDEX IF NOT EXISTS document_installments_document_idx ON document_installments(document_id)`,
  `CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    action TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON activity_log(entity_type, entity_id)`,
  `CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log(created_at)`,
  `CREATE TABLE IF NOT EXISTS document_counters (
    type TEXT NOT NULL,
    year INTEGER NOT NULL,
    prefix TEXT NOT NULL,
    next_number INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (type, year)
  )`,
];

function adminSeed() {
  return {
    username: process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD,
    keyword: process.env.ADMIN_KEYWORD ?? DEFAULT_ADMIN_KEYWORD,
  };
}

async function migrate() {
  for (const sql of migrationStatements) {
    await client.execute(sql);
  }
}

async function seedAdmin() {
  const seededAt = now();
  const credentials = adminSeed();
  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.username, credentials.username))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(adminUsers).values({
      username: credentials.username,
      passwordHash: await bcrypt.hash(credentials.password, 12),
      keywordHash: await bcrypt.hash(credentials.keyword, 12),
      createdAt: seededAt,
      updatedAt: seededAt,
    });
  }
}

async function seedCompanySettings() {
  const existing = await db.select().from(companySettings).limit(1);

  if (existing.length === 0) {
    await db.insert(companySettings).values({
      companyName: "Aragão Dev",
      legalName: "Aragão Dev",
      documentNumber: "00.000.000/0001-00",
      email: "contato@aragaodev.com",
      phone: "(00) 00000-0000",
      whatsapp: "(00) 00000-0000",
      website: "https://aragaodev.com",
      address: "Atendimento remoto",
      city: "Brasil",
      state: "BR",
      zipCode: "00000-000",
      defaultPaymentTerms: "50% na aprovação e 50% na entrega.",
      defaultDocumentNotes:
        "Proposta válida conforme prazo informado. Escopo sujeito a revisão mediante alterações solicitadas.",
      updatedAt: now(),
    });
  }
}

async function seedDocumentCounters() {
  const currentYear = new Date().getFullYear();
  const insertedAt = now();

  await db
    .insert(documentCounters)
    .values([
      {
        type: "estimate",
        year: currentYear,
        prefix: "ORC",
        nextNumber: 1,
        updatedAt: insertedAt,
      },
      {
        type: "invoice",
        year: currentYear,
        prefix: "INV",
        nextNumber: 1,
        updatedAt: insertedAt,
      },
    ])
    .onConflictDoNothing();
}

export async function ensureAdminReady() {
  ensurePromise ??= (async () => {
    await migrate();
    await seedAdmin();
    await seedCompanySettings();
    await seedDocumentCounters();
  })();

  return ensurePromise;
}
