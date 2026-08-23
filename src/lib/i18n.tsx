"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import kn from "@/locales/kn.json";

export type Lang = "en" | "kn" | "hi";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

const DICTS: Record<Lang, Record<string, string>> = {
  en: en as Record<string, string>,
  kn: kn as Record<string, string>,
  hi: hi as Record<string, string>,
};

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "gramacare.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && stored in DICTS) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `gramacare_lang=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = DICTS[lang][key] ?? DICTS.en[key] ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce(
        (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
        raw,
      );
    },
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Pick a localised article title when one exists. */
export function localTitle(
  article: { title: string; titleKn?: string | null; titleHi?: string | null },
  lang: Lang,
): string {
  if (lang === "kn" && article.titleKn) return article.titleKn;
  if (lang === "hi" && article.titleHi) return article.titleHi;
  return article.title;
}
