import React from 'react';
import { useTranslateText } from '../hooks/useTranslate';

/**
 * Simple wrapper component that translates the given text
 * based on the current language. Used to keep hooks usage
 * inside a component.
 */
export default function TranslatedText({ text }) {
  const safeText = typeof text === 'string' ? text : '';
  const translated = useTranslateText(safeText);
  return translated;
}


