"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { buildQuoteWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface ContactNamePanelProps {
  open: boolean;
  onClose: () => void;
}

export function ContactNamePanel({ open, onClose }: ContactNamePanelProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

    window.open(buildQuoteWhatsAppUrl(trimmed), "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar painel de contato"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[140] bg-black/75 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-name-panel-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-[max(1.5rem,env(safe-area-inset-top,1.5rem))] z-[141] mx-auto w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:p-6"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#ff5b1f]">
              Contato
            </p>
            <h2
              id="contact-name-panel-title"
              className="pr-10 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl"
            >
              Como podemos te chamar?
            </h2>
            <p className="mt-2 text-sm font-light leading-relaxed text-white/55">
              Informe seu nome para iniciarmos a conversa no WhatsApp com sua mensagem
              personalizada.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-[11px] font-mono uppercase tracking-[0.12em] text-white/40"
                >
                  Nome
                </label>
                <input
                  ref={inputRef}
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  className={cn(
                    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white",
                    "placeholder:text-white/30 outline-none transition-colors",
                    "focus:border-[#ff5b1f]/40 focus:bg-white/[0.05]"
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
                Entrar em contato
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
