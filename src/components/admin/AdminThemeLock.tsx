"use client";

import { useEffect } from "react";
import { htmlLang, isLocale, isTheme } from "@/lib/i18n";

/** Admin stays dark even if the public site is in light mode. */
export function AdminThemeLock() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "dark");
    root.removeAttribute("data-locale");
    root.lang = "pt-BR";

    return () => {
      let theme = "dark";
      let locale = "pt";
      try {
        theme = localStorage.getItem("aragao-theme") || theme;
        locale = localStorage.getItem("aragao-lang") || locale;
      } catch {
        // ignore
      }
      root.setAttribute("data-theme", isTheme(theme) ? theme : "dark");
      root.setAttribute("data-locale", isLocale(locale) ? locale : "pt");
      root.lang = htmlLang(isLocale(locale) ? locale : "pt");
    };
  }, []);

  return null;
}
