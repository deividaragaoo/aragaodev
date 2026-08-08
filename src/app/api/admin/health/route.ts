import { NextResponse } from "next/server";
import fs from "fs";
import { getLocalDbPath } from "@/lib/db";
import { ensureAdminReady } from "@/lib/db/ensure";
import { hasDurableDb, hasDurableNeon, NEON_CLAIM_URL } from "@/lib/db/persist";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureAdminReady();
    const localPath = getLocalDbPath();
    const exists = fs.existsSync(localPath);
    const size = exists ? fs.statSync(localPath).size : 0;
    const header = exists
      ? fs.readFileSync(localPath).subarray(0, 15).toString("utf8")
      : null;

    return NextResponse.json({
      ok: true,
      durable: hasDurableDb(),
      neon: hasDurableNeon(),
      claimUrl: NEON_CLAIM_URL,
      localPath,
      exists,
      size,
      header,
      vercel: Boolean(process.env.VERCEL),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
