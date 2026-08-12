import { eq } from "drizzle-orm";
import { todayISO } from "@/lib/admin/format";
import { db } from "@/lib/db";
import { projects, receivables } from "@/lib/db/schema";

function clampMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
}

function paymentProgress(value: number, amountPaid: number) {
  if (value <= 0) return amountPaid > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round((amountPaid / value) * 100)));
}

/** Atualiza amountPaid/progresso do projeto a partir das contas a receber pagas. */
export async function syncProjectPaidFromReceivables(
  projectId: number | null | undefined
) {
  if (!projectId) return;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) return;

  const items = await db
    .select()
    .from(receivables)
    .where(eq(receivables.projectId, projectId));

  const paid = clampMoney(
    items
      .filter((item) => item.status === "pago")
      .reduce((sum, item) => sum + (item.amount || 0), 0)
  );
  const capped = clampMoney(Math.min(project.value || 0, paid));
  const progress = paymentProgress(project.value || 0, capped);

  if (
    Math.abs((project.amountPaid || 0) - capped) > 0.001 ||
    project.progress !== progress
  ) {
    await db
      .update(projects)
      .set({
        amountPaid: capped,
        progress,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, projectId));
  }
}

/**
 * Ajusta o valor pago do projeto e mantém o livro de contas a receber alinhado,
 * para o Dashboard Financeiro refletir o mesmo número dos projetos.
 */
export async function setProjectPaidAmount(
  projectId: number,
  amountPaid: number
) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) return null;

  const target = clampMoney(Math.min(project.value || 0, amountPaid));
  const items = await db
    .select()
    .from(receivables)
    .where(eq(receivables.projectId, projectId));

  const paidItems = items
    .filter((item) => item.status === "pago")
    .sort((a, b) => (b.paidAt || "").localeCompare(a.paidAt || ""));

  let currentPaid = clampMoney(
    paidItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  );
  const diff = clampMoney(target - currentPaid);
  const now = new Date().toISOString();

  if (diff > 0.009) {
    await db.insert(receivables).values({
      clientId: project.clientId,
      projectId,
      description: `Pagamento — ${project.name}`,
      amount: diff,
      dueDate: todayISO(),
      installment: "Pagamento",
      status: "pago",
      paidAt: todayISO(),
      updatedAt: now,
    });
    currentPaid = clampMoney(currentPaid + diff);
  } else if (diff < -0.009) {
    let remaining = clampMoney(-diff);
    for (const item of paidItems) {
      if (remaining <= 0.009) break;

      if (item.amount <= remaining + 0.009) {
        await db
          .update(receivables)
          .set({
            status: "pendente",
            paidAt: null,
            updatedAt: now,
          })
          .where(eq(receivables.id, item.id));
        remaining = clampMoney(remaining - item.amount);
        currentPaid = clampMoney(currentPaid - item.amount);
      } else {
        const keepPaid = clampMoney(item.amount - remaining);
        await db
          .update(receivables)
          .set({
            amount: keepPaid,
            updatedAt: now,
          })
          .where(eq(receivables.id, item.id));
        await db.insert(receivables).values({
          clientId: project.clientId,
          projectId,
          description: item.description || `Pagamento — ${project.name}`,
          amount: remaining,
          dueDate: item.dueDate || todayISO(),
          paymentMethod: item.paymentMethod,
          installment: item.installment || "Ajuste",
          status: "pendente",
          paidAt: null,
          updatedAt: now,
        });
        currentPaid = clampMoney(currentPaid - remaining);
        remaining = 0;
      }
    }
  }

  const capped = clampMoney(Math.min(project.value || 0, target));
  const progress = paymentProgress(project.value || 0, capped);

  await db
    .update(projects)
    .set({
      amountPaid: capped,
      progress,
      updatedAt: now,
    })
    .where(eq(projects.id, projectId));

  return { project, paid: capped };
}
