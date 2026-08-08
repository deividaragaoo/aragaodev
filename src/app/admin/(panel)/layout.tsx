import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth/session";
import { ensureAdminReady } from "@/lib/db/ensure";

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

  return <AdminShell username={session.username}>{children}</AdminShell>;
}
