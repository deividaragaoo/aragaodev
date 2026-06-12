"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectGalleryItem } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ProjectCarouselProps {
  items: ProjectGalleryItem[];
}

export function ProjectCarousel({ items }: ProjectCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = items.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + total) % total);
    },
    [total]
  );

  useEffect(() => {
    setIndex(0);
  }, [items]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, goTo]);

  if (total === 0) return null;

  const current = items[index];
  const isContain = current.fit === "contain";

  return (
    <div className="relative">
      <div
        className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden"
        style={{ backgroundColor: current.bg ?? "#0a0a0a" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${current.src}-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              unoptimized
              quality={100}
              className={cn(
                isContain ? "object-contain p-6 sm:p-10" : "object-cover object-top"
              )}
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-background/80 border border-white/10 hover:border-white/20 active:scale-95 transition-all backdrop-blur-sm"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-background/80 border border-white/10 hover:border-white/20 active:scale-95 transition-all backdrop-blur-sm"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 px-1 pt-3">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted truncate">
          {current.caption ?? current.alt}
        </p>
        {total > 1 && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-mono text-subtle">
              {index + 1}/{total}
            </span>
            <div className="flex gap-1.5">
              {items.map((item, i) => (
                <button
                  key={`${item.src}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ir para imagem ${i + 1}`}
                  className={cn(
                    "rounded-full transition-all duration-300 min-h-[28px] min-w-[28px] flex items-center justify-center",
                    i === index ? "w-8 h-2 bg-foreground" : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
