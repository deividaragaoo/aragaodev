"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/lib/data";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectImage } from "@/components/ui/ProjectImage";

interface ProjectsProps {
  onProjectSelect: (project: Project) => void;
}

export function Projects({ onProjectSelect }: ProjectsProps) {
  return (
    <section id="projetos" className="section-padding relative scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          index="01"
          label="Trabalhos"
          title="Projetos selecionados"
          description="Experiências digitais reais entregues para marcas que exigem excelência."
        />

        <div className="space-y-4">
          {projects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-pointer"
              onClick={() => onProjectSelect(project)}
            >
              <div className="surface rounded-2xl overflow-hidden transition-all duration-500 hover:border-white/10">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div
                    className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden"
                    style={{ backgroundColor: project.imageBg ?? "#0a0a0a" }}
                  >
                    <ProjectImage
                      project={project}
                      className="transition-transform duration-700 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>

                  <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-muted mb-1.5 sm:mb-2">
                          {project.category}
                        </p>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-[-0.02em] leading-tight">
                          {project.title}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-muted group-hover:text-foreground group-hover:border-white/20 group-active:scale-95 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    <p className="text-muted text-sm leading-relaxed mb-6 font-light">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-[11px] font-mono text-muted border border-white/[0.06]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] font-mono text-subtle uppercase tracking-wider">
                      Ver galeria e detalhes →
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
