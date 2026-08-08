"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/admin/activity";
import { DOCUMENT_TYPES } from "@/lib/admin/constants";
import {
  isFlexibleDateToken,
  parseMoney,
  todayISO,
} from "@/lib/admin/format";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  documentCounters,
  documentInstallments,
  documentItems,
  documents,
  projects,
  receivables,
} from "@/lib/db/schema";
import { ensureAdminReady, persistAdminDb } from "@/lib/db/ensure";

async function nextDocumentNumber(type: string) {
  const year = new Date().getFullYear();
  const prefix =
    DOCUMENT_TYPES.find((item) => item.value === type)?.prefix || "DOC";

  const existing = await db.query.documentCounters.findFirst({
    where: and(
      eq(documentCounters.type, type),
      eq(documentCounters.year, year)
    ),
  });

  let next = 1;
  if (existing) {
    next = existing.lastNumber + 1;
    await db
      .update(documentCounters)
      .set({ lastNumber: next })
      .where(eq(documentCounters.id, existing.id));
  } else {
    await db.insert(documentCounters).values({
      type,
      year,
      lastNumber: next,
    });
  }

  return `${prefix}-${year}-${String(next).padStart(4, "0")}`;
}

function parseItems(formData: FormData) {
  const names = formData.getAll("itemName").map(String);
  const descriptions = formData.getAll("itemDescription").map(String);
  const quantities = formData.getAll("itemQuantity").map(String);
  const unitPrices = formData.getAll("itemUnitPrice").map(String);
  const discounts = formData.getAll("itemDiscount").map(String);

  return names
    .map((name, index) => {
      const quantity = Number(quantities[index] || 1);
      const unitPrice = parseMoney(unitPrices[index] || "0");
      const discount = parseMoney(discounts[index] || "0");
      const total = Math.max(quantity * unitPrice - discount, 0);
      return {
        name: name.trim(),
        description: descriptions[index]?.trim() || undefined,
        quantity,
        unitPrice,
        discount,
        total,
        sortOrder: index,
      };
    })
    .filter((item) => item.name);
}

function parseInstallments(formData: FormData) {
  const dates = formData.getAll("installmentDueDate").map(String);
  const amounts = formData.getAll("installmentAmount").map(String);

  return dates
    .map((dueDate, index) => ({
      number: index + 1,
      dueDate: dueDate.trim(),
      amount: parseMoney(amounts[index] || "0"),
    }))
    .filter((item) => item.amount > 0 && item.dueDate);
}

