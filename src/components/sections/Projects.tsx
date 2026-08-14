"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/lib/data";
import { usePreferences } from "@/components/providers/SitePreferences";
import { getProjectCopy, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const displaySerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  display: "swap",
});

interface ProjectsProps {
  onProjectSelect: (project: Project) => void;
}

const FEATURED_ID = "gl-emporio";

const copy = {
  pt: {
    index: "01",
    label: "Trabalhos",
    title: ["Projetos que", "falam por si."],
    subtitle:
      "Experiências digitais desenvolvidas para marcas e negócios reais.",
    countLabel: "projetos",
    viewProject: "Ver projeto",
    viewAll: "Ver todos os projetos",
    shorts: {
      "gl-emporio":
        "Distribuidora premium de bebidas com experiência de compra completa, ofertas exclusivas e integração WhatsApp.",
      "partiu-pizza":
        "Delivery de pizzas com cardápio digital e pedidos no mobile.",
      "pizzaria-carioca":
        "Cardápio digital premium para pizzaria tradicional.",
      "pierre-onassis":
        "Landing page cinematográfica para produtor musical.",
      "bruno-toquinho":
        "Presença digital para compositor e produtor musical.",
      "mana-pizzaria":
        "Painel interno para gestão de pedidos e operação.",
      "emporio-motors":
        "Site institucional para concessionária de veículos de luxo.",
    } as Record<string, string>,
  },
  en: {
    index: "01",
    label: "Work",
    title: ["Projects that", "speak for themselves."],
    subtitle: "Digital experiences built for real brands and businesses.",
    countLabel: "projects",
    viewProject: "View project",
    viewAll: "View all projects",
    shorts: {
      "gl-emporio":
        "Premium beverage distributor with a complete shopping experience, exclusive deals, and WhatsApp integration.",
      "partiu-pizza":
        "Pizza delivery with a digital menu and mobile ordering.",
      "pizzaria-carioca":
        "Premium digital menu for a traditional pizzeria.",
      "pierre-onassis":
        "Cinematic landing page for a music producer.",
      "bruno-toquinho":
        "Digital presence for a composer and music producer.",
      "mana-pizzaria":
        "Internal dashboard for orders and operations.",
      "emporio-motors":
        "Institutional site for a luxury car dealership.",
    } as Record<string, string>,
  },
} as const;

function getCaseVisual(project: Project) {
  const shot = project.gallery[0];
  if (shot) {
    return {
      src: shot.src,
      alt: shot.alt || project.title,
      cover: shot.fit !== "contain",
      bg: shot.bg ?? project.imageBg ?? "#0a0a0a",
    };
  }

  return {
    src: project.image,
    alt: project.title,
    cover: project.imageFit !== "contain",
    bg: project.imageBg ?? "#0a0a0a",
  };
}

function getShort(project: Project, locale: Locale) {
  return copy[locale].shorts[project.id] ?? project.description;
}

