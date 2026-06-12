"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { contact } from "@/lib/data";
import { cn } from "@/lib/utils";

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Vi o site da Aragão Dev e gostaria de fechar um projeto."
);

const messages = [
  "Vamos fechar um projeto?",
  "Posso te ajudar a tirar sua ideia do papel.",
  "Respondo rápido no WhatsApp.",
];

interface VirtualAgentProps {
  hidden?: boolean;
}

export function VirtualAgent({ hidden = false }: VirtualAgentProps) {
  const [visible, setVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [minimized, setMinimized] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
      const isDesktop = window.matchMedia("(min-width: 640px)").matches;
      if (isDesktop) setMinimized(false);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || minimized || hidden) return;

    const fullText = messages[messageIndex];
    let index = 0;
    setTypedText("");

    const typing = window.setInterval(() => {
      index += 1;
      setTypedText(fullText.slice(0, index));

      if (index >= fullText.length) {
        window.clearInterval(typing);
      }
    }, 38);

    return () => window.clearInterval(typing);
  }, [visible, minimized, messageIndex, hidden]);

  useEffect(() => {
    if (!visible || minimized || hidden) return;

    const cycle = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 7000);

    return () => window.clearInterval(cycle);
  }, [visible, minimized, hidden]);

  const whatsappUrl = `${contact.whatsapp.url}?text=${WHATSAPP_MESSAGE}`;

  if (hidden) return null;

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed z-[80] flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none"
          style={{
            bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
            right: "max(1rem, env(safe-area-inset-right, 0px))",
          }}
        >
          <AnimatePresence mode="wait">
            {!minimized && (
              <motion.div
                key="bubble"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto relative w-[min(16.5rem,calc(100vw-5.5rem))] sm:w-[min(18rem,calc(100vw-5.5rem))]"
              >
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  aria-label="Minimizar assistente"
                  className="absolute -top-2 -right-2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/10 bg-[#111] text-muted hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-3.5 sm:p-4 shadow-[0_16px_48px_rgba(0,0,0,0.55)] transition-colors duration-300 hover:border-[#25D366]/30 active:scale-[0.99]"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />
                      <span className="relative inline-flex h-full w-full rounded-full bg-[#25D366]" />
                    </span>
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-muted">
                      Assistente virtual
                    </span>
                  </div>

                  <p className="min-h-[2.25rem] sm:min-h-[2.5rem] text-left text-[13px] sm:text-sm leading-relaxed text-foreground font-light">
                    {typedText}
                    <motion.span
                      aria-hidden="true"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 bg-accent-orange"
                    />
                  </p>

                  <span className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#34eb7a] group-hover:text-[#25D366] transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Chamar no WhatsApp</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-r border-b border-white/[0.08] bg-[#0a0a0a]"
                  />
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setMinimized((current) => !current)}
            aria-label={minimized ? "Abrir assistente virtual" : "Minimizar assistente virtual"}
            className={cn(
              "pointer-events-auto relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/10 bg-[#0a0a0a] shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-accent-orange/40 active:scale-95",
              minimized && "ring-1 ring-[#25D366]/30"
            )}
            whileTap={{ scale: 0.94 }}
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-red/20 to-accent-orange/20"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent-red to-accent-orange text-white">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
            </span>
            {minimized && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-[#0a0a0a] bg-[#25D366]" />
            )}
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
