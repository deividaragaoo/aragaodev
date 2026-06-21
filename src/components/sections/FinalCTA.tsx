"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { InstagramLink } from "@/components/ui/InstagramLink";

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

            <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
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
            </div>

            <div className="mt-8 flex w-full flex-col items-center gap-4">
              <div className="h-px w-12 bg-white/10" aria-hidden="true" />
              <InstagramLink
                align="center"
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 hover:border-[#E4405F]/30 hover:bg-white/[0.04]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
