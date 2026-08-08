"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { parseMoney, todayISO } from "@/lib/admin/format";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { payables, receivables } from "@/lib/db/schema";
import { ensureAdminReady } from "@/lib/db/ensure";

const receivableSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  projectId: z.number().int().positive().optional(),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.string().min(1),
  paymentMethod: z.string().optional(),
  installment: z.string().optional(),
  status: z.string().min(1),
});

const payableSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  supplier: z.string().optional(),
  amount: z.coerce.number().positive(),
  dueDate: z.string().min(1),
  recurrence: z.string().optional(),
  status: z.string().min(1),
});

export async function createReceivableAction(formData: FormData) {
  await requireSession();
  await ensureAdminReady();

  const projectRaw = String(formData.get("projectId") || "");
  const parsed = receivableSchema.parse({
    clientId: formData.get("clientId"),
    projectId: projectRaw ? Number(projectRaw) : undefined,
    description: String(formData.get("description") || "").trim(),
    amount: parseMoney(String(formData.get("amount") || "0")),
    dueDate: String(formData.get("dueDate") || ""),
    paymentMethod: String(formData.get("paymentMethod") || "") || undefined,
    installment: String(formData.get("installment") || "") || undefined,
    status: String(formData.get("status") || "pendente"),
  });

  const [row] = await db
    .insert(receivables)
    .values({
      ...parsed,
      paidAt: parsed.status === "pago" ? todayISO() : null,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: receivables.id });

  await logActivity({
    action: "Conta a receber criada",
    entityType: "receivable",
    entityId: row.id,
    details: parsed.description,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  redirect("/admin/financeiro");
}

export async function markReceivablePaidAction(id: number) {
  await requireSession();
  await ensureAdminReady();

  await db
    .update(receivables)
    .set({
      status: "pago",
      paidAt: todayISO(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(receivables.id, id));

  await logActivity({
    action: "Pagamento registrado",
    entityType: "receivable",
    entityId: id,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
}

export async function deleteReceivableAction(id: number) {
  await requireSession();
  await ensureAdminReady();
  await db.delete(receivables).where(eq(receivables.id, id));
  await logActivity({
    action: "Conta a receber excluída",
    entityType: "receivable",
    entityId: id,
  });
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
}

export async function createPayableAction(formData: FormData) {
  await requireSession();
  await ensureAdminReady();

  const parsed = payableSchema.parse({
    description: String(formData.get("description") || "").trim(),
    category: String(formData.get("category") || "outros"),
    supplier: String(formData.get("supplier") || "") || undefined,
    amount: parseMoney(String(formData.get("amount") || "0")),
    dueDate: String(formData.get("dueDate") || ""),
    recurrence: String(formData.get("recurrence") || "unica"),
    status: String(formData.get("status") || "pendente"),
  });

  const [row] = await db
    .insert(payables)
    .values({
      ...parsed,
      paidAt: parsed.status === "pago" ? todayISO() : null,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: payables.id });

  await logActivity({
    action: "Conta a pagar criada",
    entityType: "payable",
    entityId: row.id,
    details: parsed.description,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  redirect("/admin/financeiro");
}

export async function markPayablePaidAction(id: number) {
  await requireSession();
  await ensureAdminReady();

  await db
    .update(payables)
    .set({
      status: "pago",
      paidAt: todayISO(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(payables.id, id));

  await logActivity({
    action: "Conta paga",
    entityType: "payable",
    entityId: id,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
}

export async function deletePayableAction(id: number) {
  await requireSession();
  await ensureAdminReady();
  await db.delete(payables).where(eq(payables.id, id));
  await logActivity({
    action: "Conta a pagar excluída",
    entityType: "payable",
    entityId: id,
  });
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
}
