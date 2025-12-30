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
  statisticsCertifiedCard: false,  
  assessmentCompletionUpsell: false,
  
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
};

export const ASSESSMENT_BEHAVIOUR_CONTROLS = {
  assessmentPaymentsEnabled: false,
};

export const isAssessmentPaymentEnabled = () =>
  Boolean(ASSESSMENT_BEHAVIOUR_CONTROLS.assessmentPaymentsEnabled);


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
