"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone } from "lucide-react";
import { Button } from "./Button";
import { ProjectCarousel } from "./ProjectCarousel";
import { MobileSitePreview } from "./MobileSitePreview";
import type { Project } from "@/lib/data";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    setShowMobilePreview(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  return (
    <>
      <AnimatePresence>
        {project && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[130]"
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-3 top-[max(1rem,env(safe-area-inset-top,1rem))] bottom-[max(1rem,env(safe-area-inset-bottom,1rem))] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl z-[130] max-h-none sm:max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-background shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            >
              <div className="relative p-4 sm:p-5 border-b border-white/[0.06]">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-background/80 border border-white/10 hover:border-white/20 active:scale-95 transition-all"
                  aria-label="Fechar modal"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="mb-4 pr-12">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted mb-1">
                    {project.category}
                  </p>
                  <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.02em] leading-tight">
                    {project.title}
                  </h3>
                </div>

                <ProjectCarousel items={project.gallery} />
              </div>

              <div className="p-5 sm:p-8">
                <p className="text-muted text-sm leading-relaxed mb-5 sm:mb-6 font-light">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-[11px] font-mono text-muted border border-white/[0.06]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
                  {Object.entries(project.metrics).map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between sm:block text-left sm:text-center py-3 sm:py-4 px-4 sm:px-0 rounded-xl border border-white/[0.06]"
                    >
                      <div className="text-base sm:text-lg font-semibold tracking-[-0.02em]">{value}</div>
                      <div className="text-[10px] sm:text-[10px] font-mono text-muted uppercase tracking-wider sm:mt-1">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-5 sm:pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    showArrow={false}
                    fullWidth
                    className="sm:flex-1 flex-nowrap gap-2.5 px-5"
                    onClick={() => setShowMobilePreview(true)}
                  >
                    <Smartphone className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                    <span className="whitespace-nowrap">Ver site no celular</span>
                  </Button>
                  <Button
                    href="#contato"
                    variant="secondary"
                    showArrow={false}
                    fullWidth
                    className="sm:flex-1"
                    onClick={onClose}
                  >
                    Projeto similar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {project && (
        <MobileSitePreview
          url={project.url}
          title={project.title}
          open={showMobilePreview}
          onClose={() => setShowMobilePreview(false)}
        />
      )}
    </>
  );
}
