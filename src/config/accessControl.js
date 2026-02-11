export const SUBSCRIPTION_GATES = {
  /**
   * Master kill switch – set to false to disable every subscription gate.
   */
  enabled: false,

  /**
   * Individual gates (extend this list as needed).
   */
  leaderboard: true,
  statistics: true,
};

export const isSubscriptionGateEnabled = (gate) =>
  Boolean(SUBSCRIPTION_GATES.enabled && SUBSCRIPTION_GATES[gate]);

/**
 * Visibility controls for UI components.
 * Set to false to hide components from the UI.
 */
export const VISIBILITY_CONTROLS = {
  /**
   * Master kill switch – set to false to hide all controlled components.
   */
  enabled: true,

  /**
   * Individual visibility controls.
   */
  assessmentsNavItem: true,
  premiumNavItem: true,
  subscriptionNavItem: true,
  dashboardCertifiedCard: true,  
  statisticsCertifiedCard: true,  
  assessmentCompletionUpsell: true,
  
  /**
   * Profile page visibility controls
   * Control visibility of Privacy Policy, Terms of Use, AGB, Impressum, FAQ, and Ticket Raising System pages
   * Applies to both mobile and desktop views
   */
  privacyPolicy: true,
  termsOfUse: true,
  agb: false,
  impressum: false,
  faq: true,
  ticketRaisingSystem: true,
  
  /**
   * Profile settings visibility controls
   * Control visibility of profile settings options
   */
  // updatePasswordPage: true,
  hideUpdatePasswordForMSISDN: true,
  hideHelpScoutBeaconForMSISDN: true,
};

export const ASSESSMENT_BEHAVIOUR_CONTROLS = {
  assessmentPaymentsEnabled: true,
};

export const isAssessmentPaymentEnabled = () =>
  Boolean(ASSESSMENT_BEHAVIOUR_CONTROLS.assessmentPaymentsEnabled);

/**
 * MSISDN Authentication controls
 * Control MSISDN-based authentication features
 */
export const MSISDN_CONTROLS = {
  enabled: true,  
  useMSISDNSignup: true,
  useMSISDNLogin: true,
};

export const isMSISDNControlEnabled = (control) =>
  Boolean(MSISDN_CONTROLS.enabled && MSISDN_CONTROLS[control]);


/**
 * Language controls
 * Control default language settings
 */
export const LANGUAGE_CONTROLS = {
  /**
   * Master switch for language controls
   */
  enabled: true,
  
  /**
   * Default language to use regardless of browser/location
   * Supported values: 'en', 'de', 'ro'
   * Set to null to use browser-based detection
   */
  defaultLanguage: 'de',
};

/**
 * Default country controls
 * Control default country selection in signup forms
 */
export const DEFAULT_COUNTRY_CONTROLS = {
  /**
   * Master switch for default country controls
   */
  enabled: true,
  
  /**
   * Default country to pre-select in signup forms
   * Must match a country name from the countries array in constant.js
   * Set to null to show no default selection
   */
  defaultCountry: 'Germany',
};

export const getDefaultLanguage = () => {
  if (!LANGUAGE_CONTROLS.enabled) return null;
  return LANGUAGE_CONTROLS.defaultLanguage;
};

export const getDefaultCountry = () => {
  if (!DEFAULT_COUNTRY_CONTROLS.enabled) return null;
  return DEFAULT_COUNTRY_CONTROLS.defaultCountry;
};

export const isComponentVisible = (component) =>
  Boolean(VISIBILITY_CONTROLS.enabled && VISIBILITY_CONTROLS[component]);

/**
 * Check if a profile page is visible
 * @param {string} pageKey - The page identifier ('privacyPolicy', 'termsOfUse', 'agb', 'impressum')
 * @returns {boolean} - Whether the page should be visible
 */
export const isProfilePageVisible = (pageKey) => {
  if (!VISIBILITY_CONTROLS.enabled) return false;
  return Boolean(VISIBILITY_CONTROLS[pageKey]);
};
