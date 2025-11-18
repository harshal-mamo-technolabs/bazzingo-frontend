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
  assessmentsNavItem: false,
  premiumNavItem: false,
  dashboardCertifiedCard: false,   // Top-right payment/"Start Certified Test" card on Dashboard
  statisticsCertifiedCard: false,  // Bottom-right certified card on Statistics page
  assessmentCompletionUpsell: false, // Payment upsell in assessment completion modals
};


export const isComponentVisible = (component) =>
  Boolean(VISIBILITY_CONTROLS.enabled && VISIBILITY_CONTROLS[component]);
