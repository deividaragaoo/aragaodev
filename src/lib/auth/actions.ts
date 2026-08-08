"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySecret } from "@/lib/auth/password";
import {
  clearAuthCookies,
  createChallengeToken,
  createSessionToken,
  getChallenge,
  setChallengeCookie,
  setSessionCookie,
} from "@/lib/auth/session";
import { ensureAdminReady } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { logActivity } from "@/lib/admin/activity";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const keywordSchema = z.object({
  keyword: z.string().min(1),
});

export type AuthState = {
  ok: boolean;
  step?: "credentials" | "keyword";
  error?: string;
};

export async function loginWithCredentials(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    await ensureAdminReady();

    const parsed = credentialsSchema.safeParse({
      username: String(formData.get("username") || "").trim(),
      password: String(formData.get("password") || ""),
    });

    if (!parsed.success) {
      return { ok: false, step: "credentials", error: "Preencha usuário e senha." };
    }

    const users = await db.select().from(adminUsers);
    const user = users.find(
      (row) =>
        row.username.toLowerCase() === parsed.data.username.toLowerCase()
    );

    if (!user || !(await verifySecret(parsed.data.password, user.passwordHash))) {
      return { ok: false, step: "credentials", error: "Usuário ou senha inválidos." };
    }

    const token = await createChallengeToken({
      sub: String(user.id),
      username: user.username,
      stage: "keyword_required",
    });
    await setChallengeCookie(token);

    return { ok: true, step: "keyword" };
  } catch (error) {
    console.error(error);
    const detail =
      error instanceof Error ? error.message : "erro desconhecido";
    return {
      ok: false,
      step: "credentials",
      error: `Falha ao autenticar: ${detail}`,
    };
  }
}

export async function loginWithKeyword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    await ensureAdminReady();

    const challenge = await getChallenge();
    if (!challenge) {
      return {
        ok: false,
        step: "credentials",
        error: "Sessão expirada. Faça login novamente.",
      };
    }

    const parsed = keywordSchema.safeParse({
      keyword: formData.get("keyword"),
    });

    if (!parsed.success) {
      return { ok: false, step: "keyword", error: "Informe a palavra-chave." };
    }

    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, Number(challenge.sub)),
    });

    if (!user || !(await verifySecret(parsed.data.keyword, user.keywordHash))) {
      return { ok: false, step: "keyword", error: "Palavra-chave inválida." };
    }

    const sessionToken = await createSessionToken({
      sub: String(user.id),
      username: user.username,
      stage: "authenticated",
    });

    await clearAuthCookies();
    await setSessionCookie(sessionToken);
    await logActivity({
      action: "Login realizado",
      entityType: "admin",
      entityId: user.id,
      details: user.username,
    });
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      step: "keyword",
      error: "Falha ao validar palavra-chave.",
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect("/admin/login");
}
