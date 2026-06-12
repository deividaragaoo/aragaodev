"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "surface rounded-2xl p-6 lg:p-8 transition-colors duration-300 hover:border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}
