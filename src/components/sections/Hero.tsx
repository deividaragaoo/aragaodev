"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Palette,
  Rocket,
  Users,
  Zap,
} from "lucide-react";
import { type Project } from "@/lib/data";
import { HeroClients } from "@/components/sections/hero/HeroClients";
import { HeroDashboard } from "@/components/sections/hero/HeroDashboard";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const benefits = [
  { label: "UX/UI de Alto Nível", icon: Palette },
  { label: "Performance Otimizada", icon: Zap },
  { label: "Suporte Próximo", icon: Users },
  { label: "Entregas Ágeis", icon: Rocket },
];

interface HeroProps {
  onProjectSelect: (project: Project) => void;
  onRequestContact: () => void;
}

export function Hero({ onProjectSelect, onRequestContact }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-[0.08]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_75%_35%,rgba(255,90,0,0.12),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 xl:gap-16">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 sm:text-[11px] sm:tracking-[0.22em]">
                Software House • Atendimento em todo o Brasil
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em]"
            >
              <span className="text-white">Produtos digitais</span>
              <br />
              <span className="font-normal text-white/45">com padrão </span>
              <span className="hero-premium-text">premium</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 max-w-[600px] text-base font-light leading-relaxed text-white/70 sm:text-xl"
            >
              Desenvolvemos sites, sistemas e plataformas digitais para empresas
              — com design refinado e performance de elite.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <motion.button
                type="button"
                onClick={onRequestContact}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="hero-btn-primary inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all sm:text-base"
              >
                Iniciar projeto
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="#projetos"
                  className="hero-btn-secondary inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all sm:w-auto sm:text-base"
                >
                  Ver trabalhos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:justify-start xl:gap-x-6"
            >
              {benefits.map(({ label, icon: Icon }) => (
                <motion.span
                  key={label}
                  whileHover={{ y: -2 }}
                  className="group inline-flex items-center gap-1.5 text-[11px] text-white/55 transition-colors hover:text-white/80 sm:text-xs"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5b1f]/10 transition-colors group-hover:bg-[#ff5b1f]/20">
                    <Icon className="h-3 w-3 text-[#ff5b1f]" strokeWidth={2} />
                  </span>
                  {label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <HeroDashboard />
          </motion.div>
        </div>

        <HeroClients onProjectSelect={onProjectSelect} />
      </div>
    </section>
  );
}
