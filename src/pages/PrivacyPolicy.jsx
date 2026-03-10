import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';
import { isContentSwitchEnabled } from '../config/accessControl.js';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };

function PrivacyPolicy() {
    const navigate = useNavigate();
    const showTestbrainContent = isContentSwitchEnabled('testbrainprivacypolicy');

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            <Header unreadCount={3} />
            <main>
                <div className="mx-auto px-4 lg:px-12 pt-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}><TranslatedText text="Privacy Policy" /></span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}><TranslatedText text="Privacy Policy" /></span>
                        </h2>
                    </div>
                    <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400' }}>
                        {showTestbrainContent ? 'Last Updated: 29.12.2024' : <TranslatedText text="By using Bazingo, you agree to the following terms and conditions." />}
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        {showTestbrainContent ? (
                            <>
                                <p className="text-gray-600 mb-6" style={bodyStyle}>
                                    This Privacy Policy explains how Bazzingo (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, stores, and protects your personal data in accordance with the General Data Protection Regulation (GDPR) and other applicable EU data protection laws when you use our IQ testing and brain training platform.
                                </p>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Data Controller</h3>
                                    <p className="text-gray-600" style={bodyStyle}>Bazzingo is the data controller responsible for your personal data. We are responsible for deciding how your personal data is collected and used.</p>
                                    <p className="text-gray-600 mt-2" style={bodyStyle}><strong>Contact Details:</strong><br />Email: privacy@bazzingo.com</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Data We Collect</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Personal Identification Data:</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>Full name (for certificate generation)</li>
                                        <li>Email address (for account management and communication)</li>
                                        <li>Age (for anonymized statistical analysis)</li>
                                        <li>Country (for regional statistics)</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Payment Data:</strong></p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>Payment information is securely processed by Stripe, our payment processor. We do not store your full card details on our servers.</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Usage Data:</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>IQ test results and quiz answers</li>
                                        <li>Performance metrics and progress tracking</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Technical Data:</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>IP address</li>
                                        <li>Browser type and version</li>
                                        <li>Device information</li>
                                        <li>Cookies and similar tracking technologies</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Legal Basis for Processing</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>We process your personal data based on the following legal grounds:</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Contract Performance (Art. 6(1)(b) GDPR):</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>Providing our IQ testing and brain training services</li>
                                        <li>Generating personalized certificates</li>
                                        <li>Processing payments and managing subscriptions</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Legitimate Interests (Art. 6(1)(f) GDPR):</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>Improving our services and user experience</li>
                                        <li>Fraud prevention and security</li>
                                        <li>Analytics to optimize platform performance</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Consent (Art. 6(1)(a) GDPR):</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>Marketing communications (if applicable)</li>
                                        <li>Non-essential cookies</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Purposes of Processing</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>We use your personal data to:</p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>Provide IQ testing and cognitive assessment services</li>
                                        <li>Generate and deliver personalized IQ certificates</li>
                                        <li>Process payments via Stripe</li>
                                        <li>Send test results and performance reports</li>
                                        <li>Provide customer support</li>
                                        <li>Improve our algorithms and services</li>
                                        <li>Comply with legal obligations</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Data Recipients</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>We may share your data with the following third parties:</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Stripe (Payment Processing):</strong></p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>Stripe processes all payment transactions securely. Stripe is PCI DSS Level 1 certified. Learn more at: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://stripe.com/privacy</a></p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Cloud Hosting Providers:</strong></p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>Our platform is hosted on secure cloud servers within the EU.</p>
                                    <p className="text-gray-600" style={bodyStyle}>We never sell your personal data to third parties.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>International Data Transfers</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>Your personal data is primarily processed within the European Economic Area (EEA).</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>When data is transferred outside the EEA (e.g., Stripe servers in the US), we ensure appropriate safeguards are in place:</p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>EU Standard Contractual Clauses (SCCs)</li>
                                        <li>Adequacy decisions by the European Commission</li>
                                        <li>Certification under recognized frameworks</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Data Retention Periods</h3>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li><strong>Account Data:</strong> Retained while your account is active, plus 3 years for tax/legal purposes.</li>
                                        <li><strong>Test Results:</strong> Retained while your account is active. You may request deletion at any time.</li>
                                        <li><strong>Payment Records:</strong> Retained for 7 years as required by tax regulations.</li>
                                        <li><strong>Certificates:</strong> Retained indefinitely unless deletion is requested.</li>
                                        <li><strong>Technical Logs:</strong> Automatically deleted after 90 days.</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Your GDPR Rights</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>Under the GDPR, you have the following rights:</p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li><strong>Right of Access (Art. 15):</strong> Request a copy of your personal data.</li>
                                        <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate personal data.</li>
                                        <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your data (&quot;right to be forgotten&quot;).</li>
                                        <li><strong>Right to Restriction (Art. 18):</strong> Restrict processing of your data.</li>
                                        <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a machine-readable format.</li>
                                        <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests.</li>
                                        <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
                                        <li><strong>Right to Complain:</strong> Lodge a complaint with your local Data Protection Authority.</li>
                                    </ul>
                                    <p className="text-gray-600" style={bodyStyle}>To exercise any of these rights, contact us at: privacy@bazzingo.com</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Cookies &amp; Tracking</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>We use cookies and similar technologies:</p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li><strong>Essential Cookies:</strong> Required for platform functionality (e.g., authentication, security).</li>
                                        <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform.</li>
                                        <li><strong>Preference Cookies:</strong> Remember your language and theme settings.</li>
                                    </ul>
                                    <p className="text-gray-600" style={bodyStyle}>You can manage cookie preferences through your browser settings.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Data Security</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>We implement industry-standard security measures:</p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>SSL/TLS encryption for all data transmission</li>
                                        <li>Secure payment processing via Stripe (PCI DSS compliant)</li>
                                        <li>Regular security audits and updates</li>
                                        <li>Access controls and employee training</li>
                                        <li>Encrypted data storage</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Contact Us</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>For questions about this Privacy Policy or to exercise your rights, please contact us:</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>Email: privacy@bazzingo.com</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Data Protection Officer:</strong><br />For data protection inquiries, please contact our DPO at: dpo@bazzingo.com</p>
                                    <p className="text-gray-600" style={bodyStyle}>We will respond to all requests within 30 days as required by the GDPR.</p>
                                    <p className="text-gray-600 mt-4" style={bodyStyle}>This Privacy Policy may be updated periodically. We will notify you of any material changes.</p>
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
