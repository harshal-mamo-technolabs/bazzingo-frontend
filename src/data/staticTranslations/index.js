// In-memory cache of loaded static translations, keyed by language code.
// Each entry is a plain object: { [englishText]: translatedText }
export const staticTranslations = {};

/**
 * Dynamic per-language loaders.
 *
 * NOTE: To add a new language:
 * - Create `src/data/staticTranslations/<lang>.js` exporting `<lang>Translations`
 *   in the same shape as other language files.
 * - Register a loader here:
 *     xx: () => import('./xx').then((m) => m.xxTranslations || {}),
 */
const loaders = {
  de: () => import('./de').then((m) => m.deTranslations || {}),
  ro: () => import('./ro').then((m) => m.roTranslations || {}),
  // 'sk' language (Slovak) uses the Solvik dictionary file
  sk: () => import('./solvik').then((m) => m.solvikTranslations || {}),
};

/**
 * Ensure that a given language dictionary has been loaded into memory.
 * Subsequent lookups can then read from `staticTranslations[lang]`
 * synchronously.
 *
 * @param {string} lang language code (e.g. 'de', 'ro', 'sk')
 */
export async function ensureLanguageLoaded(lang) {
  if (!lang || lang === 'en') return;

  if (staticTranslations[lang]) {
    return;
  }

  const loader = loaders[lang];
  if (!loader) {
    // Unknown language; nothing to load.
    return;
  }

  const dict = await loader();
  // Only assign if still not set (avoid overwriting in races).
  if (!staticTranslations[lang]) {
    staticTranslations[lang] = dict || {};
  }
}

