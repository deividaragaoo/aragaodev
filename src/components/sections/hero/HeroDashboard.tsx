"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Rocket,
  Settings,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";

const navItems = ["Projetos", "Serviços", "Sobre", "Contato"];

const dashboardCards = [
  {
    label: "Performance",
    description: "Core Web Vitals otimizados",
    icon: Zap,
  },
  {
    label: "Segurança",
    description: "Proteção em cada camada",
    icon: Shield,
  },
  {
    label: "Escalabilidade",
    description: "Arquitetura preparada",
    icon: TrendingUp,
  },
];

const floatingIcons = [
  {
    id: "code",
    icon: Code2,
    className: "hero-float-a left-0 top-[18%] sm:-left-8 lg:-left-12",
    delay: 0,
  },
  {
    id: "rocket",
    icon: Rocket,
    className: "hero-float-b right-0 top-[8%] sm:-right-6 lg:-right-10",
    delay: 0.15,
  },
  {
    id: "settings",
    icon: Settings,
    className: "hero-float-c bottom-[12%] right-[6%] sm:right-0 lg:-right-8",
    delay: 0.3,
  },
];

const particles = [
  { top: "12%", left: "8%", size: 3, delay: 0 },
  { top: "24%", right: "14%", size: 2, delay: 0.4 },
  { top: "42%", left: "18%", size: 2, delay: 0.8 },
  { top: "58%", right: "22%", size: 4, delay: 1.2 },
  { top: "72%", left: "32%", size: 2, delay: 0.6 },
  { top: "84%", right: "10%", size: 3, delay: 1.0 },
  { top: "36%", left: "52%", size: 2, delay: 1.4 },
];

function ChartWidget() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 backdrop-blur-md sm:rounded-2xl sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">
          Analytics
        </span>
        <span className="text-[10px] font-semibold text-[#ff5b1f]">+24%</span>
      </div>
      <svg viewBox="0 0 220 90" className="h-[72px] w-full sm:h-[84px]" aria-hidden="true">
        <defs>
          <linearGradient id="hero-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5b1f" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff5b1f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-chart-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff7a18" />
            <stop offset="100%" stopColor="#ff3d00" />
          </linearGradient>
        </defs>
        <path
          d="M0 68 L24 58 L48 62 L72 42 L96 48 L120 30 L144 36 L168 22 L192 28 L220 12 L220 90 L0 90 Z"
          fill="url(#hero-chart-fill)"
        />
        <path
          d="M0 68 L24 58 L48 62 L72 42 L96 48 L120 30 L144 36 L168 22 L192 28 L220 12"
          fill="none"
          stroke="url(#hero-chart-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="220" cy="12" r="4" fill="#ff5b1f" />
      </svg>
    </div>
  );
}

function OrbitalRings() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 -z-[1] h-full w-full scale-[1.15] opacity-50"
      viewBox="0 0 640 560"
      aria-hidden="true"
    >
      <ellipse
        cx="320"
        cy="280"
        rx="290"
        ry="200"
        fill="none"
        stroke="rgba(255,91,31,0.18)"
        strokeWidth="1"
        strokeDasharray="2 10"
      />
      <ellipse
        cx="320"
        cy="280"
        rx="240"
        ry="165"
        fill="none"
        stroke="rgba(255,91,31,0.12)"
        strokeWidth="1"
        strokeDasharray="3 12"
      />
      <ellipse
        cx="320"
        cy="280"
        rx="185"
        ry="125"
        fill="none"
        stroke="rgba(255,91,31,0.08)"
        strokeWidth="1"
      />
      {[
        [70, 180],
        [570, 140],
        [520, 420],
        [120, 390],
        [320, 80],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="rgba(255,91,31,0.35)" />
      ))}
    </svg>
  );
}

