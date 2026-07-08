import React from 'react';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };
const subLabelStyle = { ...bodyStyle, fontWeight: 600, marginTop: '12px', marginBottom: '6px' };
const listStyle = { ...bodyStyle, paddingLeft: '20px', listStyleType: 'disc', marginBottom: '8px' };

export function PrivacyPolicyBody() {
  return (
    <>
      <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '12px' }}>
        This Privacy Policy explains how Comparo media, Ul. Milutina Barača 7, Rijeka, Croatia, operating under the brand name &ldquo;Testbrain&rdquo; (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), collects, uses, stores, and protects your personal data in accordance with the EU General Data Protection Regulation (GDPR), the Swiss Federal Act on Data Protection (FADP), the California Consumer Privacy Act (CCPA), and other applicable privacy laws when you use our IQ testing and brain training platform at testbrain.com.
      </p>
      <p className="text-gray-500" style={{ ...bodyStyle, fontSize: '13px', marginBottom: '24px' }}>
        Last Updated: 26.03.2026
      </p>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>1. Data Controller</h3>
        <p className="text-gray-600 mb-2" style={bodyStyle}>The data controller responsible for your personal data is:</p>
        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '12px' }}>
          Comparo Media<br />
          Ul. Milutina Barača 7,<br />
          Rijeka, Croatia<br />
          Operating as: Testbrain
        </p>
        <p className="text-gray-800" style={subLabelStyle}>Contact:</p>
        <p className="text-gray-600" style={bodyStyle}>
          Email:{' '}
          <a href="mailto:support@testbrain.net" className="text-blue-600 underline">support@testbrain.net</a>
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>2. Data We Collect</h3>

        <p className="text-gray-800" style={subLabelStyle}>Personal Identification Data:</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>Full name (for certificate generation)</li>
          <li>Email address (for account management and communication)</li>
          <li>Age (for anonymized statistical analysis)</li>
          <li>Country (for regional statistics)</li>
        </ul>

        <p className="text-gray-800" style={subLabelStyle}>Payment Data:</p>
        <p className="text-gray-600" style={bodyStyle}>
          Credit and debit card payments are securely processed by Stripe, Inc., our PCI DSS Level 1 certified payment processor. We do not store, process, or have access to your full card number, CVV, or PIN. We may receive and store the last four digits of your card number, card type, and expiration date for transaction reference purposes only.
        </p>

        <p className="text-gray-800" style={subLabelStyle}>Usage Data:</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>IQ test results and quiz answers</li>
          <li>Performance metrics and progress tracking</li>
        </ul>

        <p className="text-gray-800" style={subLabelStyle}>Technical Data:</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>3. Legal Basis for Processing</h3>
        <p className="text-gray-600" style={bodyStyle}>We process your personal data based on the following legal grounds:</p>

        <p className="text-gray-800" style={subLabelStyle}>Contract Performance (Art. 6(1)(b) GDPR):</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>Providing our IQ testing and brain training services</li>
          <li>Generating personalized certificates</li>
          <li>Processing payments and managing subscriptions</li>
        </ul>

        <p className="text-gray-800" style={subLabelStyle}>Legitimate Interests (Art. 6(1)(f) GDPR):</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>Improving our services and user experience</li>
          <li>Fraud prevention and security</li>
          <li>Analytics to optimize platform performance</li>
        </ul>

        <p className="text-gray-800" style={subLabelStyle}>Consent (Art. 6(1)(a) GDPR):</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>Marketing communications (if applicable)</li>
          <li>Non-essential cookies</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>4. Purposes of Processing</h3>
        <p className="text-gray-600" style={bodyStyle}>We use your personal data to:</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>Provide IQ testing and cognitive assessment services</li>
          <li>Generate and deliver personalized IQ certificates</li>
          <li>Process credit/debit card payments via Stripe</li>
          <li>Manage your subscription (trial and recurring billing)</li>
          <li>Send test results and performance reports</li>
          <li>Provide customer support</li>
          <li>Improve our algorithms and services</li>
          <li>Comply with legal obligations</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>5. Data Recipients</h3>
        <p className="text-gray-600" style={bodyStyle}>We may share your data with the following third parties:</p>

        <p className="text-gray-800" style={subLabelStyle}>Stripe, Inc. (Payment Processing):</p>
        <p className="text-gray-600" style={bodyStyle}>
          Stripe processes all credit and debit card transactions securely. Stripe is PCI DSS Level 1 certified. Learn more at:{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://stripe.com/privacy</a>
        </p>

        <p className="text-gray-800" style={subLabelStyle}>Cloud Hosting Providers:</p>
        <p className="text-gray-600 mb-2" style={bodyStyle}>Our platform is hosted on secure cloud servers.</p>

        <p className="text-gray-800" style={{ ...bodyStyle, fontWeight: 600 }}>We never sell your personal data to third parties.</p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>6. International Data Transfers</h3>
        <p className="text-gray-600 mb-2" style={bodyStyle}>
          Your personal data may be processed in Switzerland, the European Economic Area (EEA), and the United States.
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          When data is transferred outside Switzerland or the EEA (e.g., Stripe servers in the US), we ensure appropriate safeguards are in place:
        </p>
        <ul className="text-gray-600" style={listStyle}>
          <li>EU Standard Contractual Clauses (SCCs)</li>
          <li>Swiss-U.S. and EU-U.S. Data Privacy Framework</li>
          <li>Adequacy decisions by the European Commission or the Swiss Federal Data Protection and Information Commissioner (FDPIC)</li>
          <li>Certification under recognized frameworks</li>
        </ul>
        <p className="text-gray-600" style={bodyStyle}>
          Transfers comply with the GDPR, Swiss FADP, and applicable US privacy regulations.
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>7. Data Retention Periods</h3>
        <ul className="text-gray-600" style={listStyle}>
          <li><strong>Account Data:</strong> Retained while your account is active, plus 3 years for tax/legal purposes.</li>
          <li><strong>Test Results:</strong> Retained while your account is active. You may request deletion at any time.</li>
          <li><strong>Payment Records:</strong> Retained for 7 years as required by Swiss and EU tax regulations.</li>
          <li><strong>Certificates:</strong> Retained indefinitely unless deletion is requested.</li>
          <li><strong>Technical Logs:</strong> Automatically deleted after 90 days.</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>8. Your Privacy Rights</h3>

        <p className="text-gray-800" style={subLabelStyle}>Rights for EU/EEA Residents (GDPR):</p>
        <ul className="text-gray-600" style={listStyle}>
          <li><strong>Right of Access (Art. 15):</strong> Request a copy of your personal data.</li>
          <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate personal data.</li>
          <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
          <li><strong>Right to Restriction (Art. 18):</strong> Restrict processing of your data.</li>
          <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a machine-readable format.</li>
          <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests.</li>
          <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
          <li><strong>Right to Complain:</strong> Lodge a complaint with your local Data Protection Authority.</li>
        </ul>

        <p className="text-gray-800" style={subLabelStyle}>Rights for Swiss Residents (FADP):</p>
        <p className="text-gray-600" style={bodyStyle}>
          You have similar rights under the Swiss Federal Act on Data Protection, including the right of access, rectification, and deletion. You may lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC).
        </p>

        <p className="text-gray-800" style={subLabelStyle}>Rights for California Residents (CCPA):</p>
        <p className="text-gray-600" style={bodyStyle}>If you are a California resident, you have the right to:</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>Know what personal information we collect and how it is used</li>
          <li>Request deletion of your personal information</li>
          <li>Opt out of the sale of your personal information (we do not sell personal data)</li>
          <li>Non-discrimination for exercising your privacy rights</li>
        </ul>
        <p className="text-gray-600" style={bodyStyle}>
          To exercise any of these rights, contact us at:{' '}
          <a href="mailto:support@testbrain.net" className="text-blue-600 underline">support@testbrain.net</a>
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>9. Cookies &amp; Tracking</h3>
        <p className="text-gray-600" style={bodyStyle}>We use cookies and similar technologies:</p>
        <ul className="text-gray-600" style={listStyle}>
          <li><strong>Essential Cookies:</strong> Required for platform functionality (e.g., authentication, security).</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform.</li>
          <li><strong>Preference Cookies:</strong> Remember your language and theme settings.</li>
        </ul>
        <p className="text-gray-600" style={bodyStyle}>
          You can manage cookie preferences through your browser settings. For more information on cookies, visit{' '}
          <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">www.allaboutcookies.org</a>.
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>10. Data Security</h3>
        <p className="text-gray-600" style={bodyStyle}>We implement industry-standard security measures:</p>
        <ul className="text-gray-600" style={listStyle}>
          <li>SSL/TLS encryption for all data transmission</li>
          <li>Secure credit/debit card processing via Stripe (PCI DSS Level 1 compliant)</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and employee training</li>
          <li>Encrypted data storage</li>
          <li>No storage of full card numbers on our servers</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>11. Contact Us</h3>
        <p className="text-gray-600 mb-2" style={bodyStyle}>
          For questions about this Privacy Policy or to exercise your privacy rights, please contact us:
        </p>
        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '12px' }}>
          Comparo Media<br />
          Ul. Milutina Barača 7<br />
          Rijeka, Croatia<br />
          Email:{' '}
          <a href="mailto:support@testbrain.net" className="text-blue-600 underline">support@testbrain.net</a>
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          We will respond to all requests within 30 days as required by the GDPR, or within 45 days for CCPA requests (with possible extension upon notice).
        </p>
      </div>
    </>
  );
}

export default PrivacyPolicyBody;
