import type { Metadata } from "next";
import { AdminThemeLock } from "@/components/admin/AdminThemeLock";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminThemeLock />
      {children}
    </>
  );
}
