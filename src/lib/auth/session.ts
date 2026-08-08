import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_SESSION_COOKIE,
  CHALLENGE_DURATION_SECONDS,
  SESSION_DURATION_SECONDS,
  createChallengeToken,
  createSessionToken,
  verifyChallengeToken,
  verifySessionToken,
  type AdminSession,
} from "./tokens";

const secureCookie = process.env.NODE_ENV === "production";

export async function setSessionCookie(session: AdminSession) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, await createSessionToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/admin",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function setChallengeCookie(session: AdminSession) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_CHALLENGE_COOKIE, await createChallengeToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/admin",
    maxAge: CHALLENGE_DURATION_SECONDS,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  cookieStore.delete(ADMIN_CHALLENGE_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifyChallengeToken,
  verifySessionToken,
};
export type { AdminSession };
