import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';
import { TestbrainPrivacyBody } from '../components/legal/TestbrainLegalContent.jsx';
import { COUNTRY_PROFILE_CONTROLS } from '../config/accessControl.js';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };

function PrivacyPolicy() {
    const navigate = useNavigate();

    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex,follow';
        meta.setAttribute('data-bazzingo-page-robots', '');
        document.head.appendChild(meta);
        return () => {
            meta.remove();
        };
    }, []);

    const activeCountry = COUNTRY_PROFILE_CONTROLS?.activeCountry;
    const isGermany = activeCountry === 'Germany';
    const isSlovakia = activeCountry === 'Slovakia';
    const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
    const isTestbrainDomain = hostname === 'testbrain.net' || hostname.endsWith('.testbrain.net');

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            <Header unreadCount={3} />
            <main>
                <div className="mx-auto px-4 lg:px-12 pt-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}>
                                <TranslatedText text="Privacy Policy" />
                            </span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                <TranslatedText text="Privacy Policy" />
                            </span>
                        </h2>
                    </div>
                    <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400' }}>
                        {isTestbrainDomain ? (
                            <TranslatedText text='This Privacy Policy explains how Comparo media, Ul. Milutina Barača 7, Rijeka, Croatia, operating under the brand name "Bazzingo" ("we," "us," or "our"), collects, uses, stores, and protects your personal data in accordance with the EU General Data Protection Regulation (GDPR), the Swiss Federal Act on Data Protection (FADP), the California Consumer Privacy Act (CCPA), and other applicable privacy laws when you use our IQ testing and brain training platform at bazzingo.com.' />
                        ) : (
                            <TranslatedText text="By using Bazzingo, you agree to the following privacy terms and conditions." />
                        )}
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        {isTestbrainDomain ? (
                            <TestbrainPrivacyBody />
                        ) : isSlovakia ? (
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
                                        <li>
                                            <TranslatedText text="provide the services you request;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="bill and collect fees for services;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="send marketing communications (if you have given your consent);" />
                                        </li>
                                        <li>
                                            <TranslatedText text="provide customer support;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="protect our rights or property;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="enforce compliance with our terms of service;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="comply with legal requirements;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="improve our sites and services;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="respond to your questions, requests, and other inquiries." />
                                        </li>
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
                                        <a href="mailto:support@bazzingo.net" className="text-blue-600 underline">
                                            support@bazzingo.net
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
                                        <li>
                                            <TranslatedText text="request a copy of the personal data we hold about you;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="inform us of changes to your personal data or ask us to correct inaccuracies;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="in certain situations, request deletion, blocking, or restriction of processing;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="in certain situations, request data portability to a third party;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="withdraw consent where processing is based on consent;" />
                                        </li>
                                        <li>
                                            <TranslatedText text="object to processing based on legitimate interests." />
                                        </li>
                                    </ul>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        <TranslatedText text="For any requests or questions regarding this Privacy Policy, please contact us by email at" />{' '}
                                        <a href="mailto:support@bazzingo.net" className="text-blue-600 underline">
                                            support@bazzingo.net
                                        </a>
                                        .
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="If you are located in the EEA and believe that we have not complied with data protection laws, you have the right to lodge a complaint with the relevant supervisory authority." />
                                    </p>
                                </div>
                            </>
                        ) : isGermany ? (
                            <>
                                <p className="text-gray-600 mb-6" style={bodyStyle}>
                                    <TranslatedText text="This Privacy Policy explains how Bazzingo (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, stores, and protects your personal data in accordance with the General Data Protection Regulation (GDPR) and other applicable EU data protection laws when you use our IQ testing and brain training platform." />
                                </p>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Data Controller" />
                                    </h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="Bazzingo is the data controller responsible for your personal data. We are responsible for deciding how your personal data is collected and used." />
                                    </p>
                                    <p className="text-gray-600 mt-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Contact Details:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="Email: privacy@bazzingo.com" />
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
                                        <TranslatedText text="Payment information is securely processed by Stripe, our payment processor. We do not store your full card details on our servers." />
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
                                            <TranslatedText text="Process payments via Stripe" />
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
                                            <TranslatedText text="Stripe (Payment Processing):" />
                                        </strong>
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        <TranslatedText text="Stripe processes all payment transactions securely. Stripe is PCI DSS Level 1 certified. Learn more at:" />{' '}
                                        <a
                                            href="https://stripe.com/privacy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            https://stripe.com/privacy
                                        </a>
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Cloud Hosting Providers:" />
                                        </strong>
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        <TranslatedText text="Our platform is hosted on secure cloud servers within the EU." />
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
                                        <TranslatedText text="Your personal data is primarily processed within the European Economic Area (EEA)." />
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="When data is transferred outside the EEA (e.g., Stripe servers in the US), we ensure appropriate safeguards are in place:" />
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="EU Standard Contractual Clauses (SCCs)" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Adequacy decisions by the European Commission" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Certification under recognized frameworks" />
                                        </li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Data Retention Periods" />
                                    </h3>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Account Data:" />
                                            </strong>{' '}
                                            <TranslatedText text="Retained while your account is active, plus 3 years for tax/legal purposes." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Test Results:" />
                                            </strong>{' '}
                                            <TranslatedText text="Retained while your account is active. You may request deletion at any time." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Payment Records:" />
                                            </strong>{' '}
                                            <TranslatedText text="Retained for 7 years as required by tax regulations." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Certificates:" />
                                            </strong>{' '}
                                            <TranslatedText text="Retained indefinitely unless deletion is requested." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Technical Logs:" />
                                            </strong>{' '}
                                            <TranslatedText text="Automatically deleted after 90 days." />
                                        </li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Your GDPR Rights" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="Under the GDPR, you have the following rights:" />
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Right of Access (Art. 15):" />
                                            </strong>{' '}
                                            <TranslatedText text="Request a copy of your personal data." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Right to Rectification (Art. 16):" />
                                            </strong>{' '}
                                            <TranslatedText text="Correct inaccurate personal data." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Right to Erasure (Art. 17):" />
                                            </strong>{' '}
                                            <TranslatedText text="Request deletion of your data (&quot;right to be forgotten&quot;)." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Right to Restriction (Art. 18):" />
                                            </strong>{' '}
                                            <TranslatedText text="Restrict processing of your data." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Right to Data Portability (Art. 20):" />
                                            </strong>{' '}
                                            <TranslatedText text="Receive your data in a machine-readable format." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Right to Object (Art. 21):" />
                                            </strong>{' '}
                                            <TranslatedText text="Object to processing based on legitimate interests." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Withdraw Consent:" />
                                            </strong>{' '}
                                            <TranslatedText text="Withdraw consent at any time where processing is based on consent." />
                                        </li>
                                        <li>
                                            <strong>
                                                <TranslatedText text="Right to Complain:" />
                                            </strong>{' '}
                                            <TranslatedText text="Lodge a complaint with your local Data Protection Authority." />
                                        </li>
                                    </ul>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="To exercise any of these rights, contact us at: privacy@bazzingo.com" />
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Cookies &amp; Tracking" />
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
                                        <TranslatedText text="You can manage cookie preferences through your browser settings." />
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
                                            <TranslatedText text="Secure payment processing via Stripe (PCI DSS compliant)" />
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
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Contact Us" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="For questions about this Privacy Policy or to exercise your rights, please contact us:" />
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="Email: privacy@bazzingo.com" />
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Data Protection Officer:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="For data protection inquiries, please contact our DPO at: dpo@bazzingo.com" />
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="We will respond to all requests within 30 days as required by the GDPR." />
                                    </p>
                                    <p className="text-gray-600 mt-4" style={bodyStyle}>
                                        <TranslatedText text="This Privacy Policy may be updated periodically. We will notify you of any material changes." />
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}><TranslatedText text="1. User Agreement" /></h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." />
                                    </p>
                                </div>
                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}><TranslatedText text="2. Platform Usage" /></h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." />
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;
