import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "aragao_admin_session";
export const CHALLENGE_COOKIE = "aragao_admin_challenge";

const SESSION_TTL = "7d";
const CHALLENGE_TTL = "10m";

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    // Deterministic fallback so login works even before env is configured.
    "aragao-dev-admin-session-secret-fallback-32chars";
  if (secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set and at least 32 characters."
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  username: string;
  stage: "authenticated";
};

export type ChallengePayload = {
  sub: string;
  username: string;
  stage: "keyword_required";
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

export async function createChallengeToken(payload: ChallengePayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(CHALLENGE_TTL)
    .sign(getSecret());
}

export async function verifyToken<T>(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as T & { exp?: number; iat?: number };
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function setChallengeCookie(token: string) {
  const jar = await cookies();
  jar.set(CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(CHALLENGE_COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken<SessionPayload>(token);
    if (payload.stage !== "authenticated") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getChallenge() {
  const jar = await cookies();
  const token = jar.get(CHALLENGE_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken<ChallengePayload>(token);
    if (payload.stage !== "keyword_required") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
