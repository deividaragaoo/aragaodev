import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth/session";
import { ensureAdminReady } from "@/lib/db/ensure";
import { hasDurableDb, NEON_CLAIM_URL } from "@/lib/db/persist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureAdminReady();
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const usingManagedNeon =
    !process.env.TURSO_DATABASE_URL &&
    !process.env.BLOB_READ_WRITE_TOKEN &&
    !process.env.NEON_DATABASE_URL;

  return (
    <AdminShell
      username={session.username}
      storageWarning={Boolean(process.env.VERCEL) && !hasDurableDb()}
      claimUrl={usingManagedNeon ? NEON_CLAIM_URL : null}
    >
      {children}
    </AdminShell>
  );
}
