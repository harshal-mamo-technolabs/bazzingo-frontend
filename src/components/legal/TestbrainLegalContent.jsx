import React from 'react';
import TranslatedText from '../TranslatedText.jsx';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };

/** Testbrain.net-only Privacy Policy body (English keys → TranslatedText / staticTranslations). */
export function TestbrainPrivacyBody() {
    return (
        <>
            <p className="text-gray-600 mb-6" style={bodyStyle}>
                <TranslatedText text="Last Updated: 26.03.2026" />
            </p>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Data Controller" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="The data controller responsible for your personal data is:" />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <TranslatedText text="Comparo Media" />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <TranslatedText text="Ul. Milutina Barača 7, " />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <TranslatedText text="Rijeka, Croatia" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Operating as: Bazzingo" />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Contact:" />
                    </strong>
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="Email: support@bazzingo.net" />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Data We Collect" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Personal Identification Data:" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Full name (for certificate generation)" />
                    </li>
                    <li>
                        <TranslatedText text="Email address (for account management and communication)" />
                    </li>
                    <li>
                        <TranslatedText text="Age (for anonymized statistical analysis)" />
                    </li>
                    <li>
                        <TranslatedText text="Country (for regional statistics)" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Payment Data:" />
                    </strong>
                </p>
                <p className="text-gray-600 mb-4" style={bodyStyle}>
                    <TranslatedText text="Credit and debit card payments are securely processed by Stripe, Inc., our PCI DSS Level 1 certified payment processor. We do not store, process, or have access to your full card number, CVV, or PIN. We may receive and store the last four digits of your card number, card type, and expiration date for transaction reference purposes only." />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Usage Data:" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="IQ test results and quiz answers" />
                    </li>
                    <li>
                        <TranslatedText text="Performance metrics and progress tracking" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Technical Data:" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                    <li>
                        <TranslatedText text="IP address" />
                    </li>
                    <li>
                        <TranslatedText text="Browser type and version" />
                    </li>
                    <li>
                        <TranslatedText text="Device information" />
                    </li>
                    <li>
                        <TranslatedText text="Cookies and similar tracking technologies" />
                    </li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Legal Basis for Processing" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="We process your personal data based on the following legal grounds:" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Contract Performance (Art. 6(1)(b) GDPR):" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Providing our IQ testing and brain training services" />
                    </li>
                    <li>
                        <TranslatedText text="Generating personalized certificates" />
                    </li>
                    <li>
                        <TranslatedText text="Processing payments and managing subscriptions" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Legitimate Interests (Art. 6(1)(f) GDPR):" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Improving our services and user experience" />
                    </li>
                    <li>
                        <TranslatedText text="Fraud prevention and security" />
                    </li>
                    <li>
                        <TranslatedText text="Analytics to optimize platform performance" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Consent (Art. 6(1)(a) GDPR):" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Marketing communications (if applicable)" />
                    </li>
                    <li>
                        <TranslatedText text="Non-essential cookies" />
                    </li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Purposes of Processing" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="We use your personal data to:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Provide IQ testing and cognitive assessment services" />
                    </li>
                    <li>
                        <TranslatedText text="Generate and deliver personalized IQ certificates" />
                    </li>
                    <li>
                        <TranslatedText text="Process credit/debit card payments via Stripe" />
                    </li>
                    <li>
                        <TranslatedText text="Manage your subscription (trial and recurring billing)" />
                    </li>
                    <li>
                        <TranslatedText text="Send test results and performance reports" />
                    </li>
                    <li>
                        <TranslatedText text="Provide customer support" />
                    </li>
                    <li>
                        <TranslatedText text="Improve our algorithms and services" />
                    </li>
                    <li>
                        <TranslatedText text="Comply with legal obligations" />
                    </li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Data Recipients" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="We may share your data with the following third parties:" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Stripe, Inc. (Payment Processing):" />
                    </strong>
                </p>
                <p className="text-gray-600 mb-4" style={bodyStyle}>
                    <TranslatedText text="Stripe processes all credit and debit card transactions securely. Stripe is PCI DSS Level 1 certified. Learn more at:" />{' '}
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        https://stripe.com/privacy
                    </a>
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Cloud Hosting Providers:" />
                    </strong>
                </p>
                <p className="text-gray-600 mb-4" style={bodyStyle}>
                    <TranslatedText text="Our platform is hosted on secure cloud servers." />
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="We never sell your personal data to third parties." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="International Data Transfers" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Your personal data may be processed in Switzerland, the European Economic Area (EEA), and the United States." />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="When data is transferred outside Switzerland or the EEA (e.g., Stripe servers in the US), we ensure appropriate safeguards are in place:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="EU Standard Contractual Clauses (SCCs)" />
                    </li>
                    <li>
                        <TranslatedText text="Swiss-U.S. and EU-U.S. Data Privacy Framework" />
                    </li>
                    <li>
                        <TranslatedText text="Adequacy decisions by the European Commission or the Swiss Federal Data Protection and Information Commissioner (FDPIC)" />
                    </li>
                    <li>
                        <TranslatedText text="Certification under recognized frameworks" />
                    </li>
                </ul>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="Transfers comply with the GDPR, Swiss FADP, and applicable US privacy regulations." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Data Retention Periods" />
                </h3>
                <ul className="list-none pl-0 space-y-2 text-gray-600" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Account Data: Retained while your account is active, plus 3 years for tax/legal purposes." />
                    </li>
                    <li>
                        <TranslatedText text="Test Results: Retained while your account is active. You may request deletion at any time." />
                    </li>
                    <li>
                        <TranslatedText text="Payment Records: Retained for 7 years as required by Swiss and EU tax regulations." />
                    </li>
                    <li>
                        <TranslatedText text="Certificates: Retained indefinitely unless deletion is requested." />
                    </li>
                    <li>
                        <TranslatedText text="Technical Logs: Automatically deleted after 90 days." />
                    </li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Your Privacy Rights" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Rights for EU/EEA Residents (GDPR):" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text='Right of Access (Art. 15): Request a copy of your personal data.' />
                    </li>
                    <li>
                        <TranslatedText text='Right to Rectification (Art. 16): Correct inaccurate personal data.' />
                    </li>
                    <li>
                        <TranslatedText text='Right to Erasure (Art. 17): Request deletion of your data ("right to be forgotten").' />
                    </li>
                    <li>
                        <TranslatedText text='Right to Restriction (Art. 18): Restrict processing of your data.' />
                    </li>
                    <li>
                        <TranslatedText text='Right to Data Portability (Art. 20): Receive your data in a machine-readable format.' />
                    </li>
                    <li>
                        <TranslatedText text='Right to Object (Art. 21): Object to processing based on legitimate interests.' />
                    </li>
                    <li>
                        <TranslatedText text='Withdraw Consent: Withdraw consent at any time where processing is based on consent.' />
                    </li>
                    <li>
                        <TranslatedText text='Right to Complain: Lodge a complaint with your local Data Protection Authority.' />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Rights for Swiss Residents (FADP):" />
                    </strong>
                </p>
                <p className="text-gray-600 mb-4" style={bodyStyle}>
                    <TranslatedText text="You have similar rights under the Swiss Federal Act on Data Protection, including the right of access, rectification, and deletion. You may lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC)." />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Rights for California Residents (CCPA):" />
                    </strong>
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="If you are a California resident, you have the right to:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Know what personal information we collect and how it is used" />
                    </li>
                    <li>
                        <TranslatedText text="Request deletion of your personal information" />
                    </li>
                    <li>
                        <TranslatedText text="Opt out of the sale of your personal information (we do not sell personal data)" />
                    </li>
                    <li>
                        <TranslatedText text="Non-discrimination for exercising your privacy rights" />
                    </li>
                </ul>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="To exercise any of these rights, contact us at: support@bazzingo.net" />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Cookies & Tracking" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="We use cookies and similar technologies:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <strong>
                            <TranslatedText text="Essential Cookies:" />
                        </strong>{' '}
                        <TranslatedText text="Required for platform functionality (e.g., authentication, security)." />
                    </li>
                    <li>
                        <strong>
                            <TranslatedText text="Analytics Cookies:" />
                        </strong>{' '}
                        <TranslatedText text="Help us understand how users interact with our platform." />
                    </li>
                    <li>
                        <strong>
                            <TranslatedText text="Preference Cookies:" />
                        </strong>{' '}
                        <TranslatedText text="Remember your language and theme settings." />
                    </li>
                </ul>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="You can manage cookie preferences through your browser settings. For more information on cookies, visit " />
                    <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        www.allaboutcookies.org
                    </a>
                    .
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Data Security" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="We implement industry-standard security measures:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                    <li>
                        <TranslatedText text="SSL/TLS encryption for all data transmission" />
                    </li>
                    <li>
                        <TranslatedText text="Secure credit/debit card processing via Stripe (PCI DSS Level 1 compliant)" />
                    </li>
                    <li>
                        <TranslatedText text="Regular security audits and updates" />
                    </li>
                    <li>
                        <TranslatedText text="Access controls and employee training" />
                    </li>
                    <li>
                        <TranslatedText text="Encrypted data storage" />
                    </li>
                    <li>
                        <TranslatedText text="No storage of full card numbers on our servers" />
                    </li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Contact Us" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="For questions about this Privacy Policy or to exercise your privacy rights, please contact us:" />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <TranslatedText text="Comparo Media" />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <TranslatedText text="Ul. Milutina Barača 7" />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <TranslatedText text="Rijeka, Croatia" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Email: support@bazzingo.net" />
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="We will respond to all requests within 30 days as required by the GDPR, or within 45 days for CCPA requests (with possible extension upon notice)." />
                </p>
            </div>
        </>
    );
}

