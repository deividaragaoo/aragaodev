import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "aragao_admin_session";
export const ADMIN_CHALLENGE_COOKIE = "aragao_admin_challenge";

export const SESSION_DURATION_SECONDS = 60 * 60 * 8;
export const CHALLENGE_DURATION_SECONDS = 60 * 10;

export type AdminSession = {
  userId: number;
  username: string;
};

type SessionPayload = AdminSession & {
  stage: "session";
};

type ChallengePayload = AdminSession & {
  stage: "keyword";
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: AdminSession) {
  return new SignJWT({ ...session, stage: "session" } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function createChallengeToken(session: AdminSession) {
  return new SignJWT({ ...session, stage: "keyword" } satisfies ChallengePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CHALLENGE_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (payload.stage !== "session") {
      return null;
    }

    return {
      userId: Number(payload.userId),
      username: String(payload.username),
    } satisfies AdminSession;
  } catch {
    return null;
  }
}

export async function verifyChallengeToken(token?: string | null) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (payload.stage !== "keyword") {
      return null;
    }

    return {
      userId: Number(payload.userId),
      username: String(payload.username),
    } satisfies AdminSession;
  } catch {
    return null;
  }
}