export async function createDocumentAction(formData: FormData) {
  await requireSession();
  await ensureAdminReady();

  const type = String(formData.get("type") || "orcamento");
  const clientId = Number(formData.get("clientId"));
  const items = parseItems(formData);
  const installments = parseInstallments(formData);

  if (!clientId || items.length === 0) {
    throw new Error("Cliente e ao menos um serviço são obrigatórios.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = items.reduce((sum, item) => sum + item.discount, 0) +
    parseMoney(String(formData.get("discount") || "0"));
  const total = Math.max(
    items.reduce((sum, item) => sum + item.total, 0) -
      parseMoney(String(formData.get("discount") || "0")),
    0
  );

  const number = await nextDocumentNumber(type);

  const [doc] = await db
    .insert(documents)
    .values({
      type,
      number,
      clientId,
      status: String(formData.get("status") || "rascunho"),
      issueDate: String(formData.get("issueDate") || todayISO()),
      validUntil: String(formData.get("validUntil") || "") || null,
      deliveryDeadline: String(formData.get("deliveryDeadline") || "") || null,
      warranty: String(formData.get("warranty") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      conditions: String(formData.get("conditions") || "") || null,
      paymentMethod: String(formData.get("paymentMethod") || "") || null,
      downPayment: parseMoney(String(formData.get("downPayment") || "0")),
      installmentsCount: installments.length || Number(formData.get("installmentsCount") || 1),
      trackPayments: formData.get("trackPayments") === "1" ? 1 : 0,
      amountPaid: Math.min(
        total,
        parseMoney(String(formData.get("amountPaid") || "0"))
      ),
      subtotal,
      discount,
      total,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: documents.id });

  if (items.length) {
    await db.insert(documentItems).values(
      items.map((item) => ({ ...item, documentId: doc.id }))
    );
  }

  if (installments.length) {
    await db.insert(documentInstallments).values(
      installments.map((item) => ({ ...item, documentId: doc.id }))
    );
  }

  await logActivity({
    action: "Documento criado",
    entityType: "document",
    entityId: doc.id,
    details: number,
  });

  await persistAdminDb();
  revalidatePath("/admin/documentos");
  revalidatePath("/admin");
  redirect(`/admin/documentos/${doc.id}`);
}

export async function approveDocumentAsProjectAction(documentId: number) {
  await requireSession();
  await ensureAdminReady();

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: { items: true, installments: true, client: true },
  });

  if (!doc) throw new Error("Documento não encontrado");

  const projectName =
    doc.items[0]?.name ||
    `${DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label || "Projeto"} ${doc.number}`;

  const downPayment = doc.downPayment || 0;
  const paid = Math.min(doc.total || 0, downPayment || 0);
  const progress =
    doc.total > 0 ? Math.min(100, Math.round((paid / doc.total) * 100)) : 0;

  const [project] = await db
    .insert(projects)
    .values({
      clientId: doc.clientId,
      name: projectName,
      description: doc.items.map((i) => i.name).join(", "),
      value: doc.total,
      amountPaid: paid,
      startDate: todayISO(),
      dueDate: isFlexibleDateToken(doc.deliveryDeadline)
        ? null
        : doc.deliveryDeadline,
      status: "aprovado",
      progress,
      documentId: doc.id,
      notes: doc.notes,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: projects.id });

  const now = new Date().toISOString();

  if (downPayment > 0) {
    await db.insert(receivables).values({
      clientId: doc.clientId,
      projectId: project.id,
      documentId: doc.id,
      description: `${doc.number} — Entrada`,
      amount: downPayment,
      dueDate: todayISO(),
      paymentMethod: doc.paymentMethod,
      installment: "Entrada",
      status: "pago",
      paidAt: todayISO(),
      updatedAt: now,
    });
  }

  const installmentRows =
    doc.installments.length > 0
      ? doc.installments
      : downPayment < doc.total
        ? [
            {
              number: 1,
              dueDate: isFlexibleDateToken(doc.deliveryDeadline)
                ? "definido_em_conversa"
                : doc.deliveryDeadline || "definido_em_conversa",
              amount: Math.max(doc.total - downPayment, 0),
            },
          ]
        : [];

  for (const installment of installmentRows) {
    await db.insert(receivables).values({
      clientId: doc.clientId,
      projectId: project.id,
      documentId: doc.id,
      description: `${doc.number} — parcela ${installment.number}`,
      amount: installment.amount,
      dueDate: installment.dueDate || "definido_em_conversa",
      paymentMethod: doc.paymentMethod,
      installment: `${installment.number}/${installmentRows.length}`,
      status: "pendente",
      updatedAt: now,
    });
  }

  await db
    .update(documents)
    .set({
      status: "aprovado",
      projectId: project.id,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(documents.id, documentId));

  await logActivity({
    action: "Orçamento transformado em projeto",
    entityType: "document",
    entityId: documentId,
    details: `${doc.number} → projeto #${project.id}`,
  });

  await persistAdminDb();
  revalidatePath("/admin/documentos");
  revalidatePath("/admin/projetos");
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  redirect(`/admin/projetos`);
}

export async function deleteDocumentAction(id: number) {
  await requireSession();
  await ensureAdminReady();

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });

  await db.delete(documentItems).where(eq(documentItems.documentId, id));
  await db
    .delete(documentInstallments)
    .where(eq(documentInstallments.documentId, id));
  await db.delete(documents).where(eq(documents.id, id));

  await logActivity({
    action: "Documento excluído",
    entityType: "document",
    entityId: id,
    details: doc?.number,
  });

  await persistAdminDb();
  revalidatePath("/admin/documentos");
  redirect("/admin/documentos");
}

export async function logPdfGeneratedAction(documentId: number, number: string) {
  await requireSession();
  await logActivity({
    action: "PDF gerado",
    entityType: "document",
    entityId: documentId,
    details: number,
  });
}

export async function updateDocumentPaymentAction(
  id: number,
  formData: FormData
) {
  await requireSession();
  await ensureAdminReady();

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });
  if (!doc) return;

  const trackPayments = formData.get("trackPayments") === "1" ? 1 : 0;
  const amountPaid = Math.min(
    doc.total || 0,
    Math.max(0, parseMoney(String(formData.get("amountPaid") || "0")))
  );

  await db
    .update(documents)
    .set({
      trackPayments,
      amountPaid: trackPayments ? amountPaid : 0,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(documents.id, id));

  await logActivity({
    action: trackPayments
      ? "Financeiro do documento atualizado"
      : "Acompanhamento financeiro desativado",
    entityType: "document",
    entityId: id,
    details: doc.number,
  });

  await persistAdminDb();
  revalidatePath("/admin/documentos");
  revalidatePath(`/admin/documentos/${id}`);
}
