"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { parseMoney } from "@/lib/admin/format";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { ensureAdminReady, persistAdminDb } from "@/lib/db/ensure";

const projectSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.coerce.number().nonnegative(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().min(1),
  progress: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function formValues(formData: FormData) {
  return {
    clientId: formData.get("clientId"),
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim() || undefined,
    value: parseMoney(String(formData.get("value") || "0")),
    startDate: String(formData.get("startDate") || "").trim() || undefined,
    dueDate: String(formData.get("dueDate") || "").trim() || undefined,
    status: String(formData.get("status") || "orcamento"),
    progress: clampProgress(Number(formData.get("progress") || 0)),
    notes: String(formData.get("notes") || "").trim() || undefined,
  };
}

export async function createProjectAction(formData: FormData) {
  await requireSession();
  await ensureAdminReady();
  const parsed = projectSchema.parse(formValues(formData));

  const [row] = await db
    .insert(projects)
    .values({
      ...parsed,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: projects.id });

  await logActivity({
    action: "Projeto criado",
    entityType: "project",
    entityId: row.id,
    details: parsed.name,
  });

  await persistAdminDb();
  revalidatePath("/admin/projetos");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  redirect("/admin/projetos");
}

export async function updateProjectAction(id: number, formData: FormData) {
  await requireSession();
  await ensureAdminReady();
  const parsed = projectSchema.parse(formValues(formData));

  await db
    .update(projects)
    .set({ ...parsed, updatedAt: new Date().toISOString() })
    .where(eq(projects.id, id));

  await logActivity({
    action: "Projeto atualizado",
    entityType: "project",
    entityId: id,
    details: parsed.name,
  });

  await persistAdminDb();
  revalidatePath("/admin/projetos");
  revalidatePath(`/admin/projetos/${id}`);
  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  redirect("/admin/projetos");
}

export async function updateProjectProgressAction(
  id: number,
  progress: number
) {
  await requireSession();
  await ensureAdminReady();

  const value = clampProgress(progress);
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  await db
    .update(projects)
    .set({
      progress: value,
      status:
        value >= 100
          ? "concluido"
          : project?.status === "concluido"
            ? "em_desenvolvimento"
            : project?.status || "em_desenvolvimento",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, id));

  await logActivity({
    action: "Andamento do projeto atualizado",
    entityType: "project",
    entityId: id,
    details: `${project?.name || `#${id}`} → ${value}%`,
  });

  await persistAdminDb();
  revalidatePath("/admin/projetos");
  revalidatePath(`/admin/projetos/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
}

export async function deleteProjectAction(id: number) {
  await requireSession();
  await ensureAdminReady();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  await db.delete(projects).where(eq(projects.id, id));

  await logActivity({
    action: "Projeto excluído",
    entityType: "project",
    entityId: id,
    details: project?.name,
  });

  await persistAdminDb();
  revalidatePath("/admin/projetos");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  redirect("/admin/projetos");
}
