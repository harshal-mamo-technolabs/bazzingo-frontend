import React from 'react';
import TranslatedText from '../TranslatedText.jsx';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };

const PRIVACY_CONTACT_EMAIL = 'lumria.sk@silverlines.info';

export function PrivacyPolicyBody() {
  return (
    <>
      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="Privacy rules" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="This Privacy Policy explains our commitments and your rights regarding your information. We recommend that you read it carefully. If you do not agree with it, please do not use our websites or services." />
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="This Privacy Policy is incorporated into and forms part of our Terms of Use and applies to the same services and websites. Any terms used here without definition have the same meaning as in the Terms of Use." />
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: we wrote this policy so that you understand what information we collect, how we use it, and what choices you have." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="1. How we collect information" />
        </h3>
        <p className="text-gray-600 mb-2" style={bodyStyle}>
          <TranslatedText text="We collect information in three main ways:" />
        </p>
        <p className="text-gray-600 mb-2 font-semibold" style={bodyStyle}>
          <TranslatedText text="1.1 When you provide it to us or give us permission to obtain it" />
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We may collect information from you in various ways, such as your name, email address, phone number, and bank account details. You can also visit our websites anonymously if you choose. We only collect information when you voluntarily decide to provide it. You can always refuse to provide information." />
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="If you subscribe to our service, we or your mobile network operator will collect information related to your subscription payment. Account and billing data collected by the mobile operator are subject to its own privacy policy." />
        </p>
        <p className="text-gray-600 mb-2 font-semibold" style={bodyStyle}>
          <TranslatedText text="1.2 Technical information when you use the sites and/or services" />
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="Whenever you visit our websites or use our services, we may automatically collect technical information such as device type, screen size, browser type, approximate geographic location (country), unique device identifiers, IP address, mouse movements, entry pages, operating system, and information about how you use our services." />
        </p>
        <p className="text-gray-600 mb-2 font-semibold" style={bodyStyle}>
          <TranslatedText text="1.3 Use of cookies and similar technologies" />
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We use cookies and other technologies to collect technical information. A cookie is a piece of information stored on your device. We use them, for example, to save language preferences or other settings so that you do not need to enter them every time you visit." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="2. Partners and advertisers" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We also receive information about you and your activities from our partners and advertisers. We mainly use services such as Google Analytics, Google Ads (remarketing), Hotjar, and Google DoubleClick to help us understand how you use our sites and to show you relevant advertising." />
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="These services may store their own cookies on your device. Google Analytics generally does not collect information that directly identifies you; it works with anonymized IP addresses and statistics. Hotjar records your interactions with the sites (for example, clicks and mouse movements) to improve user experience. DoubleClick uses cookies to show relevant ads and measure conversions." />
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: online advertisers or third parties share information with us so we can measure or improve the performance of our services and understand which type of advertising is appropriate for you." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="3. How to prevent cookies from being stored" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="You can configure your web browser to refuse cookies or to alert you when cookies are being sent. You can also prevent Google Analytics from collecting your data by installing the browser add-on at" />{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            https://tools.google.com/dlpage/gaoptout
          </a>{' '}
          <TranslatedText text="or by adjusting your ad settings at" />{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            https://www.google.com/settings/ads
          </a>
          .
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="You can prevent Hotjar from collecting your data at" />{' '}
          <a
            href="https://www.hotjar.com/opt-out"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            www.hotjar.com/opt-out
          </a>
          .{' '}
          <TranslatedText text="In short: you can prevent cookies from being stored by changing your browser settings or via the relevant service pages." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="4. How we use your information" />
        </h3>
        <p className="text-gray-600 mb-2" style={bodyStyle}>
          <TranslatedText text="We mainly use your information to:" />
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
          <li><TranslatedText text="provide the services you request;" /></li>
          <li><TranslatedText text="bill and collect fees for services;" /></li>
          <li><TranslatedText text="send marketing communications (if you have given your consent);" /></li>
          <li><TranslatedText text="provide customer support;" /></li>
          <li><TranslatedText text="protect our rights or property;" /></li>
          <li><TranslatedText text="enforce compliance with our terms of service;" /></li>
          <li><TranslatedText text="comply with legal requirements;" /></li>
          <li><TranslatedText text="improve our sites and services;" /></li>
          <li><TranslatedText text="respond to your questions, requests, and other inquiries." /></li>
        </ul>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We rely mainly on contract performance (providing the service), our legitimate interests (improving services, security, analytics), and your consent (for example, for marketing or optional cookies) as legal bases for processing your data." />
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: we use your data to provide our services, display relevant ads, improve our sites, meet legal obligations, and respond to your requests." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="5. Data retention period" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We keep your information only for as long as necessary to provide our services, fulfill legal obligations, resolve disputes, and enforce our agreements. When we no longer need your data or are no longer required to keep it for legal reasons, we either delete it or anonymize it so that you can no longer be identified." />
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: we do not keep your data longer than necessary." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="6. How we protect your data (including outside the EU)" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We take appropriate technical and organizational measures to protect your personal data from unauthorized or accidental access, alteration, disclosure, or destruction. This includes using secure servers, encryption, access controls, and regular security reviews." />
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="Because we operate internationally, your data may be transferred outside the European Union. In such cases, we ensure an adequate level of protection through appropriate contractual and technical safeguards." />
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: we work hard to protect your information regardless of where it is processed." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="7. Sharing your information" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We share your information with online advertisers and third-party companies that we use to audit or improve the delivery and performance of ads or content (such as Google Analytics, Google Ads, and Hotjar). We do not sell personal data to third parties." />
        </p>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We may also disclose information where required by law or where we believe in good faith that disclosure is necessary to comply with the law, protect our rights or property, or protect the safety of individuals." />
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: we share your data only to the extent necessary with trusted partners or when required by law." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="8. Protection of children's data" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We do not knowingly collect personal data from children under 13 years of age. If we learn that we have inadvertently collected such data, we will delete it without delay. If you believe that we have information about a child under 13, please contact us at" />{' '}
          <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`} className="text-blue-600 underline">
            {PRIVACY_CONTACT_EMAIL}
          </a>
          .
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: we do not collect information about children under 13 years of age." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="9. Acceptance of this policy" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="By using our websites or services, you agree to the collection and use of your information in accordance with this Privacy Policy. We reserve the right to modify this policy at any time by publishing the changes on this page." />
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: by using the sites and services, you agree to this Privacy Policy." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="10. Changes to this policy" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We may update this Privacy Policy from time to time. Any changes will be published on this page so you always have access to the latest version. We recommend that you regularly check the date of the last revision." />
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="In short: we regularly review and update this policy." />
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 className="text-gray-900" style={headingStyle}>
          <TranslatedText text="11. Your rights and contact" />
        </h3>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="We want you to have control over how we use your personal data. You can:" />
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
          <li><TranslatedText text="request a copy of the personal data we hold about you;" /></li>
          <li><TranslatedText text="inform us of changes to your personal data or ask us to correct inaccuracies;" /></li>
          <li><TranslatedText text="in certain situations, request deletion, blocking, or restriction of processing;" /></li>
          <li><TranslatedText text="in certain situations, request data portability to a third party;" /></li>
          <li><TranslatedText text="withdraw consent where processing is based on consent;" /></li>
          <li><TranslatedText text="object to processing based on legitimate interests." /></li>
        </ul>
        <p className="text-gray-600 mb-4" style={bodyStyle}>
          <TranslatedText text="For any requests or questions regarding this Privacy Policy, please contact us by email at" />{' '}
          <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`} className="text-blue-600 underline">
            {PRIVACY_CONTACT_EMAIL}
          </a>
          .
        </p>
        <p className="text-gray-600" style={bodyStyle}>
          <TranslatedText text="If you are located in the EEA and believe that we have not complied with data protection laws, you have the right to lodge a complaint with the relevant supervisory authority." />
        </p>
      </div>
    </>
  );
}

export default PrivacyPolicyBody;
