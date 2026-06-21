"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contact } from "@/lib/data";

interface FinalCTAProps {
  onRequestContact: () => void;
}

export function FinalCTA({ onRequestContact }: FinalCTAProps) {
  return (
    <section id="contato" className="section-padding relative scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl border border-white/[0.06] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-red/[0.04] via-transparent to-accent-orange/[0.03]" />

          <div className="relative px-5 py-12 sm:px-16 sm:py-24 lg:py-28 text-center">
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted mb-5 sm:mb-6">
              03 — Contato
            </p>

            <h2 className="text-[clamp(1.75rem,6vw,3rem)] sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.12] mb-4 sm:mb-5 max-w-2xl mx-auto">
              Vamos construir algo
              <br />
              <span className="gradient-text">extraordinário</span>
            </h2>

            <p className="text-muted text-[15px] sm:text-lg max-w-md mx-auto mb-8 sm:mb-10 font-light leading-relaxed px-1">
              Conte sua ideia. Respondemos em até 24 horas com um plano claro e orçamento sem compromisso.
            </p>

            <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={onRequestContact}
              >
                Agendar conversa
              </Button>
              <Button
                href="#projetos"
                variant="secondary"
                size="lg"
                showArrow={false}
                className="w-full sm:w-auto"
              >
                Ver portfólio
              </Button>
              <motion.a
                href={contact.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Seguir no Instagram: ${contact.instagram.display}`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex w-full sm:w-auto min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-7 py-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-white/20 hover:bg-white/[0.03] active:scale-[0.98] sm:text-base"
              >
                <Instagram className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                Instagram
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
