import { desc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  activityLog,
  clients,
  documents,
  payables,
  projects,
  receivables,
} from "@/lib/db/schema";
import { ensureAdminReady } from "@/lib/db/ensure";
import { isOverdue, todayISO } from "@/lib/admin/format";

export async function getDashboardData() {
  await ensureAdminReady();
  const today = todayISO();
  const monthStart = today.slice(0, 8) + "01";

  const allReceivables = await db.select().from(receivables);
  const allPayables = await db.select().from(payables);
  const allProjects = await db.select().from(projects);
  const allClients = await db.select().from(clients);

  const syncStatus = <T extends { status: string; dueDate: string }>(
    items: T[]
  ) =>
    items.map((item) => ({
      ...item,
      status:
        item.status === "pendente" && isOverdue(item.dueDate, item.status)
          ? "atrasado"
          : item.status,
    }));

  const rec = syncStatus(allReceivables);
  const pay = syncStatus(allPayables);

  const received = rec
    .filter((r) => r.status === "pago")
    .reduce((sum, r) => sum + r.amount, 0);
  const toReceive = rec
    .filter((r) => r.status === "pendente" || r.status === "atrasado")
    .reduce((sum, r) => sum + r.amount, 0);
  const overdueReceive = rec
    .filter((r) => r.status === "atrasado")
    .reduce((sum, r) => sum + r.amount, 0);
  const paidOut = pay
    .filter((p) => p.status === "pago")
    .reduce((sum, p) => sum + p.amount, 0);
  const toPay = pay
    .filter((p) => p.status === "pendente" || p.status === "atrasado")
    .reduce((sum, p) => sum + p.amount, 0);
  const overduePay = pay
    .filter((p) => p.status === "atrasado")
    .reduce((sum, p) => sum + p.amount, 0);

  const monthReceived = rec
    .filter(
      (r) =>
        r.status === "pago" &&
        r.paidAt &&
        r.paidAt >= monthStart &&
        r.paidAt <= today
    )
    .reduce((sum, r) => sum + r.amount, 0);

  const upcomingReceivables = rec
    .filter((r) => r.status === "pendente")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const overdueReceivables = rec
    .filter((r) => r.status === "atrasado")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const overduePayables = pay
    .filter((p) => p.status === "atrasado")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const dueSoonProjects = allProjects
    .filter(
      (p) =>
        p.dueDate &&
        p.dueDate >= today &&
        p.dueDate <= addDays(today, 7) &&
        !["concluido", "cancelado"].includes(p.status)
    )
    .slice(0, 5);

  const clientsWithPending = allClients
    .map((client) => {
      const pending = rec.filter(
        (r) =>
          r.clientId === client.id &&
          (r.status === "pendente" || r.status === "atrasado")
      );
      const total = pending.reduce((sum, r) => sum + r.amount, 0);
      return { client, total, count: pending.length };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    finance: {
      monthRevenue: monthReceived,
      received,
      toReceive,
      toPay,
      overdue: overdueReceive + overduePay,
      balance: received - paidOut,
    },
    projects: {
      inProgress: allProjects.filter((p) =>
        ["em_desenvolvimento", "em_revisao", "aprovado"].includes(p.status)
      ).length,
      awaiting: allProjects.filter((p) =>
        ["orcamento", "aguardando_aprovacao"].includes(p.status)
      ).length,
      done: allProjects.filter((p) => p.status === "concluido").length,
      overdue: allProjects.filter(
        (p) =>
          p.dueDate &&
          p.dueDate < today &&
          !["concluido", "cancelado"].includes(p.status)
      ).length,
    },
    alerts: {
      upcomingReceivables,
      overdueReceivables,
      overduePayables,
      dueSoonProjects,
      clientsWithPending,
    },
  };
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function listClients(search?: string) {
  await ensureAdminReady();
  if (!search?.trim()) {
    return db.select().from(clients).orderBy(desc(clients.createdAt));
  }
  const q = `%${search.trim()}%`;
  return db
    .select()
    .from(clients)
    .where(
      or(
        like(clients.name, q),
        like(clients.company, q),
        like(clients.document, q),
        like(clients.email, q),
        like(clients.whatsapp, q)
      )
    )
    .orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number) {
  await ensureAdminReady();
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, id),
  });
  if (!client) return null;

  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, id))
    .orderBy(desc(projects.createdAt));

  const clientDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.clientId, id))
    .orderBy(desc(documents.createdAt));

  const clientReceivables = await db
    .select()
    .from(receivables)
    .where(eq(receivables.clientId, id))
    .orderBy(desc(receivables.dueDate));

  const pending = clientReceivables
    .filter((r) => r.status === "pendente" || isOverdue(r.dueDate, r.status))
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    client,
    projects: clientProjects,
    documents: clientDocs,
    receivables: clientReceivables,
    pendingTotal: pending,
  };
}

export async function listProjects() {
  await ensureAdminReady();
  return db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      value: projects.value,
      startDate: projects.startDate,
      dueDate: projects.dueDate,
      status: projects.status,
      notes: projects.notes,
      clientId: projects.clientId,
      clientName: clients.name,
      clientCompany: clients.company,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectFinance(projectId: number) {
  await ensureAdminReady();
  const items = await db
    .select()
    .from(receivables)
    .where(eq(receivables.projectId, projectId));

  const received = items
    .filter((r) => r.status === "pago")
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingItems = items.filter(
    (r) => r.status === "pendente" || isOverdue(r.dueDate, r.status)
  );
  const pending = pendingItems.reduce((sum, r) => sum + r.amount, 0);
  const nextDue = pendingItems.sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  )[0]?.dueDate;

  return { received, pending, nextDue, total: received + pending };
}

export async function listReceivables() {
  await ensureAdminReady();
  return db
    .select({
      id: receivables.id,
      description: receivables.description,
      amount: receivables.amount,
      dueDate: receivables.dueDate,
      paymentMethod: receivables.paymentMethod,
      installment: receivables.installment,
      status: receivables.status,
      paidAt: receivables.paidAt,
      clientId: receivables.clientId,
      projectId: receivables.projectId,
      clientName: clients.name,
      projectName: projects.name,
    })
    .from(receivables)
    .leftJoin(clients, eq(receivables.clientId, clients.id))
    .leftJoin(projects, eq(receivables.projectId, projects.id))
    .orderBy(desc(receivables.dueDate));
}

export async function listPayables() {
  await ensureAdminReady();
  return db.select().from(payables).orderBy(desc(payables.dueDate));
}

export async function listDocuments() {
  await ensureAdminReady();
  return db
    .select({
      id: documents.id,
      type: documents.type,
      number: documents.number,
      status: documents.status,
      issueDate: documents.issueDate,
      total: documents.total,
      clientId: documents.clientId,
      clientName: clients.name,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .leftJoin(clients, eq(documents.clientId, clients.id))
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) {
  await ensureAdminReady();
  return db.query.documents.findFirst({
    where: eq(documents.id, id),
    with: {
      client: true,
      items: true,
      installments: true,
    },
  });
}

export async function listActivity(limit = 100) {
  await ensureAdminReady();
  return db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

export async function getCompanySettings() {
  await ensureAdminReady();
  return db.query.companySettings.findFirst();
}

export async function getAdminUser() {
  await ensureAdminReady();
  return db.query.adminUsers.findFirst();
}
