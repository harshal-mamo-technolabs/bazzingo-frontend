import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDefaultLanguage } from '../config/accessControl';

const STORAGE_KEY = 'bazzingo.lang';
const SUPPORTED_LANGS = ['en', 'de', 'ro'];

export const  I18nContext = createContext({
  language: 'de',
  setLanguage: () => {},
});

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'de';
    
    // User's explicit choice (from previous visit) takes precedence over default
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }
    
    // Then use default language from access control if set
    const defaultLang = getDefaultLanguage();
    if (defaultLang && SUPPORTED_LANGS.includes(defaultLang)) {
      return defaultLang;
    }
    
    const browserLang = (navigator.language || 'de').toLowerCase();
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('ro')) return 'ro';
    return 'de';
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


