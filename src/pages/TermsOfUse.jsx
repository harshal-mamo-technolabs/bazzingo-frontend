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
                    <h3 className="text-gray-900 mt-4" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '18px', fontWeight: '600' }}>
                        <TranslatedText text="Terms &amp; Conditions" />
                    </h3>
                    <p className="text-gray-500 mt-1" style={{ ...bodyStyle, fontSize: '13px' }}>
                        Last Updated: 25 August 2026
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '16px' }}>
                            <TranslatedText text="These Terms of Use (&quot;Terms&quot;) govern your access to and use of the Testbrain website, platform, assessments, brain-training features, reports, certificates, and related services (collectively, the &quot;Services&quot;). Testbrain is operated by Comparo Media d.o.o., Miliutina Barača 7, 51000 Rijeka, Croatia." />
                        </p>
                        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '16px' }}>
                            <TranslatedText text="By creating an account, purchasing a Testbrain product, starting or completing an assessment, or otherwise using the Services, you agree to these Terms, the Privacy Policy, and the Refund &amp; Cancellation Policy. If you do not agree, do not use the Services." />
                        </p>

                        <div className="bg-gray-50 rounded-lg" style={{ padding: '16px', marginBottom: '24px' }}>
                            <p className="text-gray-800" style={{ ...bodyStyle, marginBottom: '4px' }}>
                                <strong><TranslatedText text="Operator" />:</strong> Comparo Media d.o.o. (Testbrain)
                            </p>
                            <p className="text-gray-800" style={{ ...bodyStyle, marginBottom: '4px' }}>
                                <strong><TranslatedText text="Address" />:</strong> Miliutina Barača 7, 51000 Rijeka, Croatia
                            </p>
                            <p className="text-gray-800" style={{ ...bodyStyle, marginBottom: '4px' }}>
                                <strong><TranslatedText text="Support" />:</strong> support@testbrain.net
                            </p>
                            <p className="text-gray-800" style={bodyStyle}>
                                <strong><TranslatedText text="Payment processor" />:</strong> Stripe, Inc.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>1. <TranslatedText text="Acceptance of Terms" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You may use the Services only if you can enter into a legally binding agreement under applicable law. If you use Testbrain on behalf of another person or organization, you represent that you are authorized to bind that person or organization to these Terms." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If any part of these Terms conflicts with mandatory consumer-protection law applicable to you, the mandatory law prevails to the extent of that conflict." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>2. <TranslatedText text="Service Provider" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The Services are provided by Comparo Media d.o.o., operating the consumer-facing brand Testbrain." />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Company: Comparo Media d.o.o." /></li>
                                <li><TranslatedText text="Brand: Testbrain" /></li>
                                <li><TranslatedText text="Registered address: Miliutina Barača 7, 51000 Rijeka, Croatia" /></li>
                                <li><TranslatedText text="Support email: support@testbrain.net" /></li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>3. <TranslatedText text="Service Description" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain is a digital cognitive-assessment and brain-training platform. Depending on the current product configuration and your access rights, the Services may include:" />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Cognitive and IQ-style assessments" /></li>
                                <li><TranslatedText text="Logic and reasoning assessments" /></li>
                                <li><TranslatedText text="Driving Licence Test" /></li>
                                <li><TranslatedText text="ADHD Trait Assessment" /></li>
                                <li><TranslatedText text="Emotional Intelligence Assessment" /></li>
                                <li><TranslatedText text="Brain-training games and exercises" /></li>
                                <li><TranslatedText text="Performance statistics and progress tracking" /></li>
                                <li><TranslatedText text="Personalized assessment reports" /></li>
                                <li><TranslatedText text="Certificates for eligible completed assessments" /></li>
                                <li><TranslatedText text="Leaderboards, achievements, badges, and recommendations" /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain may add, modify, replace, or discontinue specific assessments, games, features, or content from time to time, provided that this does not unlawfully deprive you of a product or service you have already purchased." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>4. <TranslatedText text="Accounts, Registration and Security" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain uses an assessment-first registration flow for certain products. A user may begin an assessment before creating a password, then provide account information such as name, email address, age, and country, complete the applicable checkout, and receive a Welcome Email with a magic link for password setup or reset." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You are responsible for providing accurate account information and for keeping your login credentials secure. You must not share your password, authentication codes, or other credentials with another person." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you believe your account has been accessed without authorization, use the available password-reset tools and contact Testbrain Support if further assistance is required." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>5. <TranslatedText text="Plans, Purchases and Pricing" /></h3>

                            <p className="text-gray-800" style={subLabelStyle}>5.1 <TranslatedText text="3-Day Trial Subscription" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Price: &euro;2.99" /></li>
                                <li><TranslatedText text="Duration: 3 days" /></li>
                                <li><TranslatedText text="The &euro;2.99 trial fee is charged immediately when you subscribe." /></li>
                                <li><TranslatedText text="The Trial provides access to the features included in the Trial offering during the Trial period." /></li>
                                <li><TranslatedText text="Unless cancelled before the Trial expires, the Trial automatically converts to the Monthly Subscription." /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}>5.2 <TranslatedText text="Monthly Subscription" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Price: &euro;35.00 per month" /></li>
                                <li><TranslatedText text="Automatically renews each month until cancelled" /></li>
                                <li><TranslatedText text="No fixed minimum contract term unless expressly stated at checkout" /></li>
                                <li><TranslatedText text="Prices include VAT where applicable" /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="By purchasing the Trial, you authorize the applicable Trial charge and, unless you cancel before the end of the Trial, the recurring &euro;35.00 Monthly Subscription charge. Monthly renewal charges continue until cancellation." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}>5.3 <TranslatedText text="Individual Assessment Purchases" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Certain Testbrain assessments may be purchased individually for &euro;10.00 per assessment." />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="An Individual Assessment Purchase is a one-time payment." /></li>
                                <li><TranslatedText text="It does not create a Trial or Monthly Subscription." /></li>
                                <li><TranslatedText text="It does not automatically renew." /></li>
                                <li><TranslatedText text="It provides access only to the specific assessment purchased and its applicable report and certificate after completion." /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Purchasing one Individual Assessment does not unlock other paid assessments or subscription-only functionality." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}>5.4 <TranslatedText text="Price Changes" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain may change prices for future purchases or future renewal periods. Any change to a recurring subscription price will be communicated as required by applicable law before it takes effect. A price change does not retroactively change a completed one-time purchase." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>6. <TranslatedText text="Automatic Renewal and Subscription Management" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The Trial and Monthly Subscription are recurring subscription products. The Individual Assessment Purchase is not a recurring product." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="To avoid the first &euro;35.00 Monthly Subscription charge, you must cancel the Trial before the 3-day Trial period expires." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If your account offers the option to end the Trial early and activate the Monthly Subscription, the relevant price and billing effect will be shown before you confirm that action." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>7. <TranslatedText text="Subscription Cancellation" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You may cancel your Trial or Monthly Subscription through your Testbrain account." />
                            </p>
                            <ol className="text-gray-600" style={{ ...listStyle, listStyleType: 'decimal' }}>
                                <li><TranslatedText text="Log in to Testbrain." /></li>
                                <li><TranslatedText text="Open Subscription Management." /></li>
                                <li><TranslatedText text="Select Cancel Subscription." /></li>
                                <li><TranslatedText text="Follow the on-screen steps and confirm the cancellation." /></li>
                            </ol>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Cancelling during the Trial prevents the Trial from automatically converting to the Monthly Subscription if the cancellation is completed before the Trial expires." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Cancelling an active Monthly Subscription prevents future renewal charges. Unless otherwise stated in the cancellation flow or required by law, you may retain access until the end of the billing period already paid for." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Cancellation and refund are separate processes. Cancelling a subscription does not automatically refund charges already processed." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>8. <TranslatedText text="Payments and Payment Processing" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Payments are processed securely through Stripe, Inc. Testbrain may accept Visa, Mastercard, American Express, and other supported payment methods displayed at checkout." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="By submitting payment information, you authorize the applicable charge for the product you select and, for recurring subscriptions, subsequent renewal charges until cancellation." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain does not store your full payment-card number. Payment processing is subject to the payment processor's own terms and security controls." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You must not provide full card numbers, CVV/CVC codes, PINs, banking passwords, or authentication codes to Testbrain Support." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>9. <TranslatedText text="Reports and Certificates" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="For an eligible assessment, the corresponding report becomes available in the Profile section after the assessment has been completed and submitted." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you have an active Trial or Monthly Subscription and the relevant assessment is included in your plan, no additional purchase is required to access the report for that completed assessment." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you purchase an Individual Assessment for &euro;10.00 and complete it, the corresponding report and certificate are made available in your Profile, where applicable." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Reports and certificates are digital Testbrain outputs. Unless expressly stated otherwise, they do not constitute an accredited academic qualification, professional licence, medical certificate, psychological diagnosis, government-recognized credential, or driving licence." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>10. <TranslatedText text="EU/EEA Right of Withdrawal" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you are a consumer in the European Union or European Economic Area and the statutory right of withdrawal applies to your purchase, you generally have 14 days to withdraw from a distance contract without giving a reason, subject to the conditions and exceptions provided by applicable law." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}>10.1 <TranslatedText text="Immediate Performance of Digital Services and Digital Content" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Some Testbrain products are supplied or begin to be performed immediately after purchase. Where applicable law permits the statutory withdrawal right to be lost or limited after performance begins, Testbrain will rely on that exception only where the legally required conditions have been satisfied, including any required prior express consent, acknowledgement, and confirmation." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If those conditions have not been satisfied, your statutory rights remain unaffected. Nothing in these Terms is intended to remove a mandatory right of withdrawal that you retain under applicable law." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}>10.2 <TranslatedText text="Exercising a Withdrawal Right" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Where you have a statutory right of withdrawal, you may exercise it by making a clear statement that you wish to withdraw from the contract. You may contact support@testbrain.net or use any withdrawal functionality made available by Testbrain. No specific wording is required if your decision to withdraw is clear." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Further details are set out in the Refund &amp; Cancellation Policy." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>11. <TranslatedText text="Refunds and Cancellation Policy" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Refund eligibility, the voluntary 30-Day Satisfaction Guarantee for eligible Monthly Subscription charges, Individual Assessment refund rules, refund processing, and payment disputes are governed by the current Testbrain Refund &amp; Cancellation Policy, which forms part of these Terms." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="A completed Individual Assessment for which the corresponding report or certificate has been provided or made available is generally not eligible for a voluntary refund, subject always to mandatory consumer rights and remedies for defective or non-conforming digital content or services." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Refund requests that require review are handled by a human Testbrain Support agent through Live Chat when available or through support@testbrain.net. The AI Support Assistant does not approve or guarantee refunds." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>12. <TranslatedText text="Individual Assessments" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="An Individual Assessment Purchase is separate from a subscription. It gives you access to the specific purchased assessment and its applicable report and certificate after completion." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The current Individual Assessment catalogue may include assessments such as Driving Licence Test, IQ Test, Logic, ADHD Trait Assessment, and Emotional Intelligence Assessment. Availability may change over time." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If an Individual Assessment has not been started and you request a refund, the request may be submitted for human review under the Refund &amp; Cancellation Policy. If the assessment has been completed and its report or certificate has been provided or made available, the purchase is generally not eligible for a voluntary refund, subject to mandatory law." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>13. <TranslatedText text="Health, Psychological and Educational Disclaimer" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain is intended for informational, educational, entertainment, cognitive-training, and self-improvement purposes." />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Testbrain is not a medical or healthcare service." /></li>
                                <li><TranslatedText text="Testbrain assessments are not clinical psychological evaluations unless expressly stated otherwise." /></li>
                                <li><TranslatedText text="IQ-style results are not automatically equivalent to a professionally administered or clinically standardized IQ assessment." /></li>
                                <li><TranslatedText text="Testbrain results must not be used as the sole basis for medical, psychological, educational, employment, licensing, or other high-impact decisions." /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}>13.1 <TranslatedText text="ADHD Trait Assessment" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The ADHD Trait Assessment is an informational self-assessment tool. It is not designed or intended to diagnose ADHD or any other medical, psychiatric, psychological, neurological, or developmental condition. If you have health-related concerns, consult an appropriately qualified healthcare professional." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}>13.2 <TranslatedText text="Driving Licence Test" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The Driving Licence Test is an educational and self-assessment tool. Completing it does not grant, replace, renew, certify, or guarantee eligibility for an official driving licence, government examination, medical driving clearance, or any other regulated authorization." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}>13.3 <TranslatedText text="Emotional Intelligence and Other Assessments" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Emotional Intelligence, Logic, cognitive, and similar Testbrain assessments provide informational performance or self-assessment results only. They should be interpreted within the context of the specific assessment and not as a diagnosis or professional credential." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>14. <TranslatedText text="Brain Games, Statistics and Leaderboards" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Brain games are interactive training and entertainment activities. Game scores are not automatically IQ scores, medical measurements, or clinical cognitive results." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Statistics, category scores, achievements, badges, recommendations, and leaderboard rankings may use separate scoring or ranking systems. They should not be treated as equivalent to formal assessment scores unless Testbrain expressly states otherwise." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Leaderboard positions may change as other users participate, scores are updated, or filters are changed." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>15. <TranslatedText text="Acceptable Use" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You agree not to misuse the Services. In particular, you must not:" />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Attempt to gain unauthorized access to Testbrain systems, accounts, data, or security controls" /></li>
                                <li><TranslatedText text="Use automated tools to scrape, copy, test, reverse engineer, or interfere with the Services except where expressly permitted by law" /></li>
                                <li><TranslatedText text="Circumvent payment, subscription, access-control, or assessment-integrity mechanisms" /></li>
                                <li><TranslatedText text="Submit fraudulent payment, refund, or chargeback claims" /></li>
                                <li><TranslatedText text="Use the Services to infringe intellectual-property, privacy, or other rights of another person" /></li>
                                <li><TranslatedText text="Resell, sublicense, reproduce, or commercially exploit Testbrain content without written permission" /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain may restrict or suspend access where reasonably necessary to protect users, the Services, payment systems, security, assessment integrity, or legal rights, subject to applicable law and contractual obligations." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>16. <TranslatedText text="Intellectual Property" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The Testbrain platform and its original content, including software, assessment designs, questions, scoring logic, reports, certificate designs, graphics, branding, databases, and other materials, are owned by or licensed to Comparo Media d.o.o. and are protected by applicable intellectual-property laws." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Your access to Testbrain gives you a limited, personal, non-exclusive, non-transferable right to use the Services for their intended purpose. No ownership rights are transferred to you." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You may download and use reports and certificates made available to you for personal purposes, subject to these Terms. You must not alter a Testbrain certificate or report in a way that falsely represents its contents, origin, score, or status." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>17. <TranslatedText text="Third-Party Services" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain may rely on third-party providers for payments, infrastructure, communications, analytics, authentication, or other functions. Third-party services may be governed by their own terms and privacy practices." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain is not responsible for interruptions caused solely by third-party systems outside its reasonable control, but this does not limit any mandatory consumer rights or Testbrain obligations that cannot lawfully be excluded." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>18. <TranslatedText text="Account Suspension and Termination" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain may suspend or terminate access where there is a material breach of these Terms, fraud, abusive conduct, misuse of the Services, security risk, or other lawful reason. Where required by applicable law, appropriate notice or an opportunity to remedy will be provided." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Suspension or termination does not remove any rights or obligations that accrued before termination, including payment obligations or statutory consumer rights." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>19. <TranslatedText text="Account Deletion" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You may request deletion of your Testbrain account through Profile &rarr; Settings &rarr; Delete Account." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If an active subscription exists, you must first cancel it through Subscription Management. Once the subscription cancellation has been successfully confirmed, you may immediately return to Profile &rarr; Settings &rarr; Delete Account and proceed with deletion. You do not need to wait until the end of the current billing period before deleting the account after cancellation is confirmed." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Account deletion and refund are separate processes. Deleting an account does not itself create a refund request or entitle you to a refund of previously processed charges." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Certain personal data or transaction records may be retained after account deletion where required or permitted by applicable law or as described in the Privacy Policy." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>20. <TranslatedText text="Privacy and Personal Data" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain processes personal data in accordance with its Privacy Policy and applicable data-protection law." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you want to exercise a privacy or data-protection right, including a request for access, correction, or erasure of personal data, use the methods described in the Privacy Policy or contact support@testbrain.net." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Deleting your Testbrain account does not necessarily mean that every record is immediately removed from every system where retention is required or permitted by law. The Privacy Policy explains the applicable processing and retention practices." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>21. <TranslatedText text="Service Availability and Changes" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain aims to provide reliable access but does not guarantee uninterrupted or error-free operation at all times. Maintenance, updates, network issues, payment-provider issues, or technical failures may temporarily affect availability." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If a technical problem materially prevents delivery of a purchased digital service, you may have remedies under applicable law and the Refund &amp; Cancellation Policy." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain may modify the Services to improve functionality, security, compliance, or user experience. Material changes that adversely affect an existing paid entitlement will be handled in accordance with applicable law." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>22. <TranslatedText text="Limitation of Liability" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="To the maximum extent permitted by applicable law, Comparo Media d.o.o. is not liable for indirect, incidental, special, punitive, or consequential loss arising from use of the Services where such liability can lawfully be excluded." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, including mandatory consumer rights, liability for fraud, or other liability that applicable law requires to remain available." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Where a limitation of liability is legally permitted, any limitation must be interpreted in light of the nature of the Service, the amount paid, and applicable mandatory law. These Terms do not create a waiver of rights that consumers cannot validly waive." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>23. <TranslatedText text="Consumer Rights" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Nothing in these Terms limits mandatory rights available to consumers under applicable law, including rights relating to unfair contract terms, distance contracts, digital content and digital services, defective or non-conforming services, refunds, withdrawal, privacy, or payment disputes." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you are a consumer outside Croatia, you may also have mandatory protections under the law of your country or state of residence that apply regardless of the governing-law clause below." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>24. <TranslatedText text="Dispute Resolution and Governing Law" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you have a complaint or dispute, please contact Testbrain Support first so we can try to resolve the matter informally." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="These Terms are governed by the laws of Croatia and applicable European Union law, without depriving consumers of mandatory protections available under the laws that apply to them." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Nothing in these Terms prevents a consumer from bringing a claim before a competent court or using an alternative dispute-resolution mechanism where such a right is available under applicable law." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain does not rely on the former European Commission Online Dispute Resolution (ODR) platform, which is no longer an active consumer-dispute platform." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>25. <TranslatedText text="Amendments to These Terms" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain may update these Terms from time to time to reflect changes in the Services, pricing, law, regulation, security requirements, or business operations." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="For recurring subscriptions, material changes that affect your rights or obligations will be communicated as required by applicable law. The &quot;Last Updated&quot; date identifies the current version." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Changes do not retroactively remove rights that have already accrued under mandatory law." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>26. <TranslatedText text="Contact" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="For questions about these Terms or the Services, contact:" />
                            </p>
                            <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '12px' }}>
                                Comparo Media d.o.o. (Testbrain)<br />
                                Miliutina Barača 7<br />
                                51000 Rijeka, Croatia<br />
                                Email: support@testbrain.net
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="For billing, refund, account, privacy, or technical matters, you may also use Testbrain Live Chat when available. Human review may be required for refunds, payment disputes, account-specific investigations, and privacy requests." />
                            </p>
                        </div>

                        <p className="text-gray-500" style={{ ...bodyStyle, fontSize: '14px' }}>
                            <TranslatedText text="These Terms of Use should be read together with the Testbrain Privacy Policy and Refund &amp; Cancellation Policy." />
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TermsOfUse;
