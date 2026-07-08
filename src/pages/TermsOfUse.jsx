import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };
const subLabelStyle = { ...bodyStyle, fontWeight: 600, marginTop: '12px', marginBottom: '6px' };
const listStyle = { ...bodyStyle, paddingLeft: '20px', listStyleType: 'disc', marginBottom: '8px' };

function TermsOfUse() {
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
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}><TranslatedText text="Terms of Use" /></span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}><TranslatedText text="Terms of Use" /></span>
                        </h2>
                    </div>
                    <p className="text-gray-600 mt-3" style={bodyStyle}>
                        By using Testbrain, you agree to the following terms and conditions.
                    </p>
                    <h3 className="text-gray-900 mt-4" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '18px', fontWeight: '600' }}>
                        <TranslatedText text="Terms & conditions" />
                    </h3>
                    <p className="text-gray-500 mt-1" style={{ ...bodyStyle, fontSize: '13px' }}>
                        Last Updated: 26.03.2026
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '24px' }}>
                            These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of the Testbrain IQ testing and brain training platform operated by Comparo Media. By using our services, you agree to these Terms. Please read them carefully before making any purchase.
                        </p>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>1. Acceptance of Terms</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                By creating an account, accessing, or using our services, you agree to be bound by these Terms and Conditions, our Privacy Policy, and all applicable laws and regulations. If you do not agree with these terms, please do not use our services.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>2. Service Provider</h3>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><strong>Company Name:</strong> Comparo Media</li>
                                <li><strong>Operating as:</strong> Testbrain</li>
                                <li><strong>Registered Address:</strong> Ul. Milutina Barača 7, Rijeka, Croatia</li>
                                <li><strong>Contact Email:</strong> support@testbrain.net</li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                Comparo media is a Croatian corporation providing digital IQ tests, cognitive assessments, and brain training games to users in the European Union, Switzerland, the United States, and worldwide.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>3. Service Description</h3>
                            <p className="text-gray-600" style={bodyStyle}>Testbrain provides:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>Online IQ tests and cognitive assessments</li>
                                <li>Personalized IQ certificates</li>
                                <li>Brain training games and exercises</li>
                                <li>Performance tracking and analytics</li>
                                <li>Detailed cognitive assessment reports</li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                Our tests are designed for entertainment and self-improvement purposes and do not constitute official psychological assessments.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>4. Subscription &amp; Payment</h3>

                            <p className="text-gray-800" style={subLabelStyle}>Trial Period:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>3-day trial for &euro;2.99</li>
                                <li>Full access to all features during the trial period</li>
                                <li>Your credit or debit card will be charged &euro;2.99 immediately upon subscribing</li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}>AUTOMATIC RENEWAL NOTICE:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>After the 3-day trial period ends, your subscription will automatically renew at &euro;35.00 per month</li>
                                <li>You must cancel before the trial period expires to avoid being charged the monthly fee</li>
                                <li>Monthly charges will continue to recur on the same day each month until you cancel</li>
                                <li>Prices include VAT where applicable</li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}>Payment Processing:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>All payments are processed securely via Stripe, Inc.</li>
                                <li>We accept Visa, Mastercard, American Express, and other major credit and debit cards</li>
                                <li>By providing your payment information, you authorize us to charge your card for the trial and all subsequent monthly renewal charges until cancellation</li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}>US AUTO-RENEWAL DISCLOSURE:</p>
                            <p className="text-gray-600" style={bodyStyle}>
                                This is an automatically renewing subscription. By purchasing the trial, you consent to automatic recurring charges of &euro;35.00/month after the trial ends. You may cancel at any time before the end of the current billing period by emailing support@testbrain.net.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>5. Right of Withdrawal (EU/EEA Consumers)</h3>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                This section applies to consumers residing in the EU/EEA.
                            </p>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                Under the EU Consumer Rights Directive (2011/83/EU), you have the right to withdraw from this contract within 14 days without giving any reason.
                            </p>
                            <p className="text-gray-800" style={subLabelStyle}>Important Notice Regarding Digital Content:</p>
                            <p className="text-gray-600" style={bodyStyle}>
                                By beginning to use our digital services (taking IQ tests, playing games, accessing reports) during the withdrawal period, you expressly consent to:
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>The performance of the digital content beginning immediately</li>
                                <li>Acknowledge that you will lose your right of withdrawal once the digital content delivery has begun</li>
                            </ul>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                This is in accordance with Article 16(m) of the EU Consumer Rights Directive.
                            </p>
                            <p className="text-gray-800" style={subLabelStyle}>To Exercise Withdrawal:</p>
                            <p className="text-gray-600" style={bodyStyle}>
                                Contact us at support@testbrain.net before using the service. Refunds for eligible withdrawal requests will be processed to the original payment method within 14 days.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>6. Cancellation Policy</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <strong>IMPORTANT:</strong> To avoid being charged &euro;35.00/month, you must cancel before your 3-day trial expires.
                            </p>
                            <p className="text-gray-800" style={subLabelStyle}>How to Cancel Your Subscription:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>Send an email to support@testbrain.net with the subject line &ldquo;Cancel Subscription&rdquo;</li>
                                <li>Include your registered email address and full name</li>
                                <li>You will receive a cancellation confirmation within 24 hours</li>
                            </ul>
                            <p className="text-gray-800" style={subLabelStyle}>Cancellation Terms:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>Cancellation takes effect at the end of the current billing period</li>
                                <li>You retain access to paid features until the end of the current billing period</li>
                                <li>No further charges will be applied after cancellation</li>
                                <li>No prorated refunds for partial months</li>
                                <li>Your test data and certificates remain accessible upon request</li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>7. Intellectual Property</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                All content on the Testbrain platform is the property of Comparo Media and is protected by international copyright, trademark, and intellectual property laws:
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>All IQ test questions, algorithms, and methodologies</li>
                                <li>Brain training games and exercises</li>
                                <li>Certificate designs and templates</li>
                                <li>Report formats and analytics</li>
                                <li>Website design and user interface</li>
                                <li>The Testbrain trademark, logos, and branding</li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>You may not:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>Copy, modify, or distribute our content without prior written permission</li>
                                <li>Reverse engineer or extract our technology</li>
                                <li>Use our materials for commercial purposes without licensing</li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>8. Disclaimer</h3>
                            <p className="text-gray-800" style={subLabelStyle}>For Entertainment Purposes:</p>
                            <p className="text-gray-600" style={bodyStyle}>
                                Testbrain IQ tests are designed for entertainment and self-improvement purposes. They are:
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>NOT official psychological assessments</li>
                                <li>NOT substitutes for professional cognitive testing</li>
                                <li>NOT to be used for diagnostic or medical purposes</li>
                                <li>NOT to be used for educational placement decisions</li>
                            </ul>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                <strong>Results:</strong> IQ scores and cognitive metrics are estimates based on your test responses. They may not fully reflect your actual cognitive abilities and should not be used for important life decisions.
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <strong>Professional Advice:</strong> For official IQ testing or cognitive assessments, please consult a licensed psychologist.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>9. Limitation of Liability</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                To the maximum extent permitted by applicable law (including Swiss, EU, and US law):
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>Comparo Media (operating as Testbrain) is not liable for indirect, incidental, special, or consequential damages</li>
                                <li>Our total aggregate liability shall not exceed the amount you paid us in the preceding 12 months</li>
                                <li>We do not guarantee specific results from using our services</li>
                            </ul>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                <strong>EU Consumer Rights:</strong> These limitations do not affect your mandatory statutory rights under EU consumer protection laws, including rights related to defective digital content or services.
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <strong>US Consumers:</strong> Some US states do not allow limitations on implied warranties or exclusion of certain damages. In such states, these limitations apply only to the extent permitted by law.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>10. Dispute Resolution</h3>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                <strong>EU Online Dispute Resolution:</strong> For EU consumers: The European Commission provides a platform for online dispute resolution at https://ec.europa.eu/consumers/odr. We encourage you to contact us first to resolve disputes amicably.
                            </p>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                <strong>US Dispute Resolution:</strong> For US consumers: Any dispute arising under these Terms shall be resolved by binding individual arbitration administered under the rules of the American Arbitration Association (AAA), except that either party may bring individual claims in small claims court. You agree to waive any right to participate in a class action lawsuit or class-wide arbitration.
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                Before initiating arbitration, you agree to contact us at support@testbrain.net to attempt informal resolution for at least 30 days.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>11. Amendments</h3>
                            <p className="text-gray-600" style={bodyStyle}>We may update these Terms from time to time:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>Material changes will be notified at least 30 days in advance via email</li>
                                <li>Minor changes will be posted on this page</li>
                                <li>Continued use after changes constitutes acceptance</li>
                                <li>The &ldquo;Last Updated&rdquo; date indicates the current version</li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>12. Contact Us</h3>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                For questions about these Terms and Conditions:
                            </p>
                            <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '12px' }}>
                                Comparo Media<br />
                                Ul. Milutina Barača 7<br />
                                Rijeka, Croatia<br />
                                Email: support@testbrain.net
                            </p>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                <strong>Customer Support:</strong> We respond to all inquiries within 2 business days.
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <strong>Complaints:</strong> EU consumers may escalate disputes through the EU ODR platform. US consumers may contact the Better Business Bureau or their state attorney general&rsquo;s office.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TermsOfUse;
