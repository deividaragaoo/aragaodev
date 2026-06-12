"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contact } from "@/lib/data";
import { projects, type Project } from "@/lib/data";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface HeroProps {
  onProjectSelect: (project: Project) => void;
}

function isLightBackground(color?: string) {
  return color?.toLowerCase() === "#ffffff" || color?.toLowerCase() === "#fff";
}

export function Hero({ onProjectSelect }: HeroProps) {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
      <div className="absolute inset-0 grid-pattern grid-fade opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(900px,100vw)] h-[500px] bg-accent-red/[0.04] rounded-full blur-[120px]" />

      <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.25em] text-muted mb-5 sm:mb-6"
        >
          Software House · Feira de Santana
        </motion.p>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2rem,8vw,4.5rem)] font-semibold tracking-[-0.04em] leading-[1.08] mb-4 sm:mb-5 w-full"
        >
          Produtos digitais
          <br />
          <span className="text-muted font-light">com padrão </span>
          <span className="gradient-text">premium</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted text-[15px] sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto font-light text-balance px-1"
        >
          Desenvolvemos sites, sistemas e plataformas digitais para empresas
          — com design refinado e performance de elite.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-6 w-full max-w-md sm:max-w-none mx-auto"
        >
          <Button href={contact.whatsapp.url} variant="primary" size="lg" fullWidth className="sm:w-auto">
            Iniciar projeto
          </Button>
          <Button href="#projetos" variant="secondary" size="lg" showArrow={false} fullWidth className="sm:w-auto">
            Ver trabalhos
          </Button>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8 sm:mb-10 max-w-full"
        >
          <Smartphone className="w-3.5 h-3.5 text-accent-orange shrink-0" strokeWidth={1.5} />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.12em] text-muted text-center">
            Sites focados no formato mobile
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl mx-auto"
        >
          <BrowserPreview onProjectSelect={onProjectSelect} />
        </motion.div>
      </div>
    </section>
  );
}

function BrowserPreview({ onProjectSelect }: { onProjectSelect: (project: Project) => void }) {
  return (
    <div className="relative w-full mx-auto">
      <div className="surface rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 items-center px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/[0.06]">
          <div className="flex gap-1 sm:gap-1.5 justify-start">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/10" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/10" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex justify-center min-w-0">
            <div className="px-2 sm:px-4 py-1 rounded-md bg-white/[0.03] border border-white/[0.04] max-w-full">
              <span className="text-[9px] sm:text-[11px] text-subtle font-mono truncate block">aragaodev.com</span>
            </div>
          </div>
          <div aria-hidden="true" />
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory p-3 sm:p-0 sm:grid sm:grid-cols-3 sm:gap-px sm:overflow-visible sm:bg-white/[0.04] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((project, i) => {
            const lightBg = isLightBackground(project.imageBg);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="min-w-[78%] shrink-0 snap-center sm:min-w-0 sm:shrink rounded-xl sm:rounded-none overflow-hidden border border-white/[0.06] sm:border-0"
              >
                <button
                  type="button"
                  onClick={() => onProjectSelect(project)}
                  className="group relative block w-full aspect-[4/3] overflow-hidden text-left active:opacity-90"
                  style={{ backgroundColor: project.imageBg ?? "#0a0a0a" }}
                  aria-label={`Ver detalhes do projeto ${project.title}`}
                >
                  <ProjectImage
                    project={project}
                    variant="hero"
                    sizes="(max-width: 640px) 78vw, (max-width: 768px) 33vw, 400px"
                    priority={i === 0}
                    className="transition-transform duration-500 group-hover:scale-[1.03] group-active:scale-[1.02]"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 group-active:bg-black/40 transition-colors duration-300 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 group-active:opacity-100 sm:group-active:opacity-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-[11px] font-medium">
                      Ver projeto
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>

                  <div
                    className={cn(
                      "absolute bottom-0 inset-x-0 p-3 sm:group-hover:opacity-0 transition-opacity duration-300",
                      lightBg
                        ? "bg-gradient-to-t from-white via-white/80 to-transparent"
                        : "bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                    )}
                  >
                    <p
                      className={cn(
                        "text-[10px] font-mono uppercase tracking-wider mb-0.5",
                        lightBg ? "text-zinc-500" : "text-white/60"
                      )}
                    >
                      {project.category}
                    </p>
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-medium truncate",
                        lightBg ? "text-zinc-900" : "text-white"
                      )}
                    >
                      {project.title}
                    </p>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-[10px] sm:text-[11px] text-subtle font-mono mt-3 sm:mt-4 tracking-wide px-2">
        Deslize ou toque para ver detalhes do projeto
      </p>
    </div>
  );
}
