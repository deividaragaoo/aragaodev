"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { ensureAdminReady } from "@/lib/db/ensure";

const clientSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  company: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

function formValues(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    company: String(formData.get("company") || "").trim() || undefined,
    whatsapp: String(formData.get("whatsapp") || "").trim() || undefined,
    address: String(formData.get("address") || "").trim() || undefined,
    notes: String(formData.get("notes") || "").trim() || undefined,
  };
}

export async function createClientAction(formData: FormData) {
  await requireSession();
  await ensureAdminReady();
  const parsed = clientSchema.parse(formValues(formData));

  const [row] = await db
    .insert(clients)
    .values({
      ...parsed,
      document: null,
      phone: null,
      email: null,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: clients.id });

  await logActivity({
    action: "Cliente criado",
    entityType: "client",
    entityId: row.id,
    details: parsed.name,
  });

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  redirect(`/admin/clientes/${row.id}`);
}

export async function updateClientAction(id: number, formData: FormData) {
  await requireSession();
  await ensureAdminReady();
  const parsed = clientSchema.parse(formValues(formData));

  await db
    .update(clients)
    .set({
      ...parsed,
      document: null,
      phone: null,
      email: null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(clients.id, id));

  await logActivity({
    action: "Cliente alterado",
    entityType: "client",
    entityId: id,
    details: parsed.name,
  });

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  redirect(`/admin/clientes/${id}`);
}

export async function deleteClientAction(id: number) {
  await requireSession();
  await ensureAdminReady();

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, id),
  });

  await db.delete(clients).where(eq(clients.id, id));

  await logActivity({
    action: "Cliente excluído",
    entityType: "client",
    entityId: id,
    details: client?.name,
  });

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  redirect("/admin/clientes");
}
