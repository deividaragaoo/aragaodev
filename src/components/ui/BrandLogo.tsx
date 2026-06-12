"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "nav";
}

function BrandMark({ className }: { className?: string }) {
  const id = useId();
  const leftGrad = `brand-a-left-${id}`;
  const swooshGrad = `brand-a-swoosh-${id}`;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={leftGrad} x1="8" y1="8" x2="8" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff3b3b" />
          <stop offset="1" stopColor="#ff6b35" />
        </linearGradient>
        <linearGradient id={swooshGrad} x1="20" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6b35" />
          <stop offset="1" stopColor="#ffb347" />
        </linearGradient>
      </defs>
      <path
        d="M14 8L8 40H14L16 28H24L26 40H32L26 8H20L18 22H16L14 8Z"
        fill={`url(#${leftGrad})`}
      />
      <path
        d="M22 10C28 8 34 12 38 20C40 24 39 30 34 34C30 37 24 38 20 36C24 34 28 30 29 25C30 20 27 14 22 10Z"
        fill={`url(#${swooshGrad})`}
      />
    </svg>
  );
}

const sizeStyles = {
  sm: {
    mark: "w-8 h-8",
    text: "text-lg sm:text-xl",
  },
  md: {
    mark: "w-9 h-9 sm:w-10 sm:h-10",
    text: "text-xl sm:text-2xl",
  },
  lg: {
    mark: "w-12 h-12 sm:w-14 sm:h-14",
    text: "text-3xl sm:text-4xl",
  },
};

export function BrandLogo({ className, size = "md", variant = "default" }: BrandLogoProps) {
  const styles = sizeStyles[size];
  const isNav = variant === "nav";

  return (
    <div className={cn("flex items-center gap-2 sm:gap-2.5", className)}>
      <BrandMark className={styles.mark} />
      <span className={cn("font-bold tracking-[-0.03em] leading-none whitespace-nowrap", styles.text)}>
        <span className={isNav ? "brand-nav-light" : "brand-emboss-light"}>Aragão </span>
        <span className={isNav ? "brand-nav-accent" : "brand-emboss-accent"}>Dev.</span>
      </span>
    </div>
  );
}
