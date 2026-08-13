"use client";

import { Moon, Sun } from "lucide-react";
import { usePreferences } from "@/components/providers/SitePreferences";
import { cn } from "@/lib/utils";

export function SiteControls({ compact = false }: { compact?: boolean }) {
  const { locale, theme, setLocale, setTheme, t } = usePreferences();

  return (
    <div className={cn("flex items-center gap-1.5", compact && "gap-1")}>
      <div
        role="group"
        aria-label={t.controls.language}
        className="flex items-center rounded-full border border-border bg-surface p-0.5"
      >
        <button
          type="button"
          onClick={() => setLocale("pt")}
          aria-pressed={locale === "pt"}
          aria-label={t.controls.portuguese}
          className={cn(
            "rounded-full px-2 py-1 text-[11px] font-medium tracking-wide transition-colors",
            locale === "pt"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          )}
        >
          PT
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
          aria-label={t.controls.english}
          className={cn(
            "rounded-full px-2 py-1 text-[11px] font-medium tracking-wide transition-colors",
            locale === "en"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          )}
        >
          EN
        </button>
      </div>

      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={theme === "dark" ? t.controls.light : t.controls.dark}
        aria-pressed={theme === "light"}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-foreground"
      >
        {theme === "dark" ? (
          <Sun className="h-3.5 w-3.5" strokeWidth={1.75} />
        ) : (
          <Moon className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}
