"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  FolderKanban,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ADMIN_NAV } from "@/lib/admin/constants";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const icons = {
  LayoutDashboard,
  Users,
  FolderKanban,
  Wallet,
  FileText,
  History,
  Settings,
};

export function AdminShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_50%_at_10%_0%,rgba(255,107,53,0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_10%,rgba(255,59,59,0.08),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1440px]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/[0.06] bg-[#070707]/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col px-4 py-5">
            <div className="mb-8 flex items-center justify-between px-2">
              <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                <BrandLogo className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                className="rounded-lg p-2 text-muted hover:text-foreground lg:hidden"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff6b35]">
              Painel interno
            </p>

            <nav className="flex-1 space-y-1">
              {ADMIN_NAV.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons];
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      active
                        ? "bg-gradient-to-r from-[#ff7a18]/15 to-[#ff3d00]/10 text-foreground"
                        : "text-muted hover:bg-white/[0.03] hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <div className="mb-3 px-3">
                <p className="text-xs text-muted">Conectado como</p>
                <p className="text-sm font-medium">{username}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-white/[0.03] hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[#050505]/80 px-4 py-3 backdrop-blur-xl lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-white/10 p-2 text-muted hover:text-foreground"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <BrandLogo className="h-7 w-auto" />
            <div className="w-9" />
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
