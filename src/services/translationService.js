// Frontend translation client that calls a backend wrapper around
// Google Cloud Translation API. The backend endpoint should read
// the API key from environment and never expose it to the browser.

import { API_CONNECTION_HOST_URL } from '../utils/constant';

const DEFAULT_ENDPOINT = '/translate';

const API_ENDPOINT =
  import.meta.env.VITE_TRANSLATE_API_URL ||
  `${API_CONNECTION_HOST_URL}${DEFAULT_ENDPOINT}`;

/**
 * Get authentication headers from localStorage
 */
function getAuthHeaders() {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return { 'Content-Type': 'application/json' };

    const parsedUserData = JSON.parse(userData);
    const token = parsedUserData?.accessToken || parsedUserData?.user?.token;

    if (!token) return { 'Content-Type': 'application/json' };

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}

// -------- Static translation dictionary (overrides API translations) --------
// Import comprehensive static translations from data file
import { staticTranslations as importedStaticTranslations } from '../data/staticTranslations';

// Use imported translations, fallback to empty object if import fails
const staticTranslations = importedStaticTranslations || {
  'de': {},
  'ro': {},
};


function getStaticTranslation(text, targetLang) {
  if (!text || !targetLang || targetLang === 'en') {
    return null;
  }
  const langDict = staticTranslations[targetLang];
  if (langDict && langDict.hasOwnProperty(text)) {
    return langDict[text];
  }
  return null;
}

// -------- Batching layer (to avoid per-line API calls) --------

// pending promises per (targetLang|text) so same text isn't requested twice
const pendingMap = new Map();

// batch queues per target language
const batchQueues = new Map();

const BATCH_DELAY_MS = 30;

function enqueueBatchItem(text, targetLang, sourceLang) {
  return new Promise((resolve) => {
    const langKey = targetLang || 'en';
    let queue = batchQueues.get(langKey);

    if (!queue) {
      queue = { items: [], timer: null };
      batchQueues.set(langKey, queue);
    }

    queue.items.push({ text, sourceLang, resolve });

    if (!queue.timer) {
      queue.timer = setTimeout(() => flushBatch(langKey), BATCH_DELAY_MS);
    }
  });
}

async function flushBatch(langKey) {
  const queue = batchQueues.get(langKey);
  if (!queue || queue.items.length === 0) {
    if (queue) queue.timer = null;
    return;
  }

  const { items } = queue;
  queue.items = [];
  queue.timer = null;

  const headers = getAuthHeaders();

  // Extract texts in order
  const texts = items.map((i) => i.text);
  const sourceLang = items[0]?.sourceLang || 'en';

  // Check for static translations first
  const textsToTranslate = [];
  const staticTranslationIndices = new Map();
  
  texts.forEach((text, index) => {
    const staticTranslation = getStaticTranslation(text, langKey);
    if (staticTranslation !== null) {
      staticTranslationIndices.set(index, staticTranslation);
    } else {
      // Log strings that are NOT in static translations and require API call
      textsToTranslate.push({ text, index });
    }
  });

  let translations = [...texts];
  
  // Apply static translations
  staticTranslationIndices.forEach((translation, index) => {
    translations[index] = translation;
  });

  // Only make API call if there are texts to translate
  if (textsToTranslate.length > 0) {
    try {
      const textsForAPI = textsToTranslate.map(item => item.text);
      
      // Log all strings that require API translation
      
      // Also log each string individually for easier tracking
      textsForAPI.forEach((text, idx) => {
      });

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          q: textsForAPI,
          source: sourceLang,
          target: langKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('[translationService] Failed to translate batch', {
          status: response.status,
          statusText: response.statusText,
          endpoint: API_ENDPOINT,
          error: errorText,
        });
        // fall through, translations stay as original texts
      } else {
        const payload = await response.json().catch((err) => {
          console.error('[translationService] Failed to parse batch response', err);
          return {};
        });

        const translatedArray =
          payload?.data?.translatedTexts ||
          payload?.data?.translations ||
          payload?.translatedTexts ||
          payload?.texts;

        if (Array.isArray(translatedArray) && translatedArray.length === textsForAPI.length) {
          // Apply API translations to the correct indices
          textsToTranslate.forEach((item, apiIndex) => {
            translations[item.index] = translatedArray[apiIndex];
          });
        } else {
          console.warn('[translationService] Unexpected batch response format', payload);
        }
      }
    } catch (err) {
      console.error('[translationService] Error while translating batch', {
        error: err,
        endpoint: API_ENDPOINT,
        sampleText: String(textsForAPI[0] || '').substring(0, 50),
      });
    }
  }

  // Resolve all queued promises
  translations.forEach((translated, index) => {
    const original = texts[index];
    const safeTranslated =
      typeof translated === 'string' && translated.trim().length > 0
        ? translated
        : original;

    const item = items[index];
    try {
      item.resolve(safeTranslated);
    } catch (e) {
      console.error('[translationService] Failed to resolve translation promise', e);
    }
  });
}

/**
 * Translate plain text from English into the target language.
 * For 'en', this is a no-op and the original text is returned.
 *
 * This function now uses a batching layer so that multiple
 * texts are translated in a single API call.
 *
 * @param {string} text
 * @param {'en'|'de'} targetLang
 * @param {'en'|'de'} [sourceLang='en']
 * @returns {Promise<string>}
 */
export function translateText(text, targetLang, sourceLang = 'en') {
  if (!text || typeof text !== 'string') {
    return Promise.resolve(text);
  }

  if (!targetLang || targetLang === sourceLang) {
    return Promise.resolve(text);
  }

  // For now we only support translating from English
  if (sourceLang !== 'en') {
    return Promise.resolve(text);
  }

  // Check for static translation first
  const staticTranslation = getStaticTranslation(text, targetLang);
  if (staticTranslation !== null) {
    return Promise.resolve(staticTranslation);
  }

  // Log when a single translation requires API call (not batched yet)

  const key = `${targetLang}|${text}`;
  if (pendingMap.has(key)) {
    return pendingMap.get(key);
  }

  const promise = enqueueBatchItem(text, targetLang, sourceLang)
    .catch((err) => {
      console.error('[translationService] Single translation failed', err);
      return text;
    })
    .finally(() => {
      pendingMap.delete(key);
    });

  pendingMap.set(key, promise);
  return promise;
}


