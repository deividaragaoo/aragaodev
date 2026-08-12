import { desc, eq, inArray, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  activityLog,
  clients,
  documents,
  payables,
  projects,
  projectTasks,
  receivables,
  reminders,
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
  const allReminders = await db.select().from(reminders);

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

  const activeProjects = allProjects.filter((p) => p.status !== "cancelado");
  const projectIdsWithLedger = new Set(
    rec
      .map((r) => r.projectId)
      .filter((id): id is number => typeof id === "number" && id > 0)
  );

  // Combina livro (contas a receber) com pagamentos registrados nos projetos.
  // Projetos sem lançamentos usam amountPaid/value; com lançamentos, o livro manda.
  let received = 0;
  let toReceive = 0;
  let overdueReceive = 0;

  for (const project of activeProjects) {
    const projectRecs = rec.filter((r) => r.projectId === project.id);
    if (projectRecs.length > 0) {
      received += projectRecs
        .filter((r) => r.status === "pago")
        .reduce((sum, r) => sum + r.amount, 0);
      toReceive += projectRecs
        .filter((r) => r.status === "pendente" || r.status === "atrasado")
        .reduce((sum, r) => sum + r.amount, 0);
      overdueReceive += projectRecs
        .filter((r) => r.status === "atrasado")
        .reduce((sum, r) => sum + r.amount, 0);
    } else {
      const paid = Math.min(project.value || 0, project.amountPaid || 0);
      received += paid;
      toReceive += Math.max(0, (project.value || 0) - paid);
    }
  }

  const avulso = rec.filter((r) => !r.projectId);
  received += avulso
    .filter((r) => r.status === "pago")
    .reduce((sum, r) => sum + r.amount, 0);
  toReceive += avulso
    .filter((r) => r.status === "pendente" || r.status === "atrasado")
    .reduce((sum, r) => sum + r.amount, 0);
  overdueReceive += avulso
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

  const monthReceivedFromLedger = rec
    .filter(
      (r) =>
        r.status === "pago" &&
        r.paidAt &&
        r.paidAt >= monthStart &&
        r.paidAt <= today
    )
    .reduce((sum, r) => sum + r.amount, 0);

  // Projetos pagos só pelo campo amountPaid (sem lançamento) entram no mês
  // se foram atualizados neste mês.
  const monthReceivedFromProjects = activeProjects
    .filter((p) => !projectIdsWithLedger.has(p.id) && (p.amountPaid || 0) > 0)
    .filter((p) => {
      const stamp = (p.updatedAt || p.createdAt || "").slice(0, 10);
      return stamp >= monthStart && stamp <= today;
    })
    .reduce(
      (sum, p) => sum + Math.min(p.value || 0, p.amountPaid || 0),
      0
    );

  const monthReceived = monthReceivedFromLedger + monthReceivedFromProjects;

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

  const todayReminders = allReminders
    .filter(
      (item) =>
        !item.done && (!item.dueDate || item.dueDate <= today)
    )
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
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
      todayReminders,
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

  const projectIds = clientProjects.map((project) => project.id);
  const tasks =
    projectIds.length > 0
      ? await db
          .select()
          .from(projectTasks)
          .where(inArray(projectTasks.projectId, projectIds))
          .orderBy(projectTasks.sortOrder, projectTasks.id)
      : [];

  const tasksByProject = Object.fromEntries(
    projectIds.map((projectId) => [
      projectId,
      tasks.filter((task) => task.projectId === projectId),
    ])
  );

  return {
    client,
    projects: clientProjects,
    documents: clientDocs,
    receivables: clientReceivables,
    pendingTotal: pending,
    tasksByProject,
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
      amountPaid: projects.amountPaid,
      startDate: projects.startDate,
      dueDate: projects.dueDate,
      status: projects.status,
      progress: projects.progress,
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

export async function listProjectTaskStats() {
  await ensureAdminReady();
  const tasks = await db
    .select({
      projectId: projectTasks.projectId,
      done: projectTasks.done,
    })
    .from(projectTasks);

  const stats: Record<number, { pending: number; total: number }> = {};
  for (const task of tasks) {
    const current = stats[task.projectId] || { pending: 0, total: 0 };
    current.total += 1;
    if (!task.done) current.pending += 1;
    stats[task.projectId] = current;
  }
  return stats;
}

export async function listProjectTasks(projectId: number) {
  await ensureAdminReady();
  return db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId))
    .orderBy(projectTasks.sortOrder, projectTasks.id);
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

export async function listReceivableBalances() {
  await ensureAdminReady();
  const rows = await listReceivables();

  type Balance = {
    key: string;
    clientId: number;
    projectId: number | null;
    clientName: string;
    projectName: string;
    total: number;
    received: number;
    pending: number;
    overdue: number;
    entrada: number;
  };

  const map = new Map<string, Balance>();

  for (const row of rows) {
    const status =
      row.status === "pendente" && isOverdue(row.dueDate, row.status)
        ? "atrasado"
        : row.status;
    const key = `${row.clientId}:${row.projectId || "avulso"}`;
    const current = map.get(key) || {
      key,
      clientId: row.clientId,
      projectId: row.projectId,
      clientName: row.clientName || "Cliente",
      projectName: row.projectName || "Lançamento avulso",
      total: 0,
      received: 0,
      pending: 0,
      overdue: 0,
      entrada: 0,
    };

    current.total += row.amount;
    if (status === "pago") {
      current.received += row.amount;
      if (
        row.installment?.toLowerCase().includes("entrada") ||
        row.description.toLowerCase().includes("entrada")
      ) {
        current.entrada += row.amount;
      }
    } else if (status === "atrasado") {
      current.pending += row.amount;
      current.overdue += row.amount;
    } else if (status !== "cancelado") {
      current.pending += row.amount;
    }

    map.set(key, current);
  }

  return Array.from(map.values()).sort((a, b) => b.pending - a.pending);
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
      trackPayments: documents.trackPayments,
      amountPaid: documents.amountPaid,
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

export async function listReminders() {
  await ensureAdminReady();
  return db
    .select()
    .from(reminders)
    .orderBy(desc(reminders.dueDate), desc(reminders.createdAt));
}

export async function getCompanySettings() {
  await ensureAdminReady();
  return db.query.companySettings.findFirst();
}

export async function getAdminUser() {
  await ensureAdminReady();
  return db.query.adminUsers.findFirst();
}
