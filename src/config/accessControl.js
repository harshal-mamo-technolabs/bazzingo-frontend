// ---------------------------------------------------------------------------
// GLOBAL_LANGUAGE_OVERRIDE
// ---------------------------------------------------------------------------

export const GLOBAL_LANGUAGE_OVERRIDE = {
  enabled: true,
  defaultLanguage: 'de',
};

export const isGlobalLanguageOverrideEnabled = () =>
  Boolean(GLOBAL_LANGUAGE_OVERRIDE.enabled && GLOBAL_LANGUAGE_OVERRIDE.defaultLanguage);

// ---------------------------------------------------------------------------
// PLATFORM_BRAND_CONTROLS
// Switches the visible platform name across the app (headers, copy, reports).
// - Set `useLumriaBrand` to true to replace Bazzingo/Bazingo with Lumria everywhere.
// - Set to false to keep the original Bazzingo/Bazingo branding.
// - Use `getPlatformName()`, `applyPlatformBrandToText()`, `getPlatformLogoPath()`.
// ---------------------------------------------------------------------------
export const PLATFORM_BRAND_CONTROLS = {
  useLumriaBrand: true,
  brands: {
    bazzingo: {
      displayName: 'Bazzingo',
      logoPath: '/bazzingo-logo.png',
      bulbPath: '/bazzingo-bulb.png',
      puzzleBearPath: '/bazzingo-puzzle-bear.png',
      headImagePath: '/bazzingo-head.png',
      assessmentHeadPath: '/assessment/bazzingo-head.png',
    },
    lumria: {
      displayName: 'bazzingo',
      // Replace these paths with dedicated brand assets in /public when available.
      logoPath: '/testbrain-logo.jpg',
      bulbPath: '/bazzingo-bulb.png',
      puzzleBearPath: '/bazzingo-puzzle-bear.png',
      headImagePath: '/bazzingo-head.png',
      assessmentHeadPath: '/assessment/bazzingo-head.png',
    },
  },
};
const LEGACY_BRAND_PATTERN = /\b(Bazzingo|Bazingo|bazzingo|bazingo)\b/g;

const getActiveBrandKey = () =>
  PLATFORM_BRAND_CONTROLS.useLumriaBrand ? 'lumria' : 'bazzingo';

const getActiveBrandProfile = () =>
  PLATFORM_BRAND_CONTROLS.brands[getActiveBrandKey()] ||
  PLATFORM_BRAND_CONTROLS.brands.bazzingo;

export const isLumriaBrandEnabled = () => Boolean(PLATFORM_BRAND_CONTROLS.useLumriaBrand);

export const getPlatformName = () => getActiveBrandProfile().displayName;

export const getPlatformLogoPath = () => getActiveBrandProfile().logoPath;

export const getPlatformBulbPath = () => getActiveBrandProfile().bulbPath;

export const getPlatformPuzzleBearPath = () => getActiveBrandProfile().puzzleBearPath;

export const getPlatformHeadImagePath = () => getActiveBrandProfile().headImagePath;

export const getPlatformAssessmentHeadPath = () => getActiveBrandProfile().assessmentHeadPath;

export const applyPlatformBrandToText = (text) => {
  if (!text || typeof text !== 'string' || !isLumriaBrandEnabled()) {
    return text;
  }

  const brandName = getPlatformName();
  return text.replace(LEGACY_BRAND_PATTERN, (match) => {
    if (match === match.toUpperCase()) {
      return brandName.toUpperCase();
    }
    if (match[0] === match[0].toUpperCase()) {
      return brandName;
    }
    return brandName.toLowerCase();
  });
};

// ---------------------------------------------------------------------------
// SUBSCRIPTION_GATES
// Controls feature access that requires an active subscription.
// - Set `enabled` to false to disable ALL subscription-gated features.
// - Individual keys (e.g. `leaderboard`, `statistics`) gate specific areas.
// - Use `isSubscriptionGateEnabled('leaderboard')` in UI or logic.
// ---------------------------------------------------------------------------
export const SUBSCRIPTION_GATES = {
  enabled: false,
  leaderboard: true,
  statistics: true,
};

export const isSubscriptionGateEnabled = (gate) =>
  Boolean(SUBSCRIPTION_GATES.enabled && SUBSCRIPTION_GATES[gate]);

