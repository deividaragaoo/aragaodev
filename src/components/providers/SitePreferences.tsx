"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getDictionary,
  htmlLang,
  isLocale,
  isTheme,
  LOCALE_COOKIE,
  THEME_COOKIE,
  type Dictionary,
  type Locale,
  type Theme,
} from "@/lib/i18n";

type Preferences = {
  locale: Locale;
  theme: Theme;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

function persist(name: string, value: string) {
  writeCookie(name, value);
  try {
    localStorage.setItem(name, value);
  } catch {
    // private mode
  }
}

function applyToDocument(locale: Locale, theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-locale", locale);
  root.lang = htmlLang(locale);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "light" ? "#f4f2ee" : "#050505");
  }
}

export function SitePreferencesProvider({
  children,
  initialLocale,
  initialTheme,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    applyToDocument(locale, theme);
  }, [locale, theme]);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    persist(LOCALE_COOKIE, next);
    setLocaleState(next);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    if (!isTheme(next)) return;
    persist(THEME_COOKIE, next);
    setThemeState(next);
  }, []);

  const value = useMemo<Preferences>(
    () => ({
      locale,
      theme,
      t: getDictionary(locale),
      setLocale,
      setTheme,
    }),
    [locale, setLocale, setTheme, theme]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within SitePreferencesProvider");
  }
  return context;
}
