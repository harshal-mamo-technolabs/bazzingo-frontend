import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'bazzingo.lang';
const SUPPORTED_LANGS = ['en', 'de'];

export const  I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
});

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }
    const browserLang = (navigator.language || 'en').toLowerCase();
    return browserLang.startsWith('de') ? 'de' : 'en';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore storage issues
    }
  }, [language]);

  const setLanguage = (lang) => {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    setLanguageState(lang);
  };

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}