// ---------------------------------------------------------------------------
// VISIBILITY_CONTROLS
// Controls which UI components and profile pages are shown.
// - Set `enabled` to false to hide ALL controlled components.
// - Toggle individual keys to show/hide specific nav items or pages.
// - Use `isComponentVisible('assessmentsNavItem')` in navigation.
// - Use `isProfilePageVisible('privacyPolicy')` to show/hide profile links.
// ---------------------------------------------------------------------------
export const VISIBILITY_CONTROLS = {
  enabled: true,

  // Main nav
  assessmentsNavItem: true,
  premiumNavItem: true,
  subscriptionNavItem: true,
  changePasswordNavItem: false,
  dashboardCertifiedCard: true,
  statisticsCertifiedCard: true,
  assessmentCompletionUpsell: true,

  // Profile pages
  privacyPolicy: true,
  termsOfUse: true,
  agb: false,
  impressum: false,
  help: true,
  faq: true,
  ticketRaisingSystem: true,
  withdrawContract: false,
  contacts: false,

  // Profile settings behaviour
  // When true, the corresponding option is HIDDEN.
  hideUpdatePasswordForMSISDN: false,
  hideHelpScoutBeaconForMSISDN: false,
};

export const isComponentVisible = (component) =>
  Boolean(VISIBILITY_CONTROLS.enabled && VISIBILITY_CONTROLS[component]);

export const isProfilePageVisible = (pageKey) => {
  if (!VISIBILITY_CONTROLS.enabled) return false;
  return Boolean(VISIBILITY_CONTROLS[pageKey]);
};

// ---------------------------------------------------------------------------
// ASSESSMENT_BEHAVIOUR_CONTROLS
// Controls assessment-specific behaviour such as payment flows.
// - Set `assessmentPaymentsEnabled` to false to disable Stripe paid assessments.
// - Set `stripePaymentsEnabled` to false to disable all Stripe checkout flows.
// - Use `isAssessmentPaymentEnabled()` / `isStripePaymentEnabled()` in UI or logic.
// ---------------------------------------------------------------------------
export const ASSESSMENT_BEHAVIOUR_CONTROLS = {
  assessmentPaymentsEnabled: true,
  stripePaymentsEnabled: true,
};

export const isAssessmentPaymentEnabled = () =>
  Boolean(
    ASSESSMENT_BEHAVIOUR_CONTROLS.assessmentPaymentsEnabled &&
      ASSESSMENT_BEHAVIOUR_CONTROLS.stripePaymentsEnabled,
  );

export const isStripePaymentEnabled = () =>
  Boolean(ASSESSMENT_BEHAVIOUR_CONTROLS.stripePaymentsEnabled);

// ---------------------------------------------------------------------------
// MSISDN_CONTROLS
// Controls MSISDN-based authentication.
// - `enabled`: master switch for MSISDN auth.
// - `useMSISDNSignup`: show MSISDN signup flow.
// - `useMSISDNLogin`: show MSISDN login flow.
// - Use `isMSISDNControlEnabled('useMSISDNSignup')` in auth forms.
// ---------------------------------------------------------------------------
export const MSISDN_CONTROLS = {
  enabled: false,
  useMSISDNSignup: false,
  useMSISDNLogin: false,
};

export const isMSISDNControlEnabled = (control) =>
  Boolean(MSISDN_CONTROLS.enabled && MSISDN_CONTROLS[control]);

// ---------------------------------------------------------------------------
// LANGUAGE_CONTROLS
// Global language defaults.
// - `enabled`: when false, no global language override is applied.
// - `defaultLanguage`: fallback when no country profile/language mapping.
//   Supported: 'en', 'de', 'ro', 'sk'.
// - This is overridden by `COUNTRY_PROFILE_CONTROLS` when that is enabled.
// ---------------------------------------------------------------------------
export const LANGUAGE_CONTROLS = {
  enabled: true,
  defaultLanguage: 'de',
};

// ---------------------------------------------------------------------------
// DEFAULT_COUNTRY_CONTROLS
// Global default signup country.
// - `enabled`: when false, no global default country is applied.
// - `defaultCountry`: must match an entry in the `countries` constant.
// - This is overridden by `COUNTRY_PROFILE_CONTROLS` when that is enabled.
// ---------------------------------------------------------------------------
export const DEFAULT_COUNTRY_CONTROLS = {
  enabled: true,
  defaultCountry: 'Germany',
};

