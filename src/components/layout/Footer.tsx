"use client";

import Link from "next/link";
import { contact, footerLinks } from "@/lib/data";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { InstagramLink } from "@/components/ui/InstagramLink";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex mb-4 sm:mb-5">
              <BrandLogo size="lg" />
            </Link>
            <p className="text-muted text-sm leading-relaxed font-light">
              Software house premium. Design refinado, código de excelência.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-subtle mb-4">
                Links
              </p>
              <ul className="space-y-1">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex min-h-[44px] sm:min-h-0 sm:py-1 items-center text-sm text-muted hover:text-foreground transition-colors font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-subtle mb-4">
                Serviços
              </p>
              <ul className="space-y-1">
                {footerLinks.services.slice(0, 4).map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex min-h-[44px] sm:min-h-0 sm:py-1 items-center text-sm text-muted hover:text-foreground transition-colors font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-subtle mb-4">
                Contato
              </p>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex min-h-[44px] sm:min-h-0 sm:py-1 items-center text-sm text-muted hover:text-foreground transition-colors font-light break-all"
                  >
                    {contact.email}
                  </a>
                </li>
                <li>
                  <WhatsAppLink />
                </li>
                <li>
                  <InstagramLink />
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="text-subtle text-xs font-light">
            © {new Date().getFullYear()} Aragão Dev
          </p>
          <p className="text-subtle text-xs font-light">
            Atendimento em todo o Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}
