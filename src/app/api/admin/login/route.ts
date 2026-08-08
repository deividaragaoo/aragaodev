import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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
import { logActivity } from "@/lib/admin/activity";
import { ensureAdminReady } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const keywordSchema = z.object({
  keyword: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await ensureAdminReady();
    const body = (await request.json()) as Record<string, unknown>;
    const step = body.step === "keyword" ? "keyword" : "credentials";

    if (step === "credentials") {
      const parsed = credentialsSchema.safeParse({
        username: String(body.username || "").trim(),
        password: String(body.password || ""),
      });

      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, step: "credentials", error: "Preencha usuário e senha." },
          { status: 400 }
        );
      }

      const users = await db.select().from(adminUsers);
      const user = users.find(
        (row) =>
          row.username.toLowerCase() === parsed.data.username.toLowerCase()
      );

      if (
        !user ||
        !(await verifySecret(parsed.data.password, user.passwordHash))
      ) {
        return NextResponse.json(
          {
            ok: false,
            step: "credentials",
            error: "Usuário ou senha inválidos.",
          },
          { status: 401 }
        );
      }

      const token = await createChallengeToken({
        sub: String(user.id),
        username: user.username,
        stage: "keyword_required",
      });
      await setChallengeCookie(token);

      return NextResponse.json({ ok: true, step: "keyword" });
    }

    const challenge = await getChallenge();
    if (!challenge) {
      return NextResponse.json(
        {
          ok: false,
          step: "credentials",
          error: "Sessão expirada. Faça login novamente.",
        },
        { status: 401 }
      );
    }

    const parsed = keywordSchema.safeParse({
      keyword: String(body.keyword || ""),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, step: "keyword", error: "Informe a palavra-chave." },
        { status: 400 }
      );
    }

    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, Number(challenge.sub)),
    });

    if (
      !user ||
      !(await verifySecret(parsed.data.keyword, user.keywordHash))
    ) {
      return NextResponse.json(
        { ok: false, step: "keyword", error: "Palavra-chave inválida." },
        { status: 401 }
      );
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

    return NextResponse.json({ ok: true, step: "authenticated" });
  } catch (error) {
    console.error(error);
    const detail =
      error instanceof Error ? error.message : "erro desconhecido";
    return NextResponse.json(
      {
        ok: false,
        step: "credentials",
        error: `Falha ao autenticar: ${detail}`,
      },
      { status: 500 }
    );
  }
}
