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
      displayName: 'Testbrain',
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
  // Premium/Subscription nav and the certified/upsell cards all lead into Stripe
  // checkout, so they stay off while `stripePaymentsEnabled` is false.
  assessmentsNavItem: true,
  premiumNavItem: true,
  subscriptionNavItem: true,
  changePasswordNavItem: false,
  dashboardCertifiedCard: true,
  statisticsCertifiedCard: true,
  assessmentCompletionUpsell: true,

  // Subscription page components
  paymentMethods: true,

  // Profile pages
  privacyPolicy: true,
  termsOfUse: true,
  refundPolicy: true,
  agb: false,
  impressum: false,
  help: false,
  faq: true,
  ticketRaisingSystem: true,
  withdrawContract: true,
  contacts: true,
  dataPrivacy: true,
  // Danger-zone entry in Profile that opens DeleteAccountModal.
  deleteAccount: true,

  // Profile settings behaviour
  // When true, the corresponding option is HIDDEN.
  // MSISDN accounts get a server-generated password, so update-password is a dead end.
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
  useMSISDNSignup: true,
  useMSISDNLogin: true,
};

export const isMSISDNControlEnabled = (control) =>
  Boolean(MSISDN_CONTROLS.enabled && MSISDN_CONTROLS[control]);

// ---------------------------------------------------------------------------
// BILLING MODE
// The app operates in one of two mutually-exclusive billing modes:
// - 'msisdn': mobile-carrier / SMS billing (active when MSISDN auth is enabled).
// - 'stripe': card billing via Stripe (the default when MSISDN is disabled).
// Use `getActiveBillingMode()` / `isMsisdnBillingMode()` to render mode-specific
// copy (e.g. billing FAQs, help content).
// ---------------------------------------------------------------------------
export const isMsisdnBillingMode = () => Boolean(MSISDN_CONTROLS.enabled);

export const getActiveBillingMode = () =>
  isMsisdnBillingMode() ? 'msisdn' : 'stripe';

// ---------------------------------------------------------------------------
// PER-USER BILLING TYPE
// A single deployment can hold both carrier-billed and card-billed accounts, so
// billing-specific content (e.g. the Stripe refund policy) is gated per user
// rather than per deployment.
// - A user is an MSISDN user when their profile carries an `msisdn`.
// - When the profile is not loaded yet (or lacks the field), fall back to
//   whether the MSISDN auth flows are actually active for this deployment.
// - Use `isStripeUser(user)` / `isMsisdnUser(user)`.
// ---------------------------------------------------------------------------
export const isMsisdnUser = (user) => {
  if (user && typeof user === 'object' && 'msisdn' in user) {
    return Boolean(user.msisdn);
  }
  return (
    isMSISDNControlEnabled('useMSISDNSignup') || isMSISDNControlEnabled('useMSISDNLogin')
  );
};

export const isStripeUser = (user) => !isMsisdnUser(user);

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
// Germany-only deployment — add 'Slovakia' / 'Romania' back when those markets go live here.
export const MSISDN_SIGNUP_COUNTRY_FILTER = ['Germany'];

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
// toGermanNationalNumber
// Reduces German input to its national significant number (no trunk `0`, no
// country code) so `0170…`, `+49 170…`, `0049 170…` and `49 170…` all converge
// on the same subscriber digits instead of double-prefixing `0049`.
// The `49` branch only fires when there is no trunk `0` (i.e. the input was
// already international) and the next digit is `1`, which every German mobile
// national number starts with — so area codes like `0491…` are left alone.
// ---------------------------------------------------------------------------
const toGermanNationalNumber = (digits) => {
  if (digits.startsWith('0049')) return digits.slice(4);
  if (digits.startsWith('49') && digits[2] === '1') return digits.slice(2);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
};

// ---------------------------------------------------------------------------
// normalizeMsisdnForCountry
// Normalizes raw MSISDN input to an international format per country rules.
// - Germany:
//    - Strip non-digits.
//    - Reduce to the national significant number (drops trunk `0` and/or an
//      existing `49`/`0049` country code).
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
      digits = toGermanNationalNumber(digits);
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
//    - Reduce to the national significant number (same rule as normalization).
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
      return Boolean(toGermanNationalNumber(digits));
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
