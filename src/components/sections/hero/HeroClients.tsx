"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { projects, type Project } from "@/lib/data";
import { cn } from "@/lib/utils";

interface HeroClientsProps {
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

function getCardLogo(project: Project) {
  if (project.id === "emporio-motors") {
    return "/projects/emporio-motors-card-logo.svg";
  }

  return project.image;
}

export function HeroClients({ onProjectSelect }: HeroClientsProps) {
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

    const card = container.querySelector<HTMLElement>("[data-client-card]");
    const gap = 12;
    const distance = card ? card.offsetWidth + gap : container.clientWidth * 0.75;
    container.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-16 w-full max-w-6xl sm:mt-20 lg:mt-24"
    >
      <div className="mb-5 flex items-center gap-2 sm:mb-6">
        <Star className="h-3.5 w-3.5 fill-[#ff5b1f] text-[#ff5b1f]" strokeWidth={1.5} />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff5b1f] sm:text-[11px]">
          Experiência que gera resultados
        </p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={!canScrollLeft}
          aria-label="Cliente anterior"
          className={cn(
            "absolute -left-1 top-[calc(50%-12px)] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a0a]/95 text-white/70 backdrop-blur-sm transition-all sm:flex lg:-left-5",
            canScrollLeft
              ? "hover:border-[#ff5b1f]/30 hover:text-white"
              : "pointer-events-none opacity-30"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={!canScrollRight}
          aria-label="Próximo cliente"
          className={cn(
            "absolute -right-1 top-[calc(50%-12px)] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a0a]/95 text-white/70 backdrop-blur-sm transition-all sm:flex lg:-right-5",
            canScrollRight
              ? "hover:border-[#ff5b1f]/30 hover:text-white"
              : "pointer-events-none opacity-30"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex justify-start gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 lg:justify-center lg:overflow-x-visible [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((project, index) => {
            const lightBg = isLightBackground(project.imageBg);
            const imageSrc = getCardLogo(project);
            const isWideLogo =
              project.id === "emporio-motors" || project.heroImageAspect === "wide";

            return (
              <motion.button
                key={project.id}
                type="button"
                data-client-card
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.06, duration: 0.5 }}
                onClick={() => onProjectSelect(project)}
                className="group flex h-[148px] min-w-[132px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff5b1f]/30 hover:shadow-[0_16px_40px_rgba(255,91,31,0.1)] sm:h-[156px] sm:min-w-[148px] lg:shrink"
                style={{ backgroundColor: project.imageBg ?? "#0a0a0a" }}
                aria-label={`Ver detalhes do projeto ${project.title}`}
              >
                <div className="flex flex-1 items-center justify-center px-3 pt-3 sm:px-4 sm:pt-4">
                  <div
                    className={cn(
                      "relative flex items-center justify-center",
                      isWideLogo
                        ? "h-11 w-[88px] sm:h-12 sm:w-[96px]"
                        : "h-14 w-14 sm:h-[60px] sm:w-[60px]"
                    )}
                  >
                    <Image
                      src={imageSrc}
                      alt={project.title}
                      fill
                      quality={100}
                      unoptimized
                      sizes="148px"
                      className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </div>

                <p
                  className={cn(
                    "px-3 pb-3 text-left text-[11px] font-medium tracking-[-0.01em] sm:px-3.5 sm:pb-3.5 sm:text-xs",
                    lightBg ? "text-zinc-800" : "text-white/75"
                  )}
                >
                  {project.title}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
