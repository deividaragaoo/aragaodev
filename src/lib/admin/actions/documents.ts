"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { parseMoneyToCents, todayDateInput } from "@/lib/admin/format";
import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ensureAdminReady } from "@/lib/db/ensure";
import {
  documentCounters,
  documentInstallments,
  documentItems,
  documents,
  projects,
  receivables,
} from "@/lib/db/schema";

const documentSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  type: z.enum(["estimate", "invoice"]),
  title: z.string().trim().min(2),
  discountCents: z.number().int().min(0),
  notes: z.string().trim().optional(),
  validUntil: z.string().trim().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema> & {
  items: Array<{
    description: string;
    quantity: number;
    unitCents: number;
    totalCents: number;
    sortOrder: number;
  }>;
  installments: Array<{
    installmentNumber: number;
    amountCents: number;
    dueDate: string;
    status: "pending";
  }>;
  subtotalCents: number;
  totalCents: number;
};

function collectDocumentValues(formData: FormData): DocumentFormValues {
  const base = documentSchema.parse({
    clientId: formData.get("clientId"),
    type: formData.get("type") || "estimate",
    title: formData.get("title"),
    discountCents: parseMoneyToCents(formData.get("discount")),
    notes: formData.get("notes") || undefined,
    validUntil: formData.get("validUntil") || undefined,
  });
  const descriptions = formData.getAll("itemDescription");
  const quantities = formData.getAll("itemQuantity");
  const units = formData.getAll("itemUnit");
  const items = descriptions
    .map((description, index) => {
      const text = String(description).trim();
      const quantity = Number(quantities[index] ?? 1);
      const unitCents = parseMoneyToCents(units[index] ?? "0");

      return {
        description: text,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        unitCents,
        totalCents: Math.round(
          (Number.isFinite(quantity) && quantity > 0 ? quantity : 1) *
            unitCents,
        ),
        sortOrder: index,
      };
    })
    .filter((item) => item.description && item.unitCents > 0);

  if (items.length === 0) {
    throw new Error("Inclua pelo menos um item no documento.");
  }

  const subtotalCents = items.reduce((total, item) => total + item.totalCents, 0);
  const totalCents = Math.max(0, subtotalCents - base.discountCents);
  const installmentDates = formData.getAll("installmentDueDate");
  const installmentAmounts = formData.getAll("installmentAmount");
  const installments = installmentDates
    .map((dueDate, index) => ({
      installmentNumber: index + 1,
      amountCents: parseMoneyToCents(installmentAmounts[index] ?? "0"),
      dueDate: String(dueDate || "").trim(),
      status: "pending" as const,
    }))
    .filter((installment) => installment.dueDate && installment.amountCents > 0);

  return {
    ...base,
    items,
    installments:
      installments.length > 0
        ? installments
        : [
            {
              installmentNumber: 1,
              amountCents: totalCents,
              dueDate: base.validUntil || todayDateInput(),
              status: "pending",
            },
          ],
    subtotalCents,
    totalCents,
  };
}

async function nextDocumentNumber(type: "estimate" | "invoice") {
  const year = new Date().getFullYear();
  const timestamp = new Date().toISOString();
  const prefix = type === "estimate" ? "ORC" : "INV";
  const [existing] = await db
    .select()
    .from(documentCounters)
    .where(and(eq(documentCounters.type, type), eq(documentCounters.year, year)))
    .limit(1);

  if (!existing) {
    await db.insert(documentCounters).values({
      type,
      year,
      prefix,
      nextNumber: 2,
      updatedAt: timestamp,
    });

    return `${prefix}-${year}-0001`;
  }

  await db
    .update(documentCounters)
    .set({ nextNumber: existing.nextNumber + 1, updatedAt: timestamp })
    .where(and(eq(documentCounters.type, type), eq(documentCounters.year, year)));

  return `${existing.prefix}-${year}-${String(existing.nextNumber).padStart(
    4,
    "0",
  )}`;
}