// ---------------------------------------------------------------------------
// COUNTRY_PROFILE_CONTROLS
// Per-country master profile that defines:
// - `language`: default UI language.
// - `defaultCountry`: default signup country.
// - `msisdnCountry`: MSISDN validation/normalization country.
// How it works:
// - When `enabled` and `activeCountry` is set, this profile overrides:
//   - `LANGUAGE_CONTROLS.defaultLanguage`
//   - `DEFAULT_COUNTRY_CONTROLS.defaultCountry`
//   - `MSISDN_VALIDATION_CONTROLS.country`
// - To switch markets, set `activeCountry` to one of the keys in `profiles`.
// ---------------------------------------------------------------------------
export const COUNTRY_PROFILE_CONTROLS = {
  enabled: true,
  activeCountry: 'Germany', // 'Germany' | 'Slovakia' | 'Romania' | null
  profiles: {
    Germany: {
      language: 'de',
      defaultCountry: 'Germany',
      msisdnCountry: 'Germany',
    },
    Slovakia: {
      language: 'sk',
      defaultCountry: 'Slovakia',
      msisdnCountry: 'Slovakia',
    },
    Romania: {
      language: 'ro',
      defaultCountry: 'Romania',
      msisdnCountry: 'Romania',
    },
  },
};

const getActiveCountryProfile = () => {
  if (!COUNTRY_PROFILE_CONTROLS.enabled) return null;
  const { activeCountry, profiles } = COUNTRY_PROFILE_CONTROLS;
  if (!activeCountry) return null;
  return profiles[activeCountry] || null;
};

export const getDefaultLanguage = () => {
  if (isGlobalLanguageOverrideEnabled()) {
    return GLOBAL_LANGUAGE_OVERRIDE.defaultLanguage;
  }
  const profile = getActiveCountryProfile();
  if (profile?.language) return profile.language;
  if (!LANGUAGE_CONTROLS.enabled) return null;
  return LANGUAGE_CONTROLS.defaultLanguage;
};

export const getDefaultCountry = () => {
  const profile = getActiveCountryProfile();
  if (profile?.defaultCountry) return profile.defaultCountry;
  if (!DEFAULT_COUNTRY_CONTROLS.enabled) return null;
  return DEFAULT_COUNTRY_CONTROLS.defaultCountry;
};

// ---------------------------------------------------------------------------
// COUNTRY_BASED_CONTROLS
// Lightweight per-country mapping used when a user selects a country.
// - `enabled`: when false, falls back to global defaults.
// - `mappings[countryName]`:
//    - `language`: override UI language for that specific selected country.
//    - `msisdnValidationCountry`: override MSISDN validation for that country.
// - Use:
//    - `getLanguageForCountry(selectedCountry)`
//    - `getMsisdnValidationCountryForSelectedCountry(selectedCountry)`
// ---------------------------------------------------------------------------
export const COUNTRY_BASED_CONTROLS = {
  enabled: true,
  mappings: {
    Germany: {
      language: 'de',
      msisdnValidationCountry: 'Germany',
    },
    Slovakia: {
      language: 'sk',
      msisdnValidationCountry: 'Slovakia',
    },
    Romania: {
      language: 'ro',
      msisdnValidationCountry: 'Romania',
    },
  },
};

export const getLanguageForCountry = (countryName) => {
  if (isGlobalLanguageOverrideEnabled()) {
    return GLOBAL_LANGUAGE_OVERRIDE.defaultLanguage;
  }
  if (!COUNTRY_BASED_CONTROLS.enabled || !countryName) {
    return getDefaultLanguage();
  }

  const mapping = COUNTRY_BASED_CONTROLS.mappings[countryName];
  if (!mapping || !mapping.language) {
    return getDefaultLanguage();
  }

  return mapping.language;
};

export const getMsisdnValidationCountryForSelectedCountry = (countryName) => {
  if (!COUNTRY_BASED_CONTROLS.enabled || !countryName) {
    return getMsisdnValidationCountry();
  }

  const mapping = COUNTRY_BASED_CONTROLS.mappings[countryName];
  if (!mapping || !mapping.msisdnValidationCountry) {
    return getMsisdnValidationCountry();
  }

  return mapping.msisdnValidationCountry;
};

// ---------------------------------------------------------------------------
// MSISDN_COUNTRY_CONFIG
// Per-country MSISDN UI configuration.
// - `inputPrefix`: prefilled digits in the MSISDN input for that country.
// - `tooltip`: helper text shown near the MSISDN input.
// - Use:
//    - `getMsisdnConfigForCountry(countryName)`
//    - `getMsisdnTooltipForCountry(countryName)`
// ---------------------------------------------------------------------------
export const MSISDN_COUNTRY_CONFIG = {
  Germany: {
    inputPrefix: '01',
    tooltip: 'Enter your mobile number starting with 0 (e.g. 01701234567).',
  },
  Slovakia: {
    inputPrefix: '09',
    tooltip: 'Enter your mobile number starting with 09 (e.g. 0912345678).',
  },
  Romania: {
    inputPrefix: '07',
    tooltip: 'Enter your mobile number starting with 07 (e.g. 0722123456).',
  },
};

