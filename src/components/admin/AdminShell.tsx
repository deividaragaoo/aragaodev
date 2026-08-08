"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/admin/constants";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function AdminShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,59,59,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,107,53,0.12),transparent_30%)]" />
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-black/50 p-6 backdrop-blur-xl lg:block">
        <Link href="/admin" className="mb-8 block">
          <BrandLogo size="md" />
        </Link>
        <nav className="grid gap-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white",
                  active &&
                    "bg-gradient-to-r from-red-500/20 to-orange-500/15 text-orange-100 ring-1 ring-orange-400/20",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Logado como
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{username}</p>
          <form action={logoutAction} className="mt-4">
            <button
              className="inline-flex items-center gap-2 text-sm text-orange-200 hover:text-orange-100"
              type="submit"
            >
              <LogOut size={16} /> Sair
            </button>
          </form>
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 p-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <BrandLogo size="sm" />
          <form action={logoutAction}>
            <button className="text-sm text-orange-200" type="submit">
              Sair
            </button>
          </form>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-300"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="px-4 py-8 lg:ml-72 lg:px-10">{children}</main>
    </div>
  );
}
