/**
 * FAQ content for the Help & FAQs page.
 *
 * Content is organised into categories. Answers may be either a single string
 * or an array of strings (rendered as separate paragraphs / bullet points).
 * All strings are wrapped in <TranslatedText /> at render time, so keep them as
 * plain, brand-neutral, translatable sentences.
 *
 * The "Billing & Payments" category is MODE-AWARE:
 *   - 'stripe' -> card / subscription billing questions are shown.
 *   - 'msisdn' -> the category is omitted entirely (billing is handled by the
 *     mobile operator, so there is nothing for the user to manage here).
 * Driven by getActiveBillingMode() from config/accessControl.
 */

// ---- Common categories (shown in every mode) -----------------------------

const gettingStarted = {
  id: 'getting-started',
  title: 'Getting Started',
  faqs: [
    {
      q: 'What is this platform and how does it work?',
      a: 'Our platform helps you train and measure your cognitive skills through science-based brain games and professional assessments. Play daily games, take assessments such as IQ, ADHD and Emotional Intelligence, track your progress over time and earn badges as you improve.',
    },
    {
      q: 'How do I get started?',
      a: [
        'Complete your profile so we can personalise your experience and match you with the right age group.',
        'Open the Games section and play your recommended daily games.',
        'Take an assessment from the Assessments section to get your first score and report.',
        'Check your Dashboard and Statistics to follow your progress.',
      ],
    },
    {
      q: 'Can I use the platform on my phone?',
      a: 'Yes. The platform is fully responsive and works in the browser on desktop, tablet and mobile. Simply open the site on your device and log in with your account.',
    },
    {
      q: 'Which languages are supported?',
      a: 'The interface is available in multiple languages including English, German, Romanian and Slovak. The language is selected automatically based on your region, and you can change it from the menu at any time.',
    },
  ],
};

const games = {
  id: 'games',
  title: 'Games',
  faqs: [
    {
      q: 'How do daily games work?',
      a: 'Every day we suggest a small set of games tailored to your profile and recent performance. Completing your daily games keeps your streak alive and steadily improves your scores across different cognitive categories.',
    },
    {
      q: 'How is my game score calculated?',
      a: 'Each game measures a specific skill such as memory, logic, attention or speed. Your score reflects a combination of accuracy and completion time, normalised so results are comparable across sessions and against other players.',
    },
    {
      q: 'What are streaks and how do I keep them?',
      a: 'A streak counts the number of consecutive days you have been active. Play at least one recommended game each day to extend your streak. Missing a day resets it, so a little practice every day goes a long way.',
    },
    {
      q: 'Why didn\'t my game result save?',
      a: 'Scores are saved automatically when a game finishes. If a result is missing, it is usually due to a lost internet connection or closing the game before it completed. Check your connection and finish the game through to the results screen.',
    },
  ],
};

const assessments = {
  id: 'assessments',
  title: 'Assessments & Reports',
  faqs: [
    {
      q: 'What assessments are available?',
      a: 'We offer several professional assessments, including a full IQ test, an ADHD screening and an Emotional Intelligence assessment. Each one produces a detailed report with your results and personalised insights.',
    },
    {
      q: 'How long does an assessment take?',
      a: 'Most assessments take between 10 and 30 minutes depending on the type. Try to complete an assessment in one sitting, in a quiet environment, for the most accurate result.',
    },
    {
      q: 'How do I view or download my report and certificate?',
      a: 'Your completed reports and certificates are available in your Profile under Certificates. Open the one you want and use the download button to save it as a PDF.',
      link: { label: 'Go to my Profile', to: '/profile' },
    },
    {
      q: 'Can I retake an assessment?',
      a: 'Yes. You can take an assessment again to see how your results change over time. Each attempt is stored so you can compare your progress across dates.',
    },
    {
      q: 'What does my IQ score mean?',
      a: 'Your IQ score places your result on a standardised scale relative to the general population for your age group. The accompanying report explains your strengths by category and where you have the most room to grow.',
    },
  ],
};

const badges = {
  id: 'badges',
  title: 'Badges & Leaderboard',
  faqs: [
    {
      q: 'What are badges and how do I earn them?',
      a: 'Badges are achievements you unlock by reaching milestones, such as completing games, maintaining streaks or scoring highly on assessments. You can view all the badges you have earned in your Profile.',
    },
    {
      q: 'Why didn\'t I get a badge after a game?',
      a: 'Badges are awarded only when their specific criteria are fully met. Some badges require a streak, a minimum score or several completed sessions, and a few may take a short time to appear after you qualify.',
    },
    {
      q: 'How is the leaderboard rank calculated?',
      a: 'Your rank is based on your overall performance, combining total points earned, accuracy and consistency across games and assessments. You can view global rankings and filter by country and age group.',
    },
    {
      q: 'How often does the leaderboard update?',
      a: 'The leaderboard updates continuously as you and other players complete activities, so your rank reflects your most recent results.',
    },
  ],
};

