"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { hashSecret, verifySecret } from "@/lib/auth/password";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { adminUsers, companySettings } from "@/lib/db/schema";
import { ensureAdminReady } from "@/lib/db/ensure";

export async function updateCompanySettingsAction(formData: FormData) {
  await requireSession();
  await ensureAdminReady();

  const values = {
    name: String(formData.get("name") || "Aragão Dev").trim(),
    tagline: String(formData.get("tagline") || "Sistemas Sob Medida").trim(),
    document: String(formData.get("document") || "").trim() || null,
    address: String(formData.get("address") || "").trim() || null,
    whatsapp: String(formData.get("whatsapp") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    instagram: String(formData.get("instagram") || "").trim() || null,
    website: String(formData.get("website") || "").trim() || null,
    bankInfo: String(formData.get("bankInfo") || "").trim() || null,
    logoPath: String(formData.get("logoPath") || "/brand/aragaodev-logo.png").trim(),
    updatedAt: new Date().toISOString(),
  };

  const existing = await db.query.companySettings.findFirst();
  if (existing) {
    await db
      .update(companySettings)
      .set(values)
      .where(eq(companySettings.id, existing.id));
  } else {
    await db.insert(companySettings).values(values);
  }

  await logActivity({
    action: "Configurações atualizadas",
    entityType: "settings",
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/documentos");
}

const securitySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).optional().or(z.literal("")),
  newKeyword: z.string().min(4).optional().or(z.literal("")),
});

export type SecurityState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function updateSecurityAction(
  _prev: SecurityState,
  formData: FormData
): Promise<SecurityState> {
  try {
    const session = await requireSession();
    await ensureAdminReady();

    const parsed = securitySchema.parse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      newKeyword: formData.get("newKeyword"),
    });

    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, Number(session.sub)),
    });

    if (!user || !(await verifySecret(parsed.currentPassword, user.passwordHash))) {
      return { ok: false, error: "Senha atual inválida." };
    }

    if (!parsed.newPassword && !parsed.newKeyword) {
      return { ok: false, error: "Informe a nova senha e/ou palavra-chave." };
    }

    await db
      .update(adminUsers)
      .set({
        passwordHash: parsed.newPassword
          ? await hashSecret(parsed.newPassword)
          : user.passwordHash,
        keywordHash: parsed.newKeyword
          ? await hashSecret(parsed.newKeyword)
          : user.keywordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(adminUsers.id, user.id));

    await logActivity({
      action: "Credenciais atualizadas",
      entityType: "admin",
      entityId: user.id,
    });

    return { ok: true, message: "Segurança atualizada com sucesso." };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Não foi possível atualizar as credenciais." };
  }
}
