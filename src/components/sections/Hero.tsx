"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contact } from "@/lib/data";
import { projects, type Project } from "@/lib/data";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface HeroProps {
  onProjectSelect: (project: Project) => void;
}

function isLightBackground(color?: string) {
  if (!color) return false;

  const hex = color.replace("#", "");
  const normalized =
    hex.length === 3 ? hex.split("").map((channel) => channel + channel).join("") : hex;

  if (normalized.length !== 6) return false;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return 0.299 * r + 0.587 * g + 0.114 * b > 180;
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
          Software House · Atendimento em todo o Brasil
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
            Experiência mobile · preferência dos clientes abaixo
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-6xl mx-auto"
      >
        <BrowserPreview onProjectSelect={onProjectSelect} />
      </motion.div>
    </section>
  );
}

function BrowserPreview({ onProjectSelect }: { onProjectSelect: (project: Project) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByCard = (direction: -1 | 1) => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.querySelector<HTMLElement>("[data-hero-card]");
    const gap = 12;
    const distance = card ? card.offsetWidth + gap : container.clientWidth * 0.75;
    container.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

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

        <div className="relative lg:static">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollLeft}
            aria-label="Projeto anterior"
            className={cn(
              "lg:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background/90 backdrop-blur-sm transition-all",
              canScrollLeft
                ? "text-foreground hover:border-white/20 active:scale-95"
                : "text-subtle opacity-40 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollRight}
            aria-label="Próximo projeto"
            className={cn(
              "lg:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background/90 backdrop-blur-sm transition-all",
              canScrollRight
                ? "text-foreground hover:border-white/20 active:scale-95"
                : "text-subtle opacity-40 pointer-events-none"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-3 py-3 lg:px-0 lg:py-0 lg:grid lg:grid-cols-6 lg:gap-px lg:overflow-visible lg:bg-white/[0.04] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                data-hero-card
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="min-w-[74%] shrink-0 snap-center sm:min-w-[46%] lg:min-w-0 lg:shrink rounded-xl lg:rounded-none overflow-hidden border border-white/[0.06] lg:border-0"
              >
                <HeroProjectCard
                  project={project}
                  onSelect={onProjectSelect}
                  priority={i === 0}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] sm:text-[11px] text-subtle font-mono mt-3 sm:mt-4 tracking-wide px-2">
        <span className="lg:hidden">Deslize ou use as setas para ver os projetos</span>
        <span className="hidden lg:inline">Clique em um projeto para ver detalhes</span>
      </p>
    </div>
  );
}

function HeroProjectCard({
  project,
  onSelect,
  priority,
}: {
  project: Project;
  onSelect: (project: Project) => void;
  priority?: boolean;
}) {
  const lightBg = isLightBackground(project.imageBg);
  const isWideLogo = project.heroImageAspect === "wide";
  const imageSrc = project.heroImage ?? project.image;

  return (
    <button
      type="button"
      onClick={() => onSelect(project)}
      className="group relative flex h-full w-full min-h-[248px] lg:min-h-[280px] flex-col overflow-hidden text-left active:opacity-95"
      style={{ backgroundColor: project.imageBg ?? "#0a0a0a" }}
      aria-label={`Ver detalhes do projeto ${project.title}`}
    >
      <div
        className={cn(
          "shrink-0 px-3 py-2.5 border-b",
          lightBg ? "border-black/[0.06]" : "border-white/[0.08]"
        )}
      >
        <p
          className={cn(
            "text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.14em] truncate",
            lightBg ? "text-zinc-500" : "text-white/55"
          )}
        >
          {project.category}
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-3 py-5 sm:px-4 sm:py-6 lg:px-3 lg:py-7 min-h-[148px]">
        <div
          className={cn(
            "relative",
            isWideLogo
              ? "h-[88px] w-[196px] sm:h-[96px] sm:w-[214px] lg:h-[104px] lg:w-[232px]"
              : "h-[112px] w-[112px] sm:h-[128px] sm:w-[128px] lg:h-[136px] lg:w-[136px]"
          )}
        >
          <Image
            src={imageSrc}
            alt={project.title}
            fill
            priority={priority}
            quality={100}
            unoptimized
            sizes="(max-width: 1024px) 128px, 136px"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100 group-active:bg-black/35 group-active:opacity-100 lg:group-active:opacity-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background">
            Ver projeto
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 border-t px-3 py-3",
          lightBg ? "border-black/[0.06]" : "border-white/[0.08]"
        )}
      >
        <p
          className={cn(
            "text-sm font-semibold tracking-[-0.02em] truncate",
            lightBg ? "text-zinc-900" : "text-white"
          )}
        >
          {project.title}
        </p>
      </div>
    </button>
  );
}
