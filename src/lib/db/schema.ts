import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
};

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  keywordHash: text("keyword_hash").notNull(),
  lastLoginAt: text("last_login_at"),
  ...timestamps,
});

export const companySettings = sqliteTable("company_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name").notNull(),
  legalName: text("legal_name").notNull(),
  documentNumber: text("document_number").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  website: text("website").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  defaultPaymentTerms: text("default_payment_terms").notNull(),
  defaultDocumentNotes: text("default_document_notes").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const clients = sqliteTable(
  "clients",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    documentNumber: text("document_number"),
    address: text("address"),
    notes: text("notes"),
    status: text("status", { enum: ["active", "archived"] }).notNull(),
    ...timestamps,
  },
  (table) => ({
    nameIdx: index("clients_name_idx").on(table.name),
    statusIdx: index("clients_status_idx").on(table.status),
  }),
);

export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    documentId: integer("document_id"),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status", {
      enum: ["planning", "active", "paused", "completed", "cancelled"],
    }).notNull(),
    totalCents: integer("total_cents").notNull(),
    paidCents: integer("paid_cents").notNull(),
    startDate: text("start_date"),
    dueDate: text("due_date"),
    completedAt: text("completed_at"),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index("projects_client_idx").on(table.clientId),
    statusIdx: index("projects_status_idx").on(table.status),
  }),
);

export const receivables = sqliteTable(
  "receivables",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    documentId: integer("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    dueDate: text("due_date").notNull(),
    paidAt: text("paid_at"),
    status: text("status", {
      enum: ["pending", "paid", "overdue", "cancelled"],
    }).notNull(),
    paymentMethod: text("payment_method"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index("receivables_client_idx").on(table.clientId),
    projectIdx: index("receivables_project_idx").on(table.projectId),
    dueDateIdx: index("receivables_due_date_idx").on(table.dueDate),
    statusIdx: index("receivables_status_idx").on(table.status),
  }),
);

export const payables = sqliteTable(
  "payables",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    description: text("description").notNull(),
    vendor: text("vendor").notNull(),
    category: text("category").notNull(),
    amountCents: integer("amount_cents").notNull(),
    dueDate: text("due_date").notNull(),
    paidAt: text("paid_at"),
    status: text("status", {
      enum: ["pending", "paid", "overdue", "cancelled"],
    }).notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => ({
    dueDateIdx: index("payables_due_date_idx").on(table.dueDate),
    statusIdx: index("payables_status_idx").on(table.status),
  }),
);

export const documents = sqliteTable(
  "documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    type: text("type", { enum: ["estimate", "invoice"] }).notNull(),
    number: text("number").notNull().unique(),
    title: text("title").notNull(),
    status: text("status", {
      enum: ["draft", "approved", "cancelled"],
    }).notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    notes: text("notes"),
    validUntil: text("valid_until"),
    approvedAt: text("approved_at"),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index("documents_client_idx").on(table.clientId),
    numberIdx: uniqueIndex("documents_number_idx").on(table.number),
    statusIdx: index("documents_status_idx").on(table.status),
  }),
);

export const documentItems = sqliteTable(
  "document_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull(),
    unitCents: integer("unit_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => ({
    documentIdx: index("document_items_document_idx").on(table.documentId),
  }),
);

export const documentInstallments = sqliteTable(
  "document_installments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    receivableId: integer("receivable_id").references(() => receivables.id, {
      onDelete: "set null",
    }),
    installmentNumber: integer("installment_number").notNull(),
    amountCents: integer("amount_cents").notNull(),
    dueDate: text("due_date").notNull(),
    status: text("status", {
      enum: ["pending", "paid", "overdue", "cancelled"],
    }).notNull(),
  },
  (table) => ({
    documentIdx: index("document_installments_document_idx").on(
      table.documentId,
    ),
  }),
);

export const activityLog = sqliteTable(
  "activity_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id"),
    action: text("action").notNull(),
    message: text("message").notNull(),
    metadata: text("metadata"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    entityIdx: index("activity_log_entity_idx").on(
      table.entityType,
      table.entityId,
    ),
    createdAtIdx: index("activity_log_created_at_idx").on(table.createdAt),
  }),
);

export const documentCounters = sqliteTable(
  "document_counters",
  {
    type: text("type", { enum: ["estimate", "invoice"] }).notNull(),
    year: integer("year").notNull(),
    prefix: text("prefix").notNull(),
    nextNumber: integer("next_number").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.type, table.year] }),
  }),
);

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  activity: many(activityLog),
}));

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
  sourceDocument: one(documents, {
    fields: [projects.documentId],
    references: [documents.id],
  }),
  receivables: many(receivables),
}));

export const receivablesRelations = relations(receivables, ({ one }) => ({
  client: one(clients, {
    fields: [receivables.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [receivables.projectId],
    references: [projects.id],
  }),
  document: one(documents, {
    fields: [receivables.documentId],
    references: [documents.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
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
    receivable: one(receivables, {
      fields: [documentInstallments.receivableId],
      references: [receivables.id],
    }),
  }),
);

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(adminUsers, {
    fields: [activityLog.userId],
    references: [adminUsers.id],
  }),
}));

export type AdminUser = typeof adminUsers.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Receivable = typeof receivables.$inferSelect;
export type NewReceivable = typeof receivables.$inferInsert;
export type Payable = typeof payables.$inferSelect;
export type NewPayable = typeof payables.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentItem = typeof documentItems.$inferSelect;
export type DocumentInstallment = typeof documentInstallments.$inferSelect;
export type CompanySettings = typeof companySettings.$inferSelect;