export function HeroDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, 14]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-24, -12]), {
    stiffness: 120,
    damping: 20,
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex w-full max-w-[640px] items-center justify-center lg:mx-0 lg:justify-end"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute bottom-0 left-1/2 h-[320px] w-[480px] -translate-x-1/2 translate-y-1/4 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.35),transparent_68%)] blur-3xl" />
        <div className="absolute left-1/2 top-[45%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,91,31,0.12),transparent_70%)] blur-2xl" />
      </div>

      <OrbitalRings />

      <div className="pointer-events-none absolute inset-0 -z-[1]" aria-hidden="true">
        {particles.map((particle, i) => (
          <span
            key={i}
            className="hero-particle absolute rounded-full bg-[#ff5b1f]"
            style={{
              top: particle.top,
              left: particle.left,
              right: particle.right,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              boxShadow: "0 0 8px rgba(255,91,31,0.6)",
            }}
          />
        ))}
      </div>

      <div className="relative w-full px-2 sm:px-0 [perspective:1400px]">
        <motion.div
          style={{ rotateX, rotateY }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative [transform-style:preserve-3d]"
        >
          {floatingIcons.map(({ id, icon: Icon, className, delay }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + delay, duration: 0.5 }}
              className={`hero-float-icon absolute z-30 flex h-14 w-14 items-center justify-center rounded-full sm:h-[70px] sm:w-[70px] ${className}`}
            >
              <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={1.5} />
            </motion.div>
          ))}

          <div className="relative rounded-[28px] border border-white/[0.1] bg-[#0a0a0a] p-2 shadow-[0_40px_100px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-[36px] sm:p-2.5">
            <div className="overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#050505] sm:rounded-[28px]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5 sm:px-4 sm:py-3">
                <Image
                  src="/brand/aragaodev-logo.png"
                  alt="Aragão Dev."
                  width={508}
                  height={120}
                  className="h-5 w-auto object-contain sm:h-6"
                  priority
                />
                <div className="hidden items-center gap-3 sm:flex">
                  {navItems.map((item) => (
                    <span
                      key={item}
                      className={`text-[8px] font-medium ${
                        item === "Projetos" ? "text-white/70" : "text-white/25"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <span className="rounded-full bg-[#ff5b1f] px-2 py-0.5 text-[7px] font-semibold text-white sm:hidden">
                  Contato
                </span>
              </div>

              <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr] sm:gap-4">
                  <div className="space-y-2.5 sm:space-y-3">
                    <h3 className="text-base font-bold leading-[1.05] tracking-[-0.03em] sm:text-xl">
                      <span className="text-white">Desempenho </span>
                      <span className="text-[#ff5b1f]">em cada detalhe</span>
                    </h3>
                    <p className="max-w-[220px] text-[9px] leading-relaxed text-white/45 sm:text-[10px]">
                      Design refinado, engenharia sólida e resultados mensuráveis em cada entrega.
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff7a18] to-[#ff3d00] px-3 py-1.5 text-[8px] font-semibold text-white shadow-[0_4px_20px_rgba(255,91,31,0.35)] sm:text-[9px]">
                      Iniciar projeto
                      <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                  <ChartWidget />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {dashboardCards.map(({ label, description, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2 backdrop-blur-sm sm:p-2.5"
                    >
                      <div className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-[#ff5b1f]/10 sm:h-7 sm:w-7">
                        <Icon className="h-3 w-3 text-[#ff5b1f] sm:h-3.5 sm:w-3.5" strokeWidth={1.5} />
                      </div>
                      <p className="text-[8px] font-semibold text-white/85 sm:text-[9px]">{label}</p>
                      <p className="mt-0.5 hidden text-[7px] leading-snug text-white/35 sm:block">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.05] pt-2.5">
                  <span className="text-[8px] font-mono uppercase tracking-[0.12em] text-white/30">
                    Tecnologias modernas
                  </span>
                  <div className="flex gap-1.5">
                    {["N", "R", "T"].map((tech) => (
                      <span
                        key={tech}
                        className="flex h-5 w-5 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-[7px] font-bold text-white/40"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
