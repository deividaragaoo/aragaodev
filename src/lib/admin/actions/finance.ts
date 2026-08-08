"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { parseMoneyToCents } from "@/lib/admin/format";
import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ensureAdminReady } from "@/lib/db/ensure";
import { firstReturned } from "@/lib/db/result";
import { payables, projects, receivables } from "@/lib/db/schema";

const financeStatus = z.enum(["pending", "paid", "overdue", "cancelled"]);

const receivableSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive().optional(),
  description: z.string().trim().min(2),
  amountCents: z.number().int().min(1),
  dueDate: z.string().trim().min(10),
  paidAt: z.string().trim().optional(),
  status: financeStatus,
  paymentMethod: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const payableSchema = z.object({
  description: z.string().trim().min(2),
  vendor: z.string().trim().min(2),
  category: z.string().trim().min(2),
  amountCents: z.number().int().min(1),
  dueDate: z.string().trim().min(10),
  paidAt: z.string().trim().optional(),
  status: financeStatus,
  notes: z.string().trim().optional(),
});

function optionalPositiveNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function receivableValues(formData: FormData) {
  return receivableSchema.parse({
    clientId: formData.get("clientId"),
    projectId: optionalPositiveNumber(formData.get("projectId")),
    description: formData.get("description"),
    amountCents: parseMoneyToCents(formData.get("amount")),
    dueDate: formData.get("dueDate"),
    paidAt: formData.get("paidAt") || undefined,
    status: formData.get("status") || "pending",
    paymentMethod: formData.get("paymentMethod") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

function payableValues(formData: FormData) {
  return payableSchema.parse({
    description: formData.get("description"),
    vendor: formData.get("vendor"),
    category: formData.get("category"),
    amountCents: parseMoneyToCents(formData.get("amount")),
    dueDate: formData.get("dueDate"),
    paidAt: formData.get("paidAt") || undefined,
    status: formData.get("status") || "pending",
    notes: formData.get("notes") || undefined,
  });
}

async function syncProjectPaidCents(projectId?: number | null) {
  if (!projectId) {
    return;
  }

  const rows = await db
    .select()
    .from(receivables)
    .where(eq(receivables.projectId, projectId));
  const paidCents = rows
    .filter((row) => row.status === "paid")
    .reduce((total, row) => total + row.amountCents, 0);

  await db
    .update(projects)
    .set({ paidCents, updatedAt: new Date().toISOString() })
    .where(eq(projects.id, projectId));
}

export async function createReceivableAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const values = receivableValues(formData);
  const timestamp = new Date().toISOString();
  const entry = firstReturned(
    await db
    .insert(receivables)
    .values({
      ...values,
      paidAt: values.status === "paid" ? values.paidAt ?? timestamp : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
      .returning(),
  );

  await syncProjectPaidCents(entry.projectId);
  await logActivity({
    session,
    entityType: "receivable",
    entityId: entry.id,
    action: "create",
    message: `Recebivel ${entry.description} criado.`,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/projetos");
}

export async function updateReceivableAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Recebivel invalido.");
  }

  const values = receivableValues(formData);
  const entry = firstReturned(
    await db
    .update(receivables)
    .set({
      ...values,
      paidAt:
        values.status === "paid"
          ? values.paidAt ?? new Date().toISOString()
          : null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(receivables.id, id))
      .returning(),
  );

  await syncProjectPaidCents(entry.projectId);
  await logActivity({
    session,
    entityType: "receivable",
    entityId: id,
    action: "update",
    message: `Recebivel ${entry.description} atualizado.`,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/projetos");
}

export async function markReceivablePaidAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));
  const entry = firstReturned(
    await db
    .update(receivables)
    .set({
      status: "paid",
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(receivables.id, id))
      .returning(),
  );

  await syncProjectPaidCents(entry.projectId);
  await logActivity({
    session,
    entityType: "receivable",
    entityId: id,
    action: "paid",
    message: `Recebivel ${entry.description} marcado como pago.`,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/projetos");
}

export async function createPayableAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const values = payableValues(formData);
  const timestamp = new Date().toISOString();
  const entry = firstReturned(
    await db
    .insert(payables)
    .values({
      ...values,
      paidAt: values.status === "paid" ? values.paidAt ?? timestamp : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
      .returning(),
  );

  await logActivity({
    session,
    entityType: "payable",
    entityId: entry.id,
    action: "create",
    message: `Conta a pagar ${entry.description} criada.`,
  });

  revalidatePath("/admin/financeiro");
}

export async function markPayablePaidAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));
  const entry = firstReturned(
    await db
    .update(payables)
    .set({
      status: "paid",
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(payables.id, id))
      .returning(),
  );

  await logActivity({
    session,
    entityType: "payable",
    entityId: id,
    action: "paid",
    message: `Conta ${entry.description} marcada como paga.`,
  });

  revalidatePath("/admin/financeiro");
}
