"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  showArrow?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  showArrow = true,
  fullWidth = false,
  onClick,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-full min-h-[44px] active:scale-[0.98] [&_svg]:shrink-0";

  const variants = {
    primary:
      "bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/85",
    secondary:
      "bg-transparent text-foreground border border-white/10 hover:border-white/20 hover:bg-white/[0.03] active:bg-white/[0.05]",
    ghost: "text-muted hover:text-foreground",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-[13px]",
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-3.5 text-sm sm:text-base",
  };

  const classes = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {children}
      {variant === "primary" && showArrow && (
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      )}
    </>
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto:");
    return (
      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className={fullWidth ? "w-full" : undefined}>
        {isExternal ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className={classes}
            onClick={onClick}
          >
            {content}
          </a>
        ) : (
          <Link href={href} className={classes} onClick={onClick}>
            {content}
          </Link>
        )}
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      onClick={onClick}
    >
      {content}
    </motion.button>
  );
}
