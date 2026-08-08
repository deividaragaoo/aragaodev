"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { parseMoneyToCents } from "@/lib/admin/format";
import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ensureAdminReady } from "@/lib/db/ensure";
import { projects } from "@/lib/db/schema";

const projectSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  status: z.enum(["planning", "active", "paused", "completed", "cancelled"]),
  totalCents: z.number().int().min(0),
  startDate: z.string().trim().optional(),
  dueDate: z.string().trim().optional(),
});

function projectValues(formData: FormData) {
  return projectSchema.parse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "planning",
    totalCents: parseMoneyToCents(formData.get("total")),
    startDate: formData.get("startDate") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
}

export async function createProjectAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const values = projectValues(formData);
  const timestamp = new Date().toISOString();
  const [project] = await db
    .insert(projects)
    .values({
      ...values,
      paidCents: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  await logActivity({
    session,
    entityType: "project",
    entityId: project.id,
    action: "create",
    message: `Projeto ${project.name} criado.`,
  });

  revalidatePath("/admin/projetos");
  redirect(`/admin/projetos/${project.id}`);
}

export async function updateProjectAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Projeto invalido.");
  }

  const values = projectValues(formData);
  const completedAt =
    values.status === "completed" ? new Date().toISOString() : null;

  const [project] = await db
    .update(projects)
    .set({
      ...values,
      completedAt,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, id))
    .returning();

  await logActivity({
    session,
    entityType: "project",
    entityId: id,
    action: "update",
    message: `Projeto ${project?.name ?? id} atualizado.`,
  });

  revalidatePath("/admin/projetos");
  revalidatePath(`/admin/projetos/${id}`);
}

export async function deleteProjectAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Projeto invalido.");
  }

  await db.delete(projects).where(eq(projects.id, id));
  await logActivity({
    session,
    entityType: "project",
    entityId: id,
    action: "delete",
    message: `Projeto ${id} removido.`,
  });

  revalidatePath("/admin/projetos");
  redirect("/admin/projetos");
}
