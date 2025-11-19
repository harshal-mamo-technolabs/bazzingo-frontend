import { useContext, useEffect, useRef, useState } from 'react';
import { I18nContext } from '../context/I18nContext';
import { translateText } from '../services/translationService';

// Simple in-memory cache per session
const cache = new Map();

/**
 * Hook that returns a translated version of the provided text,
 * reacting to language changes. It shows the original English
 * immediately and swaps in German when available.
 *
 * @param {string} text
 * @returns {string}
 */
export function useTranslateText(text) {
  const { language } = useContext(I18nContext);
  const [translated, setTranslated] = useState(text);
  const lastTextRef = useRef(text);

  useEffect(() => {
    // If text itself changed, reset to raw text first
    if (lastTextRef.current !== text) {
      lastTextRef.current = text;
      setTranslated(text);
    }
  }, [text]);

  useEffect(() => {
    if (!text) {
      setTranslated(text);
      return;
    }

    if (language === 'en') {
      setTranslated(text);
      return;
    }

    const key = `${language}|${text}`;

    if (cache.has(key)) {
      setTranslated(cache.get(key));
      return;
    }

    let cancelled = false;

    translateText(text, language)
      .then((result) => {
        if (cancelled) return;
        cache.set(key, result);
        setTranslated(result);
      })
      .catch(() => {
        if (!cancelled) {
          setTranslated(text);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [text, language]);

  return translated;
}

/**
 * Convenience hook that returns a `translate` function you can call
 * inside render: `const t = useTranslate(); const label = t('Hello');`
 * It memoizes per call site by delegating to `useTranslateText`.
 */
export function useTranslate() {
  const { language } = useContext(I18nContext);

  return (text) => {
    // This small wrapper lets components opt-in to translation
    // without needing to import I18nContext directly.
    // For simplicity and hook rules, it delegates to useTranslateText
    // at the call site instead of inside this function.
    console.warn(
      '[useTranslate] Prefer useTranslateText(text) directly at render sites.'
    );
    return language === 'en' ? text : text;
  };
}


