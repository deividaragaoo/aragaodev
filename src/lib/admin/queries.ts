import { and, asc, desc, eq, lte, or } from "drizzle-orm";
import { ensureAdminReady } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import {
  activityLog,
  clients,
  companySettings,
  documentInstallments,
  documentItems,
  documents,
  payables,
  projects,
  receivables,
} from "@/lib/db/schema";

const today = () => new Date().toISOString().slice(0, 10);

export async function getCompanySettings() {
  await ensureAdminReady();
  const [settings] = await db.select().from(companySettings).limit(1);
  return settings;
}

export async function getDashboardData() {
  await ensureAdminReady();
  const [
    allClients,
    allProjects,
    allReceivables,
    allPayables,
    allDocuments,
    recentActivity,
  ] = await Promise.all([
    db.select().from(clients),
    db.select().from(projects),
    db.select().from(receivables),
    db.select().from(payables),
    db.select().from(documents),
    db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(8),
  ]);

  const paidReceivables = allReceivables.filter((item) => item.status === "paid");
  const pendingReceivables = allReceivables.filter(
    (item) => item.status === "pending" || item.status === "overdue",
  );
  const pendingPayables = allPayables.filter(
    (item) => item.status === "pending" || item.status === "overdue",
  );
  const todayValue = today();
  const overdueReceivables = pendingReceivables.filter(
    (item) => item.dueDate < todayValue,
  );
  const overduePayables = pendingPayables.filter(
    (item) => item.dueDate < todayValue,
  );

  return {
    stats: {
      activeClients: allClients.filter((client) => client.status === "active")
        .length,
      activeProjects: allProjects.filter((project) =>
        ["planning", "active", "paused"].includes(project.status),
      ).length,
      completedProjects: allProjects.filter(
        (project) => project.status === "completed",
      ).length,
      revenueCents: paidReceivables.reduce(
        (total, item) => total + item.amountCents,
        0,
      ),
      pendingReceivablesCents: pendingReceivables.reduce(
        (total, item) => total + item.amountCents,
        0,
      ),
      pendingPayablesCents: pendingPayables.reduce(
        (total, item) => total + item.amountCents,
        0,
      ),
      draftDocuments: allDocuments.filter((doc) => doc.status === "draft")
        .length,
    },
    alerts: {
      overdueReceivables,
      overduePayables,
      documentsWaitingApproval: allDocuments.filter(
        (doc) => doc.status === "draft",
      ),
    },
    recentActivity,
  };
}

export async function listClients() {
  await ensureAdminReady();
  const rows = await db.select().from(clients).orderBy(desc(clients.createdAt));
  const allProjects = await db.select().from(projects);
  const allReceivables = await db.select().from(receivables);

  return rows.map((client) => ({
    ...client,
    projectCount: allProjects.filter((project) => project.clientId === client.id)
      .length,
    pendingCents: allReceivables
      .filter(
        (item) =>
          item.clientId === client.id &&
          (item.status === "pending" || item.status === "overdue"),
      )
      .reduce((total, item) => total + item.amountCents, 0),
  }));
}

export async function getClientDetail(id: number) {
  await ensureAdminReady();
  const [client] = await db.select().from(clients).where(eq(clients.id, id));

  if (!client) {
    return null;
  }

  const [clientProjects, clientReceivables, clientDocuments, activity] =
    await Promise.all([
      db
        .select()
        .from(projects)
        .where(eq(projects.clientId, id))
        .orderBy(desc(projects.createdAt)),
      db
        .select()
        .from(receivables)
        .where(eq(receivables.clientId, id))
        .orderBy(asc(receivables.dueDate)),
      db
        .select()
        .from(documents)
        .where(eq(documents.clientId, id))
        .orderBy(desc(documents.createdAt)),
      db
        .select()
        .from(activityLog)
        .where(
          and(
            eq(activityLog.entityType, "client"),
            eq(activityLog.entityId, id),
          ),
        )
        .orderBy(desc(activityLog.createdAt))
        .limit(20),
    ]);

  return {
    client,
    projects: clientProjects,
    receivables: clientReceivables,
    documents: clientDocuments,
    activity,
  };
}

