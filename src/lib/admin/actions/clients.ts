"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { db } from "@/lib/db";
import { ensureAdminReady } from "@/lib/db/ensure";
import { clients } from "@/lib/db/schema";
import { requireAdminSession } from "@/lib/auth/session";

const clientSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatorio"),
  company: z.string().trim().optional(),
  email: z.string().trim().email("Email invalido"),
  phone: z.string().trim().min(3, "Telefone obrigatorio"),
  documentNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.enum(["active", "archived"]).default("active"),
});

function clientValues(formData: FormData) {
  return clientSchema.parse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    email: formData.get("email"),
    phone: formData.get("phone"),
    documentNumber: formData.get("documentNumber") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
    status: formData.get("status") || "active",
  });
}

export async function createClientAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const values = clientValues(formData);
  const timestamp = new Date().toISOString();
  const [client] = await db
    .insert(clients)
    .values({
      ...values,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  await logActivity({
    session,
    entityType: "client",
    entityId: client.id,
    action: "create",
    message: `Cliente ${client.name} criado.`,
  });

  revalidatePath("/admin/clientes");
  redirect(`/admin/clientes/${client.id}`);
}

export async function updateClientAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Cliente invalido.");
  }

  const values = clientValues(formData);
  const [client] = await db
    .update(clients)
    .set({
      ...values,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(clients.id, id))
    .returning();

  await logActivity({
    session,
    entityType: "client",
    entityId: id,
    action: "update",
    message: `Cliente ${client?.name ?? id} atualizado.`,
  });

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
}

export async function archiveClientAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Cliente invalido.");
  }

  const [client] = await db
    .update(clients)
    .set({ status: "archived", updatedAt: new Date().toISOString() })
    .where(eq(clients.id, id))
    .returning();

  await logActivity({
    session,
    entityType: "client",
    entityId: id,
    action: "archive",
    message: `Cliente ${client?.name ?? id} arquivado.`,
  });

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
}
