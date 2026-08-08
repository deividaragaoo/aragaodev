"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { hashPassword } from "@/lib/auth/password";
import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ensureAdminReady } from "@/lib/db/ensure";
import { adminUsers, companySettings } from "@/lib/db/schema";

const settingsSchema = z.object({
  companyName: z.string().trim().min(2),
  legalName: z.string().trim().min(2),
  documentNumber: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(2),
  whatsapp: z.string().trim().min(2),
  website: z.string().trim().url(),
  address: z.string().trim().min(2),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  zipCode: z.string().trim().min(2),
  defaultPaymentTerms: z.string().trim().min(2),
  defaultDocumentNotes: z.string().trim().min(2),
});

export async function updateCompanySettingsAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const id = Number(formData.get("id"));
  const values = settingsSchema.parse({
    companyName: formData.get("companyName"),
    legalName: formData.get("legalName"),
    documentNumber: formData.get("documentNumber"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    website: formData.get("website"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipCode: formData.get("zipCode"),
    defaultPaymentTerms: formData.get("defaultPaymentTerms"),
    defaultDocumentNotes: formData.get("defaultDocumentNotes"),
  });

  await db
    .update(companySettings)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(companySettings.id, id));

  await logActivity({
    session,
    entityType: "settings",
    entityId: id,
    action: "update",
    message: "Configuracoes da empresa atualizadas.",
  });

  revalidatePath("/admin/configuracoes");
}

export async function updateAdminSecurityAction(formData: FormData) {
  const session = await requireAdminSession();
  await ensureAdminReady();
  const password = String(formData.get("password") ?? "");
  const keyword = String(formData.get("keyword") ?? "");
  const update: Partial<typeof adminUsers.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };

  if (password.length > 0) {
    if (password.length < 8) {
      throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
    }
    update.passwordHash = await hashPassword(password);
  }

  if (keyword.length > 0) {
    if (keyword.length < 6) {
      throw new Error("A nova palavra-chave precisa ter pelo menos 6 caracteres.");
    }
    update.keywordHash = await hashPassword(keyword);
  }

  if (!update.passwordHash && !update.keywordHash) {
    return;
  }

  await db.update(adminUsers).set(update).where(eq(adminUsers.id, session.userId));
  await logActivity({
    session,
    entityType: "settings",
    entityId: session.userId,
    action: "security",
    message: "Credenciais administrativas atualizadas.",
  });

  revalidatePath("/admin/configuracoes");
}