export async function listProjects() {
  await ensureAdminReady();
  const projectRows = await db
    .select({
      project: projects,
      clientName: clients.name,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .orderBy(desc(projects.createdAt));
  const allReceivables = await db.select().from(receivables);

  return projectRows.map((row) => {
    const projectReceivables = allReceivables.filter(
      (item) => item.projectId === row.project.id,
    );
    const receivedCents = projectReceivables
      .filter((item) => item.status === "paid")
      .reduce((total, item) => total + item.amountCents, 0);
    const pendingCents = projectReceivables
      .filter((item) => item.status === "pending" || item.status === "overdue")
      .reduce((total, item) => total + item.amountCents, 0);
    const nextDue = projectReceivables
      .filter((item) => item.status === "pending" || item.status === "overdue")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

    return {
      ...row.project,
      clientName: row.clientName ?? "Cliente removido",
      receivedCents,
      pendingCents,
      nextDueDate: nextDue?.dueDate,
    };
  });
}

export async function getProjectDetail(id: number) {
  await ensureAdminReady();
  const [row] = await db
    .select({
      project: projects,
      client: clients,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.id, id));

  if (!row) {
    return null;
  }

  const [projectReceivables, projectDocuments, activity] = await Promise.all([
    db
      .select()
      .from(receivables)
      .where(eq(receivables.projectId, id))
      .orderBy(asc(receivables.dueDate)),
    db
      .select()
      .from(documents)
      .where(eq(documents.projectId, id))
      .orderBy(desc(documents.createdAt)),
    db
      .select()
      .from(activityLog)
      .where(and(eq(activityLog.entityType, "project"), eq(activityLog.entityId, id)))
      .orderBy(desc(activityLog.createdAt))
      .limit(20),
  ]);

  return {
    project: row.project,
    client: row.client,
    receivables: projectReceivables,
    documents: projectDocuments,
    activity,
  };
}

export async function getFinanceOverview() {
  await ensureAdminReady();
  const [receivableRows, payableRows, clientRows, projectRows] =
    await Promise.all([
      db.select().from(receivables).orderBy(asc(receivables.dueDate)),
      db.select().from(payables).orderBy(asc(payables.dueDate)),
      db.select().from(clients),
      db.select().from(projects),
    ]);

  const clientById = new Map(clientRows.map((client) => [client.id, client]));
  const projectById = new Map(projectRows.map((project) => [project.id, project]));

  return {
    receivables: receivableRows.map((item) => ({
      ...item,
      clientName: clientById.get(item.clientId)?.name ?? "Cliente removido",
      projectName: item.projectId
        ? projectById.get(item.projectId)?.name ?? "Projeto removido"
        : null,
    })),
    payables: payableRows,
    totals: {
      pendingReceivablesCents: receivableRows
        .filter((item) => item.status === "pending" || item.status === "overdue")
        .reduce((total, item) => total + item.amountCents, 0),
      paidReceivablesCents: receivableRows
        .filter((item) => item.status === "paid")
        .reduce((total, item) => total + item.amountCents, 0),
      pendingPayablesCents: payableRows
        .filter((item) => item.status === "pending" || item.status === "overdue")
        .reduce((total, item) => total + item.amountCents, 0),
      paidPayablesCents: payableRows
        .filter((item) => item.status === "paid")
        .reduce((total, item) => total + item.amountCents, 0),
    },
  };
}

export async function listDocuments() {
  await ensureAdminReady();
  return db
    .select({
      document: documents,
      clientName: clients.name,
    })
    .from(documents)
    .leftJoin(clients, eq(documents.clientId, clients.id))
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentDetail(id: number) {
  await ensureAdminReady();
  const [row] = await db
    .select({
      document: documents,
      client: clients,
    })
    .from(documents)
    .leftJoin(clients, eq(documents.clientId, clients.id))
    .where(eq(documents.id, id));

  if (!row) {
    return null;
  }

  const [items, installments, settings] = await Promise.all([
    db
      .select()
      .from(documentItems)
      .where(eq(documentItems.documentId, id))
      .orderBy(asc(documentItems.sortOrder)),
    db
      .select()
      .from(documentInstallments)
      .where(eq(documentInstallments.documentId, id))
      .orderBy(asc(documentInstallments.installmentNumber)),
    getCompanySettings(),
  ]);

  return {
    document: row.document,
    client: row.client,
    items,
    installments,
    settings,
  };
}

export async function listActivity(limit = 80) {
  await ensureAdminReady();
  return db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

export async function listOpenReceivablesDueSoon() {
  await ensureAdminReady();
  return db
    .select()
    .from(receivables)
    .where(
      and(
        lte(receivables.dueDate, today()),
        or(eq(receivables.status, "pending"), eq(receivables.status, "overdue")),
      ),
    )
    .orderBy(asc(receivables.dueDate));
}
