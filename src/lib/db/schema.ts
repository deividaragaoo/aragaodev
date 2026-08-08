import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  keywordHash: text("keyword_hash").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const companySettings = sqliteTable("company_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().default("Aragão Dev"),
  tagline: text("tagline").notNull().default("Sistemas Sob Medida"),
  document: text("document"),
  address: text("address"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  instagram: text("instagram"),
  website: text("website"),
  bankInfo: text("bank_info"),
  logoPath: text("logo_path").default("/brand/aragaodev-logo.png"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  company: text("company"),
  document: text("document"),
  whatsapp: text("whatsapp"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  value: real("value").notNull().default(0),
  amountPaid: real("amount_paid").notNull().default(0),
  startDate: text("start_date"),
  dueDate: text("due_date"),
  status: text("status").notNull().default("orcamento"),
  progress: integer("progress").notNull().default(0),
  notes: text("notes"),
  documentId: integer("document_id"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const receivables = sqliteTable("receivables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  projectId: integer("project_id").references(() => projects.id),
  documentId: integer("document_id"),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  dueDate: text("due_date").notNull(),
  paymentMethod: text("payment_method"),
  installment: text("installment"),
  status: text("status").notNull().default("pendente"),
  paidAt: text("paid_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const payables = sqliteTable("payables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  category: text("category").notNull().default("outros"),
  supplier: text("supplier"),
  amount: real("amount").notNull(),
  dueDate: text("due_date").notNull(),
  recurrence: text("recurrence").default("unica"),
  status: text("status").notNull().default("pendente"),
  paidAt: text("paid_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  number: text("number").notNull().unique(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  projectId: integer("project_id").references(() => projects.id),
  status: text("status").notNull().default("rascunho"),
  issueDate: text("issue_date").notNull(),
  validUntil: text("valid_until"),
  deliveryDeadline: text("delivery_deadline"),
  warranty: text("warranty"),
  notes: text("notes"),
  conditions: text("conditions"),
  paymentMethod: text("payment_method"),
  downPayment: real("down_payment").default(0),
  installmentsCount: integer("installments_count").default(1),
  trackPayments: integer("track_payments").notNull().default(0),
  amountPaid: real("amount_paid").notNull().default(0),
  subtotal: real("subtotal").notNull().default(0),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const documentItems = sqliteTable("document_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  quantity: real("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull().default(0),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const documentInstallments = sqliteTable("document_installments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  dueDate: text("due_date").notNull(),
  amount: real("amount").notNull(),
});

export const activityLog = sqliteTable("activity_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  details: text("details"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const documentCounters = sqliteTable("document_counters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  year: integer("year").notNull(),
  lastNumber: integer("last_number").notNull().default(0),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  receivables: many(receivables),
  documents: many(documents),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  receivables: many(receivables),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
  items: many(documentItems),
  installments: many(documentInstallments),
}));

export const documentItemsRelations = relations(documentItems, ({ one }) => ({
  document: one(documents, {
    fields: [documentItems.documentId],
    references: [documents.id],
  }),
}));

export const documentInstallmentsRelations = relations(
  documentInstallments,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentInstallments.documentId],
      references: [documents.id],
    }),
  })
);