const account = {
  id: 'account',
  title: 'Account & Privacy',
  faqs: [
    {
      q: 'How do I update my profile?',
      a: 'Open your Profile and select Edit Profile. You can update your name, avatar, age and country. Keeping your details up to date helps us give you more accurate results and rankings.',
      link: { label: 'Edit my profile', to: '/profile' },
    },
    {
      q: 'How do I change my password?',
      a: 'Go to Settings and choose Update Password. Enter your current password and set a new one. If you signed up with a phone number and do not see this option, a password is not required for your account.',
      link: { label: 'Update password', to: '/update-password' },
    },
    {
      q: 'How can I download all of my personal data?',
      a: 'Under GDPR you have the right to a copy of the personal data we hold about you. Go to Settings and open Data & GDPR to download everything associated with your account in a single file.',
      link: { label: 'Open Data & GDPR', to: '/data-privacy' },
    },
    {
      q: 'How is my data protected?',
      a: 'We only collect the data needed to run the service and never sell your personal information. Sensitive details such as your password are stored securely and are never included in data exports. See our Privacy Policy for full details.',
      link: { label: 'Read Privacy Policy', to: '/privacy-policy' },
    },
    {
      q: 'Can I delete my account?',
      a: 'Yes. If you would like your account and associated personal data permanently removed, please contact our support team and we will process your request. Note that account deletion is irreversible.',
    },
  ],
};

const troubleshooting = {
  id: 'troubleshooting',
  title: 'Troubleshooting',
  faqs: [
    {
      q: 'A game won\'t load or is stuck. What should I do?',
      a: [
        'Refresh the page and try again.',
        'Check that you have a stable internet connection.',
        'Clear your browser cache or try a different, up-to-date browser.',
        'If the problem continues, raise a support ticket and tell us which game is affected.',
      ],
    },
    {
      q: 'I\'m not receiving notifications.',
      a: 'Make sure notifications are enabled in Settings under Notification Preferences, and that your browser or device has granted notification permission to the site.',
      link: { label: 'Notification preferences', to: '/notification-preferences' },
    },
    {
      q: 'The app looks broken or is running slowly.',
      a: 'This is usually caused by an outdated browser or a slow connection. Update your browser to the latest version, close unused tabs, and reload the page.',
    },
    {
      q: 'I found a bug. How do I report it?',
      a: 'We\'d love to hear about it. Raise a ticket describing what happened and the steps to reproduce it, and our team will look into it.',
      link: { label: 'Raise a ticket', to: '/client-ticket' },
    },
  ],
};

// ---- Billing category (card / Stripe mode only) --------------------------

const billingStripe = {
  id: 'billing',
  title: 'Billing & Payments',
  faqs: [
    {
      q: 'How does billing work?',
      a: 'Paid assessments and premium subscriptions are billed securely by card through our payment provider, Stripe. You enter your card details at checkout and are charged for the plan or item you select.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept major credit and debit cards, including Visa, Mastercard and American Express. Available methods may vary slightly depending on your country.',
    },
    {
      q: 'How do I start a subscription or buy premium?',
      a: 'Choose a plan from the Pricing or Subscription page and complete the secure checkout. Your premium features are unlocked as soon as the payment is confirmed.',
      link: { label: 'View plans', to: '/pricing' },
    },
    {
      q: 'How do I view or change my payment method?',
      a: 'Open the Subscription page in your account to see your current plan and update the card on file. New charges will use your updated payment method.',
      link: { label: 'Manage subscription', to: '/subscription' },
    },
    {
      q: 'How do I cancel my subscription?',
      a: 'You can cancel at any time from the Subscription page. Your premium access remains active until the end of the current billing period, and you will not be charged again after that.',
      link: { label: 'Manage subscription', to: '/subscription' },
    },
    {
      q: 'Will I get a refund if I cancel?',
      a: 'When you cancel, you keep access until the end of the period you have already paid for; future renewals stop. For questions about a specific charge or a refund, please contact our support team.',
    },
    {
      q: 'Where can I find my invoices and receipts?',
      a: 'A receipt is emailed to you after each successful payment. You can also review your orders and payment history from your account.',
    },
    {
      q: 'What currency am I charged in?',
      a: 'Prices are shown and charged in your local currency where supported (for example EUR). The exact amount and currency are always displayed before you confirm a payment.',
    },
    {
      q: 'My payment failed. What should I do?',
      a: 'Payments can fail due to insufficient funds, an expired card or a bank security check. Verify your card details, ensure the card is valid, and try again. If it still fails, contact your bank or our support team.',
    },
    {
      q: 'Is my card information secure?',
      a: 'Yes. Card payments are processed by Stripe, a PCI-DSS Level 1 certified provider. We never see or store your full card number on our servers.',
    },
  ],
};

/**
 * Returns the ordered list of FAQ categories for the given billing mode.
 * In 'msisdn' mode the Billing & Payments category is omitted, since billing
 * is handled entirely by the user's mobile operator.
 * @param {'msisdn'|'stripe'} mode
 */
export function getFaqCategories(mode) {
  const categories = [gettingStarted, games, assessments, badges];

  if (mode !== 'msisdn') {
    categories.push(billingStripe);
  }

  categories.push(account, troubleshooting);
  return categories;
}
