import { staticTranslations as allStaticTranslations } from '../staticTranslations';

// Expose just the Romanian dictionary so it can be lazy-loaded
// via a smaller entry file instead of importing the entire
// translation setup everywhere.
export const roTranslations =
  (allStaticTranslations && allStaticTranslations['ro']) || {};

