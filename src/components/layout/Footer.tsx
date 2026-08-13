"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { contact } from "@/lib/data";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { InstagramLink } from "@/components/ui/InstagramLink";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/components/providers/SitePreferences";

function FooterSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:mb-4">
        <span className="h-1 w-1 rounded-full bg-[#ff5b1f]/80" />
        {title}
      </p>
      {children}
    </div>
  );
}

const linkClassName =
  "flex min-h-[44px] items-center text-[15px] text-muted transition-colors hover:text-foreground sm:min-h-0 sm:py-1.5 sm:text-sm";

export function Footer({ onRequestContact }: { onRequestContact: () => void }) {
  const { t } = usePreferences();
  const companyLinks = [
    { label: t.nav.projects, href: "#projetos" },
    { label: t.nav.services, href: "#servicos" },
  ];

  return (
    <footer className="relative border-t border-border bg-background pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-[env(safe-area-inset-bottom,0px)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff5b1f]/20 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-10 sm:py-12 lg:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
            <div className="flex flex-col items-center text-center lg:max-w-sm lg:items-start lg:text-left">
              <Link href="/" className="mb-4 inline-flex sm:mb-5">
                <BrandLogo size="lg" />
              </Link>
              <p className="max-w-xs text-sm font-light leading-relaxed text-muted sm:max-w-sm">
                {t.footer.blurb}
              </p>
            </div>

            <div className="w-full md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-0 lg:gap-16">
              <FooterSection title={t.footer.links} className="hidden md:block">
                <ul className="space-y-0.5">
                  {companyLinks.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={linkClassName}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterSection>

              <FooterSection title={t.footer.services} className="hidden md:block">
                <ul className="space-y-0.5">
                  {t.footer.serviceItems.map((label) => (
                    <li key={label}>
                      <Link href="#servicos" className={linkClassName}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterSection>

              <FooterSection title={t.footer.contact} className="w-full">
                <div className="space-y-3">
                  <a
                    href={`mailto:${contact.email}`}
                    className={cn(
                      "group flex min-h-[56px] items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-all duration-300",
                      "hover:border-[#ff5b1f]/25 hover:bg-foreground/[0.04] active:scale-[0.99]"
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-[#ff5b1f] transition-colors group-hover:border-[#ff5b1f]/25">
                      <Mail className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-sm text-foreground/85 transition-colors group-hover:text-foreground">
                        {contact.email}
                      </span>
                      <span className="block text-[11px] text-subtle">{t.footer.email}</span>
                    </span>
                  </a>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1">
                    <WhatsAppLink
                      onRequestContact={onRequestContact}
                      className={cn(
                        "min-h-[56px] w-full rounded-2xl border border-border bg-surface px-4 py-3",
                        "hover:border-[#25D366]/30 hover:bg-foreground/[0.04] active:scale-[0.99]"
                      )}
                    />
                    <InstagramLink
                      className={cn(
                        "min-h-[56px] w-full rounded-2xl border border-border bg-surface px-4 py-3",
                        "hover:border-[#E4405F]/30 hover:bg-foreground/[0.04] active:scale-[0.99]"
                      )}
                    />
                  </div>
                </div>
              </FooterSection>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-5 sm:py-6">
          <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs font-light text-subtle">
              © {new Date().getFullYear()} Aragão Dev
            </p>
            <p className="text-xs font-light text-subtle">
              {t.footer.nationwide}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
