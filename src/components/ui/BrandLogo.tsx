"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "nav";
}

const sizeStyles = {
  sm: "h-8 sm:h-9",
  md: "h-10 sm:h-11",
  lg: "h-12 sm:h-14",
};

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/aragaodev-logo.png"
        alt="Aragão Dev."
        width={508}
        height={120}
        className={cn("w-auto object-contain", sizeStyles[size])}
        priority={size === "sm"}
      />
    </div>
  );
}
