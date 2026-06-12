"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { contact, navLinks } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-[100] bg-background border-b border-white/[0.06] pt-[env(safe-area-inset-top,0px)]"
      >
        <div className="relative max-w-6xl mx-auto h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="relative z-10 shrink-0">
            <BrandLogo size="sm" />
          </Link>

          <nav
            aria-label="Principal"
            className="hidden md:flex absolute inset-x-0 top-0 h-14 sm:h-16 items-center justify-center pointer-events-none"
          >
            <ul className="flex items-center gap-8 pointer-events-auto">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 shrink-0 hidden md:block">
            <Button href={contact.whatsapp.url} variant="primary" size="sm" showArrow={false}>
              Contato
            </Button>
          </div>

          <button
            className="md:hidden relative z-10 flex h-11 w-11 items-center justify-center -mr-2 text-muted hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-[max(1rem,env(safe-area-inset-top,1rem))] left-4 right-4 z-[120] rounded-2xl border border-white/[0.08] bg-[#050505] p-5 sm:p-6 md:hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
            >
              <div className="flex justify-between items-center mb-6">
                <BrandLogo size="sm" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 w-11 items-center justify-center text-muted hover:text-foreground"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-stretch gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[48px] items-center justify-center text-lg font-light hover:text-foreground text-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  href={contact.whatsapp.url}
                  variant="primary"
                  showArrow={false}
                  fullWidth
                  className="mt-3"
                >
                  Contato
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
