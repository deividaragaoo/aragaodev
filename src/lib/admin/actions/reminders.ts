"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/admin/activity";
import { todayISO } from "@/lib/admin/format";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { reminders } from "@/lib/db/schema";
import { ensureAdminReady, persistAdminDb } from "@/lib/db/ensure";

function revalidateReminders() {
  revalidatePath("/admin/lembretes");
  revalidatePath("/admin");
}

export async function createReminderAction(formData: FormData) {
  await requireSession();
  await ensureAdminReady();

  const title = String(formData.get("title") || "").trim();
  if (!title) {
    throw new Error("Escreva o que precisa lembrar.");
  }

  const notes = String(formData.get("notes") || "").trim() || null;
  const dueDate = String(formData.get("dueDate") || "").trim() || todayISO();

  const [row] = await db
    .insert(reminders)
    .values({
      title,
      notes,
      dueDate,
      done: 0,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: reminders.id });

  await logActivity({
    action: "Lembrete criado",
    entityType: "reminder",
    entityId: row.id,
    details: title,
  });

  await persistAdminDb();
  revalidateReminders();
  redirect("/admin/lembretes");
}

export async function toggleReminderAction(id: number) {
  await requireSession();
  await ensureAdminReady();

  const item = await db.query.reminders.findFirst({
    where: eq(reminders.id, id),
  });
  if (!item) return;

  await db
    .update(reminders)
    .set({
      done: item.done ? 0 : 1,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(reminders.id, id));

  await persistAdminDb();
  revalidateReminders();
}

export async function deleteReminderAction(id: number) {
  await requireSession();
  await ensureAdminReady();

  const item = await db.query.reminders.findFirst({
    where: eq(reminders.id, id),
  });

  await db.delete(reminders).where(eq(reminders.id, id));

  await logActivity({
    action: "Lembrete excluído",
    entityType: "reminder",
    entityId: id,
    details: item?.title,
  });

  await persistAdminDb();
  revalidateReminders();
}
