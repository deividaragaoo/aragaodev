"use client";

import { contact } from "@/lib/data";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface InstagramLinkProps {
  className?: string;
}

export function InstagramLink({ className }: InstagramLinkProps) {
  return (
    <a
      href={contact.instagram.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Seguir no Instagram: ${contact.instagram.display}`}
      className={cn(
        "group inline-flex items-center gap-2.5 text-sm font-light text-muted hover:text-foreground transition-colors duration-300",
        className
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-muted/70 transition-all duration-300 group-hover:border-white/[0.14] group-hover:text-[#E4405F]">
        <InstagramIcon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block whitespace-nowrap tracking-[-0.01em] text-foreground/90 group-hover:text-foreground transition-colors">
          {contact.instagram.display}
        </span>
        <span className="block text-[11px] text-subtle group-hover:text-muted transition-colors">
          Instagram
        </span>
      </span>
    </a>
  );
}
