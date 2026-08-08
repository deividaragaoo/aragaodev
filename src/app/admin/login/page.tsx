import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