/** Testbrain.net-only Terms of Use body. */
export function TestbrainTermsBody() {
    return (
        <>
            <p className="text-gray-600 mb-4" style={bodyStyle}>
                <TranslatedText text="Last Updated: 26.03.2026" />
            </p>
            <p className="text-gray-600 mb-6" style={bodyStyle}>
                <TranslatedText text='These Terms and Conditions ("Terms") govern your use of the Bazzingo IQ testing and brain training platform operated by Comparo Media. By using our services, you agree to these Terms. Please read them carefully before making any purchase.' />
            </p>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Acceptance of Terms" />
                </h3>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="By creating an account, accessing, or using our services, you agree to be bound by these Terms and Conditions, our Privacy Policy, and all applicable laws and regulations. If you do not agree with these terms, please do not use our services." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Service Provider" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Company Name:" />
                    </strong>{' '}
                    <TranslatedText text="Comparo Media" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Operating as: Bazzingo" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Registered Address:" />
                    </strong>{' '}
                    <TranslatedText text="Ul. Milutina Barača 7, Rijeka, Croatia" />
                </p>
                <p className="text-gray-600 mb-4" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Contact Email:" />
                    </strong>{' '}
                    <TranslatedText text="support@bazzingo.net" />
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="Comparo media is a Croatian corporation providing digital IQ tests, cognitive assessments, and brain training games to users in the European Union, Switzerland, the United States, and worldwide." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Service Description" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Bazzingo provides:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Online IQ tests and cognitive assessments" />
                    </li>
                    <li>
                        <TranslatedText text="Personalized IQ certificates" />
                    </li>
                    <li>
                        <TranslatedText text="Brain training games and exercises" />
                    </li>
                    <li>
                        <TranslatedText text="Performance tracking and analytics" />
                    </li>
                    <li>
                        <TranslatedText text="Detailed cognitive assessment reports" />
                    </li>
                </ul>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="Our tests are designed for entertainment and self-improvement purposes and do not constitute official psychological assessments." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Subscription &amp; Payment" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Trial Period:" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="3-day trial for €2.99" />
                    </li>
                    <li>
                        <TranslatedText text="Full access to all features during the trial period" />
                    </li>
                    <li>
                        <TranslatedText text="Your credit or debit card will be charged €2.99 immediately upon subscribing" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="AUTOMATIC RENEWAL NOTICE:" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="After the 3-day trial period ends, your subscription will automatically renew at €35.00 per month" />
                    </li>
                    <li>
                        <TranslatedText text="You must cancel before the trial period expires to avoid being charged the monthly fee" />
                    </li>
                    <li>
                        <TranslatedText text="Monthly charges will continue to recur on the same day each month until you cancel" />
                    </li>
                    <li>
                        <TranslatedText text="Prices include VAT where applicable" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Payment Processing:" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="All payments are processed securely via Stripe, Inc." />
                    </li>
                    <li>
                        <TranslatedText text="We accept Visa, Mastercard, American Express, and other major credit and debit cards" />
                    </li>
                    <li>
                        <TranslatedText text="By providing your payment information, you authorize us to charge your card for the trial and all subsequent monthly renewal charges until cancellation" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="US AUTO-RENEWAL DISCLOSURE:" />
                    </strong>
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="This is an automatically renewing subscription. By purchasing the trial, you consent to automatic recurring charges of €35.00/month after the trial ends. You may cancel at any time before the end of the current billing period by emailing support@bazzingo.net." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Right of Withdrawal (EU/EEA Consumers)" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="This section applies to consumers residing in the EU/EEA." />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Under the EU Consumer Rights Directive (2011/83/EU), you have the right to withdraw from this contract within 14 days without giving any reason." />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Important Notice Regarding Digital Content:" />
                    </strong>
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="By beginning to use our digital services (taking IQ tests, playing games, accessing reports) during the withdrawal period, you expressly consent to:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="The performance of the digital content beginning immediately" />
                    </li>
                    <li>
                        <TranslatedText text="Acknowledge that you will lose your right of withdrawal once the digital content delivery has begun" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-4" style={bodyStyle}>
                    <TranslatedText text="This is in accordance with Article 16(m) of the EU Consumer Rights Directive." />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="To Exercise Withdrawal:" />
                    </strong>
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="Contact us at support@bazzingo.net before using the service. Refunds for eligible withdrawal requests will be processed to the original payment method within 14 days." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Cancellation Policy" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="IMPORTANT:" />
                    </strong>{' '}
                    <TranslatedText text="To avoid being charged €35.00/month, you must cancel before your 3-day trial expires." />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="How to Cancel Your Subscription:" />
                    </strong>
                </p>
                <ol className="list-decimal pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text='Send an email to support@bazzingo.net with the subject line "Cancel Subscription"' />
                    </li>
                    <li>
                        <TranslatedText text="Include your registered email address and full name" />
                    </li>
                    <li>
                        <TranslatedText text="You will receive a cancellation confirmation within 24 hours" />
                    </li>
                </ol>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Cancellation Terms:" />
                    </strong>
                </p>
                <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Cancellation takes effect at the end of the current billing period" />
                    </li>
                    <li>
                        <TranslatedText text="You retain access to paid features until the end of the current billing period" />
                    </li>
                    <li>
                        <TranslatedText text="No further charges will be applied after cancellation" />
                    </li>
                    <li>
                        <TranslatedText text="No prorated refunds for partial months" />
                    </li>
                    <li>
                        <TranslatedText text="Your test data and certificates remain accessible upon request" />
                    </li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Intellectual Property" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="All content on the Bazzingo platform is the property of Comparo Media and is protected by international copyright, trademark, and intellectual property laws:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="All IQ test questions, algorithms, and methodologies" />
                    </li>
                    <li>
                        <TranslatedText text="Brain training games and exercises" />
                    </li>
                    <li>
                        <TranslatedText text="Certificate designs and templates" />
                    </li>
                    <li>
                        <TranslatedText text="Report formats and analytics" />
                    </li>
                    <li>
                        <TranslatedText text="Website design and user interface" />
                    </li>
                    <li>
                        <TranslatedText text="The Bazzingo trademark, logos, and branding" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="You may not:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Copy, modify, or distribute our content without prior written permission" />
                    </li>
                    <li>
                        <TranslatedText text="Reverse engineer or extract our technology" />
                    </li>
                    <li>
                        <TranslatedText text="Use our materials for commercial purposes without licensing" />
                    </li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Disclaimer" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="For Entertainment Purposes:" />
                    </strong>
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Bazzingo IQ tests are designed for entertainment and self-improvement purposes. They are:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="NOT official psychological assessments" />
                    </li>
                    <li>
                        <TranslatedText text="NOT substitutes for professional cognitive testing" />
                    </li>
                    <li>
                        <TranslatedText text="NOT to be used for diagnostic or medical purposes" />
                    </li>
                    <li>
                        <TranslatedText text="NOT to be used for educational placement decisions" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Results:" />
                    </strong>{' '}
                    <TranslatedText text="IQ scores and cognitive metrics are estimates based on your test responses. They may not fully reflect your actual cognitive abilities and should not be used for important life decisions." />
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Professional Advice:" />
                    </strong>{' '}
                    <TranslatedText text="For official IQ testing or cognitive assessments, please consult a licensed psychologist." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Limitation of Liability" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="To the maximum extent permitted by applicable law (including Swiss, EU, and US law):" />
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Comparo Media (operating as Bazzingo) is not liable for indirect, incidental, special, or consequential damages" />
                    </li>
                    <li>
                        <TranslatedText text="Our total aggregate liability shall not exceed the amount you paid us in the preceding 12 months" />
                    </li>
                    <li>
                        <TranslatedText text="We do not guarantee specific results from using our services" />
                    </li>
                </ul>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="EU Consumer Rights:" />
                    </strong>{' '}
                    <TranslatedText text="These limitations do not affect your mandatory statutory rights under EU consumer protection laws, including rights related to defective digital content or services." />
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="US Consumers:" />
                    </strong>{' '}
                    <TranslatedText text="Some US states do not allow limitations on implied warranties or exclusion of certain damages. In such states, these limitations apply only to the extent permitted by law." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Dispute Resolution" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="EU Online Dispute Resolution:" />
                    </strong>{' '}
                    <TranslatedText text="For EU consumers: The European Commission provides a platform for online dispute resolution at " />
                    <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        https://ec.europa.eu/consumers/odr
                    </a>
                    <TranslatedText text=". We encourage you to contact us first to resolve disputes amicably." />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="US Dispute Resolution:" />
                    </strong>{' '}
                    <TranslatedText text="For US consumers: Any dispute arising under these Terms shall be resolved by binding individual arbitration administered under the rules of the American Arbitration Association (AAA), except that either party may bring individual claims in small claims court. You agree to waive any right to participate in a class action lawsuit or class-wide arbitration." />
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <TranslatedText text="Before initiating arbitration, you agree to contact us at support@bazzingo.net to attempt informal resolution for at least 30 days." />
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Amendments" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="We may update these Terms from time to time:" />
                </p>
                <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                    <li>
                        <TranslatedText text="Material changes will be notified at least 30 days in advance via email" />
                    </li>
                    <li>
                        <TranslatedText text="Minor changes will be posted on this page" />
                    </li>
                    <li>
                        <TranslatedText text="Continued use after changes constitutes acceptance" />
                    </li>
                    <li>
                        <TranslatedText text='The "Last Updated" date indicates the current version' />
                    </li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 className="text-gray-900" style={headingStyle}>
                    <TranslatedText text="Contact Us" />
                </h3>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="For questions about these Terms and Conditions:" />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <TranslatedText text="Comparo Media" />
                </p>
                <p className="text-gray-600 mb-1" style={bodyStyle}>
                    <TranslatedText text="Ul. Milutina Barača 7" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Rijeka, Croatia" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <TranslatedText text="Email: support@bazzingo.net" />
                </p>
                <p className="text-gray-600 mb-2" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Customer Support:" />
                    </strong>{' '}
                    <TranslatedText text="We respond to all inquiries within 2 business days." />
                </p>
                <p className="text-gray-600" style={bodyStyle}>
                    <strong>
                        <TranslatedText text="Complaints:" />
                    </strong>{' '}
                    <TranslatedText text="EU consumers may escalate disputes through the EU ODR platform. US consumers may contact the Better Business Bureau or their state attorney general's office." />
                </p>
            </div>
        </>
    );
}
