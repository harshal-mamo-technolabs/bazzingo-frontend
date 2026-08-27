import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';
import { getPlatformName } from '../config/accessControl';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };
const subLabelStyle = { ...bodyStyle, fontWeight: 600, marginTop: '12px', marginBottom: '6px' };
const listStyle = { ...bodyStyle, paddingLeft: '20px', listStyleType: 'disc', marginBottom: '8px' };

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

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            <Header unreadCount={3} />
            <main>
                <div className="mx-auto px-4 lg:px-12 pt-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft
                            style={{ height: '14px', width: '14px', marginRight: '8px' }}
                            className="text-gray-600 cursor-pointer"
                            onClick={() => navigate(-1)}
                        />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}>
                                <TranslatedText text="Privacy Policy" />
                            </span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                <TranslatedText text="Privacy Policy" />
                            </span>
                        </h2>
                    </div>
                    <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '4px' }}>
                        By using {getPlatformName()}, <TranslatedText text="you agree to the following privacy terms and conditions." />
                    </p>
                    <p className="text-gray-500" style={{ ...bodyStyle, fontSize: '13px' }}>
                        Last Updated: 26.03.2026
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '24px' }}>
                            <TranslatedText text="This Privacy Policy explains how Comparo media, Ul. Milutina Barača 7, Rijeka, Croatia, operating under the brand name &ldquo;Testbrain&rdquo; (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), collects, uses, stores, and protects your personal data in accordance with the EU General Data Protection Regulation (GDPR), the Swiss Federal Act on Data Protection (FADP), the California Consumer Privacy Act (CCPA), and other applicable privacy laws when you use our IQ testing and brain training platform at testbrain.com." />
                        </p>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>1. <TranslatedText text="Data Controller" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The data controller responsible for your personal data is:" />
                            </p>
                            <p className="text-gray-600" style={{ ...bodyStyle, marginTop: '8px' }}>
                                Comparo Media<br />
                                Ul. Milutina Barača 7,<br />
                                Rijeka, Croatia<br />
                                <TranslatedText text="Operating as: Testbrain" />
                            </p>
                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Contact:" /></p>
                            <p className="text-gray-600" style={bodyStyle}>Email: support@testbrain.net</p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>2. <TranslatedText text="Data We Collect" /></h3>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Personal Identification Data:" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Full name (for certificate generation)" /></li>
                                <li><TranslatedText text="Email address (for account management and communication)" /></li>
                                <li><TranslatedText text="Age (for anonymized statistical analysis)" /></li>
                                <li><TranslatedText text="Country (for regional statistics)" /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Payment Data:" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Credit and debit card payments are securely processed by Stripe, Inc., our PCI DSS Level 1 certified payment processor. We do not store, process, or have access to your full card number, CVV, or PIN. We may receive and store the last four digits of your card number, card type, and expiration date for transaction reference purposes only." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Usage Data:" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="IQ test results and quiz answers" /></li>
                                <li><TranslatedText text="Performance metrics and progress tracking" /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Technical Data:" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="IP address" /></li>
                                <li><TranslatedText text="Browser type and version" /></li>
                                <li><TranslatedText text="Device information" /></li>
                                <li><TranslatedText text="Cookies and similar tracking technologies" /></li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>3. <TranslatedText text="Legal Basis for Processing" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We process your personal data based on the following legal grounds:" />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Contract Performance (Art. 6(1)(b) GDPR):" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Providing our IQ testing and brain training services" /></li>
                                <li><TranslatedText text="Generating personalized certificates" /></li>
                                <li><TranslatedText text="Processing payments and managing subscriptions" /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Legitimate Interests (Art. 6(1)(f) GDPR):" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Improving our services and user experience" /></li>
                                <li><TranslatedText text="Fraud prevention and security" /></li>
                                <li><TranslatedText text="Analytics to optimize platform performance" /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Consent (Art. 6(1)(a) GDPR):" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Marketing communications (if applicable)" /></li>
                                <li><TranslatedText text="Non-essential cookies" /></li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>4. <TranslatedText text="Purposes of Processing" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We use your personal data to:" />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Provide IQ testing and cognitive assessment services" /></li>
                                <li><TranslatedText text="Generate and deliver personalized IQ certificates" /></li>
                                <li><TranslatedText text="Process credit/debit card payments via Stripe" /></li>
                                <li><TranslatedText text="Manage your subscription (trial and recurring billing)" /></li>
                                <li><TranslatedText text="Send test results and performance reports" /></li>
                                <li><TranslatedText text="Provide customer support" /></li>
                                <li><TranslatedText text="Improve our algorithms and services" /></li>
                                <li><TranslatedText text="Comply with legal obligations" /></li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>5. <TranslatedText text="Data Recipients" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We may share your data with the following third parties:" />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Stripe, Inc. (Payment Processing):" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Stripe processes all credit and debit card transactions securely. Stripe is PCI DSS Level 1 certified. Learn more at: https://stripe.com/privacy" />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Cloud Hosting Providers:" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Our platform is hosted on secure cloud servers." />
                            </p>

                            <p className="text-gray-600" style={{ ...bodyStyle, marginTop: '12px' }}>
                                <TranslatedText text="We never sell your personal data to third parties." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>6. <TranslatedText text="International Data Transfers" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Your personal data may be processed in Switzerland, the European Economic Area (EEA), and the United States." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="When data is transferred outside Switzerland or the EEA (e.g., Stripe servers in the US), we ensure appropriate safeguards are in place:" />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="EU Standard Contractual Clauses (SCCs)" /></li>
                                <li><TranslatedText text="Swiss-U.S. and EU-U.S. Data Privacy Framework" /></li>
                                <li><TranslatedText text="Adequacy decisions by the European Commission or the Swiss Federal Data Protection and Information Commissioner (FDPIC)" /></li>
                                <li><TranslatedText text="Certification under recognized frameworks" /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Transfers comply with the GDPR, Swiss FADP, and applicable US privacy regulations." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>7. <TranslatedText text="Data Retention Periods" /></h3>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Account Data: Retained while your account is active, plus 3 years for tax/legal purposes." /></li>
                                <li><TranslatedText text="Test Results: Retained while your account is active. You may request deletion at any time." /></li>
                                <li><TranslatedText text="Payment Records: Retained for 7 years as required by Swiss and EU tax regulations." /></li>
                                <li><TranslatedText text="Certificates: Retained indefinitely unless deletion is requested." /></li>
                                <li><TranslatedText text="Technical Logs: Automatically deleted after 90 days." /></li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>8. <TranslatedText text="Your Privacy Rights" /></h3>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Rights for EU/EEA Residents (GDPR):" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Right of Access (Art. 15): Request a copy of your personal data." /></li>
                                <li><TranslatedText text="Right to Rectification (Art. 16): Correct inaccurate personal data." /></li>
                                <li><TranslatedText text="Right to Erasure (Art. 17): Request deletion of your data (&ldquo;right to be forgotten&rdquo;)." /></li>
                                <li><TranslatedText text="Right to Restriction (Art. 18): Restrict processing of your data." /></li>
                                <li><TranslatedText text="Right to Data Portability (Art. 20): Receive your data in a machine-readable format." /></li>
                                <li><TranslatedText text="Right to Object (Art. 21): Object to processing based on legitimate interests." /></li>
                                <li><TranslatedText text="Withdraw Consent: Withdraw consent at any time where processing is based on consent." /></li>
                                <li><TranslatedText text="Right to Complain: Lodge a complaint with your local Data Protection Authority." /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Rights for Swiss Residents (FADP):" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You have similar rights under the Swiss Federal Act on Data Protection, including the right of access, rectification, and deletion. You may lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC)." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Rights for California Residents (CCPA):" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you are a California resident, you have the right to:" />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Know what personal information we collect and how it is used" /></li>
                                <li><TranslatedText text="Request deletion of your personal information" /></li>
                                <li><TranslatedText text="Opt out of the sale of your personal information (we do not sell personal data)" /></li>
                                <li><TranslatedText text="Non-discrimination for exercising your privacy rights" /></li>
                            </ul>

                            <p className="text-gray-600" style={{ ...bodyStyle, marginTop: '12px' }}>
                                <TranslatedText text="To exercise any of these rights, contact us at: support@testbrain.net" />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>9. <TranslatedText text="Cookies &amp; Tracking" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We use cookies and similar technologies:" />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Essential Cookies: Required for platform functionality (e.g., authentication, security)." /></li>
                                <li><TranslatedText text="Analytics Cookies: Help us understand how users interact with our platform." /></li>
                                <li><TranslatedText text="Preference Cookies: Remember your language and theme settings." /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You can manage cookie preferences through your browser settings. For more information on cookies, visit www.allaboutcookies.org." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>10. <TranslatedText text="Data Security" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We implement industry-standard security measures:" />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="SSL/TLS encryption for all data transmission" /></li>
                                <li><TranslatedText text="Secure credit/debit card processing via Stripe (PCI DSS Level 1 compliant)" /></li>
                                <li><TranslatedText text="Regular security audits and updates" /></li>
                                <li><TranslatedText text="Access controls and employee training" /></li>
                                <li><TranslatedText text="Encrypted data storage" /></li>
                                <li><TranslatedText text="No storage of full card numbers on our servers" /></li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>11. <TranslatedText text="Contact Us" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="For questions about this Privacy Policy or to exercise your privacy rights, please contact us:" />
                            </p>
                            <p className="text-gray-600" style={{ ...bodyStyle, marginTop: '8px' }}>
                                Comparo Media<br />
                                Ul. Milutina Barača 7<br />
                                Rijeka, Croatia<br />
                                Email: support@testbrain.net
                            </p>
                        </div>

                        <p className="text-gray-500" style={{ ...bodyStyle, fontSize: '14px' }}>
                            <TranslatedText text="We will respond to all requests within 30 days as required by the GDPR, or within 45 days for CCPA requests (with possible extension upon notice)." />
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;
