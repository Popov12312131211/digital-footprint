"use client";

import * as React from "react";
import {
  DEFAULT_LOCALE,
  intlLocale,
  isLocale,
  translate,
  translatePlural,
  type Locale,
  type TranslateParams,
} from "@/lib/i18n-core";

const STORAGE_KEY = "df-locale";

/** Runs before first paint so the document language matches the saved choice. */
export const localeInitScript = `(function(){try{var l=localStorage.getItem("${STORAGE_KEY}");if(l!=="ru"&&l!=="en"){l="${DEFAULT_LOCALE}"}document.documentElement.setAttribute("lang",l)}catch(e){}})();`;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: TranslateParams) => string;
  tp: (key: string, n: number, params?: TranslateParams) => string;
  intl: string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage may be blocked; the default stays */
    }
    if (isLocale(saved)) {
      setLocaleState(saved);
      document.documentElement.setAttribute("lang", saved);
    }
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.setAttribute("lang", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the choice still applies for this session */
    }
  }, []);

  const toggleLocale = React.useCallback(() => {
    setLocale(locale === "ru" ? "en" : "ru");
  }, [locale, setLocale]);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: (key, params) => translate(locale, key, params),
      tp: (key, n, params) => translatePlural(locale, key, n, params),
      intl: intlLocale(locale),
    }),
    [locale, setLocale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}
