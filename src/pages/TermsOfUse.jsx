import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';
import { isContentSwitchEnabled } from '../config/accessControl.js';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };

function TermsOfUse() {
    const navigate = useNavigate();
    const showTestbrainContent = isContentSwitchEnabled('testbraintermsOfUse');

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
                    <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400' }}>
                        {showTestbrainContent ? 'Terms & conditions — Last Updated: 29.12.2024' : <TranslatedText text="By using Bazingo, you agree to the following terms and conditions." />}
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        {showTestbrainContent ? (
                            <>
                                <p className="text-gray-600 mb-6" style={bodyStyle}>
                                    These Terms and Conditions govern your use of the Bazzingo IQ testing and brain training platform. By using our services, you agree to these terms. Please read them carefully.
                                </p>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Acceptance of Terms</h3>
                                    <p className="text-gray-600" style={bodyStyle}>By creating an account, accessing, or using our services, you agree to be bound by these Terms and Conditions, our Privacy Policy, and all applicable laws and regulations. If you do not agree with these terms, please do not use our services.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Service Provider</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Company Name:</strong> Bazzingo</p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}><strong>Contact Email:</strong> support@bazzingo.com</p>
                                    <p className="text-gray-600" style={bodyStyle}>Bazzingo is a digital service providing IQ tests, cognitive assessments, and brain training games to users in the European Union and worldwide.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Service Description</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>Bazzingo provides:</p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>Online IQ tests and cognitive assessments</li>
                                        <li>Personalized IQ certificates</li>
                                        <li>Brain training games and exercises</li>
                                        <li>Performance tracking and analytics</li>
                                        <li>Detailed cognitive assessment reports</li>
                                    </ul>
                                    <p className="text-gray-600" style={bodyStyle}>Our tests are designed for entertainment and self-improvement purposes and do not constitute official psychological assessments.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Subscription &amp; Payment</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Trial Period:</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>3-day trial for €2.99</li>
                                        <li>Full access to all features during trial</li>
                                        <li>After trial, automatically converts to monthly subscription</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Monthly Subscription:</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>Auto-renews each month</li>
                                        <li>Charged on the same day as initial payment</li>
                                        <li>Prices are clearly displayed before purchase</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Payment Processing:</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>All payments are processed securely via Stripe</li>
                                        <li>We accept credit/debit cards</li>
                                        <li>Prices include VAT where applicable</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Right of Withdrawal (EU Consumers)</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>Under the EU Consumer Rights Directive, you have the right to withdraw from this contract within 14 days without giving any reason.</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Important Notice Regarding Digital Content:</strong></p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>By beginning to use our digital services (taking IQ tests, playing games, accessing reports) during the withdrawal period, you expressly consent to:</p>
                                    <ol className="list-decimal pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>The performance of the digital content beginning immediately</li>
                                        <li>Acknowledge that you will lose your right of withdrawal once you have started testing or downloaded digital content</li>
                                    </ol>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>This is in accordance with Article 16(m) of the EU Consumer Rights Directive.</p>
                                    <p className="text-gray-600" style={bodyStyle}><strong>To Exercise Withdrawal:</strong><br />Contact us at support@bazzingo.com before using the service.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Cancellation Policy</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>How to Cancel Your Subscription:</strong></p>
                                    <ol className="list-decimal pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>Log in to your Bazzingo account</li>
                                        <li>Go to Account Settings → Subscription</li>
                                        <li>Click &quot;Cancel Subscription&quot;</li>
                                        <li>Your access continues until the end of the current billing period</li>
                                    </ol>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>Alternatively:<br />Email support@bazzingo.com with your cancellation request.</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Important Notes:</strong></p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>Cancellation must be made at least 24 hours before the next billing date</li>
                                        <li>No further charges after cancellation</li>
                                        <li>No prorated refunds for partial months</li>
                                        <li>Your test data and certificates remain accessible upon request</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Intellectual Property</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>All content on the Bazzingo platform is protected:</p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>All IQ test questions, algorithms, and methodologies</li>
                                        <li>Brain training games and exercises</li>
                                        <li>Certificate designs and templates</li>
                                        <li>Report formats and analytics</li>
                                        <li>Website design and user interface</li>
                                        <li>Trademarks, logos, and branding</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>You may not:</p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>Copy, modify, or distribute our content without permission</li>
                                        <li>Reverse engineer or extract our technology</li>
                                        <li>Use our materials for commercial purposes without licensing</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Disclaimer</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>For Entertainment Purposes:</strong></p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>Bazzingo IQ tests are designed for entertainment and self-improvement purposes. They are:</p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>NOT official psychological assessments</li>
                                        <li>NOT substitutes for professional cognitive testing</li>
                                        <li>NOT to be used for diagnostic or medical purposes</li>
                                        <li>NOT to be used for educational placement decisions</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Results:</strong><br />IQ scores and cognitive metrics are estimates based on your test responses. They may not fully reflect your actual cognitive abilities and should not be used for important life decisions.</p>
                                    <p className="text-gray-600" style={bodyStyle}><strong>Professional Advice:</strong><br />For official IQ testing or cognitive assessments, please consult a licensed psychologist.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Limitation of Liability</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>To the maximum extent permitted by applicable law:</p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>Bazzingo is not liable for indirect, incidental, or consequential damages</li>
                                        <li>Our total liability shall not exceed the amount you paid us in the last 12 months</li>
                                        <li>We do not guarantee specific results from using our services</li>
                                    </ul>
                                    <p className="text-gray-600" style={bodyStyle}><strong>EU Consumer Rights:</strong><br />These limitations do not affect your statutory rights under EU consumer protection laws, including rights related to defective digital content or services.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Dispute Resolution</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Online Dispute Resolution:</strong><br />The European Commission provides a platform for online dispute resolution: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://ec.europa.eu/consumers/odr</a></p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>We encourage you to contact us first to resolve disputes amicably.</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Governing Law:</strong><br />These terms are governed by the laws of the European Union and the member state where you reside.</p>
                                    <p className="text-gray-600" style={bodyStyle}><strong>Jurisdiction:</strong><br />Disputes may be brought before the courts of your residence or our place of business.</p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Amendments</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>We may update these terms from time to time:</p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>Material changes will be notified 30 days in advance via email</li>
                                        <li>Minor changes will be posted on this page</li>
                                        <li>Continued use after changes constitutes acceptance</li>
                                        <li>The &quot;Last Updated&quot; date indicates the current version</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Contact Us</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>For questions about these Terms and Conditions:</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>Email: support@bazzingo.com</p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}><strong>Customer Support:</strong><br />We respond to all inquiries within 2 business days.</p>
                                    <p className="text-gray-600" style={bodyStyle}><strong>Complaints:</strong><br />If you&apos;re unsatisfied with our response, you may escalate the dispute through the EU ODR platform or contact your local consumer protection authority.</p>
                                    <p className="text-gray-600 mt-4" style={bodyStyle}>These terms, together with our Privacy Policy, constitute the entire agreement between you and Bazzingo.</p>
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

export default TermsOfUse;