export function Projects({ onProjectSelect }: ProjectsProps) {
  const { locale } = usePreferences();
  const t = copy[locale];
  const featured =
    projects.find((project) => project.id === FEATURED_ID) ?? projects[0];
  const rest = projects.filter((project) => project.id !== featured.id);

  return (
    <section id="projetos" className="section-padding relative scroll-mt-20">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16 lg:mb-20"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            <span className="text-[#ff5b1f]">{t.index}</span>
            <span className="mx-3 text-subtle">—</span>
            {String(projects.length).padStart(2, "0")} {t.countLabel}
          </p>

          <SectionName>{t.label}</SectionName>

          <p className="mt-5 text-[clamp(1.15rem,2.2vw,1.6rem)] font-medium leading-snug tracking-[-0.025em]">
            {t.title[0]} {t.title[1]}
          </p>
          <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-muted sm:text-base">
            {t.subtitle}
          </p>
        </motion.header>

        <FeaturedCard
          project={featured}
          locale={locale}
          cta={t.viewProject}
          onSelect={onProjectSelect}
        />

        <div
          id="projetos-lista"
          className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {rest.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              cta={t.viewProject}
              index={index}
              onSelect={onProjectSelect}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-12 flex justify-center sm:mt-16"
        >
          <a
            href="#projetos-lista"
            className="group inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors duration-300 hover:text-foreground"
          >
            {t.viewAll}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function SectionName({ children }: { children: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-5 flex flex-col items-center">
      <motion.h2
        className={cn(
          displaySerif.className,
          "text-center text-[clamp(2rem,4.6vw,3.15rem)] not-italic leading-none tracking-[-0.02em] text-foreground"
        )}
        style={
          reduceMotion
            ? undefined
            : {
                backgroundImage:
                  "linear-gradient(100deg, var(--foreground) 0%, var(--foreground) 44%, #ffc4a4 48.5%, #ff5b1f 50%, #ffc4a4 51.5%, var(--foreground) 56%, var(--foreground) 100%)",
                backgroundSize: "240% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }
        }
        animate={
          reduceMotion
            ? undefined
            : { backgroundPosition: ["120% 50%", "-20% 50%"] }
        }
        transition={{
          duration: 2.8,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.h2>
      <span aria-hidden className="mt-4 block h-px w-8 bg-[#ff5b1f]" />
    </div>
  );
}

function FeaturedCard({
  project,
  locale,
  cta,
  onSelect,
}: {
  project: Project;
  locale: Locale;
  cta: string;
  onSelect: (project: Project) => void;
}) {
  const visual = getCaseVisual(project);
  const category =
    getProjectCopy(project.id, locale)?.category ?? project.category;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => onSelect(project)}
        className={cn(
          "group relative grid w-full overflow-hidden rounded-[28px] border border-border bg-elevated text-left",
          "shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-transform duration-500 ease-out",
          "hover:-translate-y-1",
          "lg:grid-cols-[1.55fr_0.95fr]"
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(255,91,31,0.18)",
          }}
        />
        <div
          className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[460px]"
          style={{ backgroundColor: visual.bg }}
        >
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            unoptimized
            quality={100}
            priority
            sizes="(max-width: 1024px) 100vw, 62vw"
            className={cn(
              visual.cover
                ? "object-cover object-center"
                : "object-contain p-10",
              "transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            )}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/20" />
        </div>

        <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-12">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff5b1f] sm:text-[11px]">
            {category}
          </p>
          <h3 className="text-[clamp(1.85rem,3.4vw,3rem)] font-semibold uppercase leading-[0.95] tracking-[-0.04em]">
            {project.title}
          </h3>
          <p className="mt-5 max-w-sm text-sm font-light leading-relaxed text-muted sm:text-[15px]">
            {getShort(project, locale)}
          </p>
          <span className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
            {cta}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </button>
    </motion.article>
  );
}

function ProjectCard({
  project,
  locale,
  cta,
  index,
  onSelect,
}: {
  project: Project;
  locale: Locale;
  cta: string;
  index: number;
  onSelect: (project: Project) => void;
}) {
  const visual = getCaseVisual(project);
  const category =
    getProjectCopy(project.id, locale)?.category ?? project.category;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.24),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(project)}
        className="group flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-border bg-elevated text-left transition-transform duration-500 ease-out hover:-translate-y-1"
      >
        <div
          className="relative aspect-[16/10] overflow-hidden"
          style={{ backgroundColor: visual.bg }}
        >
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            unoptimized
            quality={100}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              visual.cover
                ? "object-cover object-center"
                : "object-contain p-8",
              "transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            )}
          />
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
        </div>

        <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff5b1f]">
                {category}
              </p>
              <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                {project.title}
              </h3>
            </div>
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-all duration-300 group-hover:border-[#ff5b1f]/35 group-hover:text-foreground">
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
          <p className="line-clamp-2 text-sm font-light leading-relaxed text-muted">
            {getShort(project, locale)}
          </p>
          <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            {cta} →
          </span>
        </div>
      </button>
    </motion.article>
  );
}
