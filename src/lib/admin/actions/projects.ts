"use server";

import { and, desc, eq } from "drizzle-orm";
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
  amountPaid: z.coerce.number().nonnegative(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().min(1),
  notes: z.string().optional(),
});

function clampMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
}

function paymentProgress(value: number, amountPaid: number) {
  if (value <= 0) return amountPaid > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round((amountPaid / value) * 100)));
}

function formValues(formData: FormData) {
  const value = clampMoney(parseMoney(String(formData.get("value") || "0")));
  const amountPaid = clampMoney(
    Math.min(value, parseMoney(String(formData.get("amountPaid") || "0")))
  );

  return {
    clientId: formData.get("clientId"),
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim() || undefined,
    value,
    amountPaid,
    startDate: String(formData.get("startDate") || "").trim() || undefined,
    dueDate: String(formData.get("dueDate") || "").trim() || undefined,
    status: String(formData.get("status") || "orcamento"),
    notes: String(formData.get("notes") || "").trim() || undefined,
  };
}

function revalidateProjectPaths(id?: number) {
  revalidatePath("/admin/projetos");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/projetos/${id}`);
}

export async function createProjectAction(formData: FormData) {
  await requireSession();
  await ensureAdminReady();
  const parsed = projectSchema.parse(formValues(formData));
  const progress = paymentProgress(parsed.value, parsed.amountPaid);

  // Guard against double-submit creating duplicate projects.
  const recent = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.clientId, parsed.clientId),
        eq(projects.name, parsed.name)
      )
    )
    .orderBy(desc(projects.createdAt))
    .limit(1);

  const latest = recent[0];
  if (latest) {
    const createdAtMs = Date.parse(
      latest.createdAt.includes("T")
        ? latest.createdAt
        : latest.createdAt.replace(" ", "T") + "Z"
    );
    const sameValue = Math.abs((latest.value || 0) - parsed.value) < 0.01;
    if (
      sameValue &&
      Number.isFinite(createdAtMs) &&
      Date.now() - createdAtMs < 15_000
    ) {
      revalidateProjectPaths(latest.id);
      redirect("/admin/projetos");
    }
  }

  const [row] = await db
    .insert(projects)
    .values({
      ...parsed,
      progress,
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
  revalidateProjectPaths(row.id);
  redirect("/admin/projetos");
}

export async function updateProjectAction(id: number, formData: FormData) {
  await requireSession();
  await ensureAdminReady();
  const parsed = projectSchema.parse(formValues(formData));
  const progress = paymentProgress(parsed.value, parsed.amountPaid);

  await db
    .update(projects)
    .set({
      ...parsed,
      progress,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, id));

  await logActivity({
    action: "Projeto atualizado",
    entityType: "project",
    entityId: id,
    details: parsed.name,
  });

  await persistAdminDb();
  revalidateProjectPaths(id);
  redirect("/admin/projetos");
}

export async function updateProjectPaidAction(id: number, amountPaid: number) {
  await requireSession();
  await ensureAdminReady();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  if (!project) return;

  const paid = clampMoney(Math.min(project.value || 0, amountPaid));
  const progress = paymentProgress(project.value || 0, paid);

  await db
    .update(projects)
    .set({
      amountPaid: paid,
      progress,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, id));

  await logActivity({
    action: "Pagamento do projeto atualizado",
    entityType: "project",
    entityId: id,
    details: `${project.name || `#${id}`} → pago ${paid}`,
  });

  await persistAdminDb();
  revalidateProjectPaths(id);
}

/** @deprecated use updateProjectPaidAction */
export async function updateProjectProgressAction(
  id: number,
  progress: number
) {
  await requireSession();
  await ensureAdminReady();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  if (!project) return;

  const pct = Math.min(100, Math.max(0, Math.round(progress)));
  const paid = clampMoney(((project.value || 0) * pct) / 100);
  await updateProjectPaidAction(id, paid);
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
  revalidateProjectPaths();
  redirect("/admin/projetos");
}
