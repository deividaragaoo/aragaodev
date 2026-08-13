"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { buildQuoteWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/components/providers/SitePreferences";

interface ContactNamePanelProps {
  open: boolean;
  onClose: () => void;
}

export function ContactNamePanel({ open, onClose }: ContactNamePanelProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { locale, t } = usePreferences();

  useEffect(() => {
    if (!open) {
      setName("");
      return;
    }

    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    window.open(buildQuoteWhatsAppUrl(trimmed, locale), "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={t.contactPanel.closePanel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[140] bg-black/75 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[141] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-name-panel-title"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto relative w-full max-w-md rounded-2xl border border-border bg-elevated p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-6"
            >
            <button
              type="button"
              onClick={onClose}
              aria-label={t.contactPanel.close}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#ff5b1f]">
              {t.contactPanel.kicker}
            </p>
            <h2
              id="contact-name-panel-title"
              className="pr-10 text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl"
            >
              {t.contactPanel.title}
            </h2>
            <p className="mt-2 text-sm font-light leading-relaxed text-muted">
              {t.contactPanel.body}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-[11px] font-mono uppercase tracking-[0.12em] text-subtle"
                >
                  {t.contactPanel.name}
                </label>
                <input
                  ref={inputRef}
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.contactPanel.placeholder}
                  autoComplete="name"
                  className={cn(
                    "w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-sm text-foreground",
                    "placeholder:text-muted outline-none transition-colors",
                    "focus:border-[#ff5b1f]/40 focus:bg-foreground/[0.04]"
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className={cn(
                  "hero-btn-primary inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-full px-6 py-3.5",
                  "text-sm font-semibold text-white transition-all sm:text-base",
                  "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                )}
              >
                <MessageCircle className="h-4 w-4" />
                {t.contactPanel.submit}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