// Countries shown in MSISDN signup country dropdown (must exist in `countries` from utils/constant).
export const MSISDN_SIGNUP_COUNTRY_FILTER = ['Germany', 'Slovakia', 'Romania'];

export const getMsisdnConfigForCountry = (countryName) => {
  if (!countryName) return null;
  return MSISDN_COUNTRY_CONFIG[countryName] || null;
};

export const getMsisdnTooltipForCountry = (countryName) => {
  const config = getMsisdnConfigForCountry(countryName);
  return config?.tooltip || null;
};

// ---------------------------------------------------------------------------
// MSISDN_VALIDATION_CONTROLS
// Global MSISDN validation/normalization routing.
// - `enabled`: when false, MSISDN numbers are not normalized per-country.
// - `country`: fallback country used when no active country profile is set.
// Resolution order in helpers:
//   1. Explicit `countryName` argument (if provided).
//   2. Active country profile (`COUNTRY_PROFILE_CONTROLS.profiles[activeCountry]`).
//   3. `MSISDN_VALIDATION_CONTROLS.country`.
//   4. `DEFAULT_COUNTRY_CONTROLS.defaultCountry`.
// ---------------------------------------------------------------------------
export const MSISDN_VALIDATION_CONTROLS = {
  enabled: true,
  country: 'Germany',
};

export const getMsisdnValidationCountry = () => {
  const profile = getActiveCountryProfile();
  if (profile?.msisdnCountry) return profile.msisdnCountry;
  if (!MSISDN_VALIDATION_CONTROLS.enabled) return null;
  return MSISDN_VALIDATION_CONTROLS.country;
};

// ---------------------------------------------------------------------------
// normalizeMsisdnForCountry
// Normalizes raw MSISDN input to an international format per country rules.
// - Germany:
//    - Strip non-digits.
//    - Remove leading `0` if present.
//    - Prefix with `0049`.
// - Slovakia:
//    - Expect number starting with `09`.
//    - Strip non-digits.
//    - If it starts with `09`, drop the first `0` (keep `9`).
//    - Prefix with `00421`.
// - Romania:
//    - Strip non-digits.
//    - Remove a single leading `0` (national trunk before `7`).
//    - Prefix with `0040`.
// - Fallback:
//    - Returns cleaned digits without a country prefix.
// ---------------------------------------------------------------------------
export const normalizeMsisdnForCountry = (rawMsisdn, countryName = null) => {
  const activeCountry =
    countryName || getMsisdnValidationCountry() || DEFAULT_COUNTRY_CONTROLS.defaultCountry;

  let digits = String(rawMsisdn || '').trim().replace(/\D/g, '');

  if (!digits) return '';

  switch (activeCountry) {
    case 'Germany': {
      if (digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      return digits ? `0049${digits}` : '';
    }
    case 'Slovakia': {
      if (digits.startsWith('09')) {
        digits = digits.slice(1); // keeps leading 9
      }
      return digits ? `004210${digits}` : '';
    }
    case 'Romania': {
      if (digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      return digits ? `0040${digits}` : '';
    }
    default:
      return digits;
  }
};

// ---------------------------------------------------------------------------
// isMsisdnValidForCountry
// Basic MSISDN validation per country rules.
// - Germany:
//    - Strip non-digits.
//    - Remove a single leading `0` if present.
//    - Valid if at least one digit remains.
// - Slovakia:
//    - Strip non-digits.
//    - If it starts with `09`, drop the first `0` (keep `9`).
//    - Valid if at least one digit remains.
// - Romania:
//    - Strip non-digits.
//    - Remove a single leading `0`.
//    - Valid if at least one digit remains (no fixed length).
// - Fallback:
//    - Valid if at least one digit is present after cleaning.
// ---------------------------------------------------------------------------
export const isMsisdnValidForCountry = (rawMsisdn, countryName = null) => {
  const activeCountry =
    countryName || getMsisdnValidationCountry() || DEFAULT_COUNTRY_CONTROLS.defaultCountry;

  let digits = String(rawMsisdn || '').trim().replace(/\D/g, '');

  if (!digits) return false;

  switch (activeCountry) {
    case 'Germany': {
      if (digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      return Boolean(digits);
    }
    case 'Slovakia': {
      if (digits.startsWith('09')) {
        digits = digits.slice(1); // keep 9, drop leading 0
      }
      return Boolean(digits);
    }
    case 'Romania': {
      if (digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      return Boolean(digits);
    }
    default:
      return Boolean(digits);
  }
};

// (Legal content selection is now fully driven by COUNTRY_PROFILE_CONTROLS:
//  Germany -> Testbrain / Bazzingo GDPR content
//  Slovakia -> Slovakia-specific SMS content)
