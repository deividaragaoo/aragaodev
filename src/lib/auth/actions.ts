"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureAdminReady } from "@/lib/db/ensure";
import { adminUsers } from "@/lib/db/schema";
import { verifyPassword } from "./password";
import {
  ADMIN_CHALLENGE_COOKIE,
  clearAuthCookies,
  setChallengeCookie,
  setSessionCookie,
  verifyChallengeToken,
} from "./session";
import { cookies } from "next/headers";

export type AuthActionState = {
  ok: boolean;
  step: "password" | "keyword";
  message?: string;
  username?: string;
};

const credentialsSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

const keywordSchema = z.object({
  keyword: z.string().min(1),
});

export async function loginWithCredentials(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  await ensureAdminReady();

  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      step: "password",
      message: "Informe usuário e senha.",
    };
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, parsed.data.username))
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return {
      ok: false,
      step: "password",
      message: "Credenciais inválidas.",
      username: parsed.data.username,
    };
  }

  await setChallengeCookie({
    userId: user.id,
    username: user.username,
  });

  return {
    ok: true,
    step: "keyword",
    message: "Senha confirmada. Informe a palavra-chave.",
    username: user.username,
  };
}

export async function loginWithKeyword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  await ensureAdminReady();

  const cookieStore = await cookies();
  const challenge = await verifyChallengeToken(
    cookieStore.get(ADMIN_CHALLENGE_COOKIE)?.value,
  );

  if (!challenge) {
    return {
      ok: false,
      step: "password",
      message: "Sua etapa de segurança expirou. Faça login novamente.",
    };
  }

  const parsed = keywordSchema.safeParse({
    keyword: formData.get("keyword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      step: "keyword",
      message: "Informe a palavra-chave.",
      username: challenge.username,
    };
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, challenge.userId))
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.keyword, user.keywordHash))) {
    return {
      ok: false,
      step: "keyword",
      message: "Palavra-chave inválida.",
      username: challenge.username,
    };
  }

  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(adminUsers.id, user.id));

  await setSessionCookie({
    userId: user.id,
    username: user.username,
  });

  cookieStore.delete(ADMIN_CHALLENGE_COOKIE);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect("/admin/login");
}