async function replaceDocumentChildren(
  documentId: number,
  values: DocumentFormValues,
) {
  await db.delete(documentItems).where(eq(documentItems.documentId, documentId));
  await db
    .delete(documentInstallments)
    .where(eq(documentInstallments.documentId, documentId));
  await db.insert(documentItems).values(
    values.items.map((item) => ({
      documentId,
      ...item,
    })),
  );
  await db.insert(documentInstallments).values(
    values.installments.map((installment) => ({
      documentId,
      ...installment,
    })),
  );
}

export async function createDocumentAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const values = collectDocumentValues(formData);
  const timestamp = new Date().toISOString();
  const [document] = await db
    .insert(documents)
    .values({
      clientId: values.clientId,
      type: values.type,
      number: await nextDocumentNumber(values.type),
      title: values.title,
      status: "draft",
      subtotalCents: values.subtotalCents,
      discountCents: values.discountCents,
      totalCents: values.totalCents,
      notes: values.notes,
      validUntil: values.validUntil,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  await replaceDocumentChildren(document.id, values);
  await logActivity({
    session,
    entityType: "document",
    entityId: document.id,
    action: "create",
    message: `Documento ${document.number} criado.`,
  });

  revalidatePath("/admin/documentos");
  redirect(`/admin/documentos/${document.id}`);
}

export async function updateDocumentAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Documento invalido.");
  }

  const values = collectDocumentValues(formData);
  const [document] = await db
    .update(documents)
    .set({
      clientId: values.clientId,
      type: values.type,
      title: values.title,
      subtotalCents: values.subtotalCents,
      discountCents: values.discountCents,
      totalCents: values.totalCents,
      notes: values.notes,
      validUntil: values.validUntil,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(documents.id, id))
    .returning();

  await replaceDocumentChildren(id, values);
  await logActivity({
    session,
    entityType: "document",
    entityId: id,
    action: "update",
    message: `Documento ${document?.number ?? id} atualizado.`,
  });

  revalidatePath("/admin/documentos");
  revalidatePath(`/admin/documentos/${id}`);
}

export async function approveDocumentAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Documento invalido.");
  }

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!document) {
    throw new Error("Documento nao encontrado.");
  }

  if (document.status === "approved") {
    return;
  }

  const installments = await db
    .select()
    .from(documentInstallments)
    .where(eq(documentInstallments.documentId, id));
  const timestamp = new Date().toISOString();
  const [project] = await db
    .insert(projects)
    .values({
      clientId: document.clientId,
      documentId: document.id,
      name: document.title,
      description: document.notes,
      status: "active",
      totalCents: document.totalCents,
      paidCents: 0,
      startDate: todayDateInput(),
      dueDate: document.validUntil,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  for (const installment of installments) {
    const [entry] = await db
      .insert(receivables)
      .values({
        clientId: document.clientId,
        projectId: project.id,
        documentId: document.id,
        description: `${document.number} - parcela ${installment.installmentNumber}`,
        amountCents: installment.amountCents,
        dueDate: installment.dueDate,
        status: "pending",
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    await db
      .update(documentInstallments)
      .set({ receivableId: entry.id })
      .where(eq(documentInstallments.id, installment.id));
  }

  await db
    .update(documents)
    .set({
      status: "approved",
      projectId: project.id,
      approvedAt: timestamp,
      updatedAt: timestamp,
    })
    .where(eq(documents.id, id));

  await logActivity({
    session,
    entityType: "document",
    entityId: id,
    action: "approve",
    message: `Documento ${document.number} aprovado e projeto ${project.name} criado.`,
    metadata: { projectId: project.id },
  });

  revalidatePath("/admin/documentos");
  revalidatePath("/admin/projetos");
  revalidatePath("/admin/financeiro");
  revalidatePath(`/admin/documentos/${id}`);
}

export async function cancelDocumentAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));
  const [document] = await db
    .update(documents)
    .set({ status: "cancelled", updatedAt: new Date().toISOString() })
    .where(eq(documents.id, id))
    .returning();

  await logActivity({
    session,
    entityType: "document",
    entityId: id,
    action: "cancel",
    message: `Documento ${document?.number ?? id} cancelado.`,
  });

  revalidatePath("/admin/documentos");
  revalidatePath(`/admin/documentos/${id}`);
}
