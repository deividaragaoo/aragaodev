"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  index?: string;
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  index,
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-10 sm:mb-14 lg:mb-20 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-5">
        {index && <span className="text-subtle">{index} — </span>}
        {label}
      </p>
      <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.03em] leading-[1.1] mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-muted text-base sm:text-lg leading-relaxed font-light">
          {description}
        </p>
      )}
    </motion.div>
  );
}
