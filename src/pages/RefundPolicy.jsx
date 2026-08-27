import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';
import { getUserProfile } from '../services/dashbaordService';
import { isMsisdnUser } from '../config/accessControl';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };
const subLabelStyle = { ...bodyStyle, fontWeight: 600, marginTop: '12px', marginBottom: '6px' };
const listStyle = { ...bodyStyle, paddingLeft: '20px', listStyleType: 'disc', marginBottom: '8px' };

// The refund policy describes the Stripe subscription lifecycle, so it is only
// relevant to card-billed users. Carrier-billed (MSISDN) users are sent back to
// the profile instead of seeing terms that do not apply to their billing.
const resolveAccess = (user) => (isMsisdnUser(user) ? 'denied' : 'granted');

function RefundPolicy() {
    const navigate = useNavigate();
    const storedUser = useSelector((state) => state.user?.user);
    const [access, setAccess] = useState(() =>
        storedUser && 'msisdn' in storedUser ? resolveAccess(storedUser) : 'checking',
    );

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

    // The stored user is not guaranteed to carry `msisdn` (MSISDN login only
    // returns a token), so fall back to the profile endpoint to decide.
    useEffect(() => {
        if (access !== 'checking') return undefined;

        let cancelled = false;
        getUserProfile()
            .then((response) => {
                if (!cancelled) setAccess(resolveAccess(response?.data?.user));
            })
            .catch(() => {
                if (!cancelled) setAccess(resolveAccess(null));
            });

        return () => {
            cancelled = true;
        };
    }, [access]);

    useEffect(() => {
        if (access === 'denied') {
            navigate('/profile', { replace: true });
        }
    }, [access, navigate]);

    if (access !== 'granted') {
        return (
            <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                <Header unreadCount={3} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            <Header unreadCount={3} />
            <main>
                <div className="mx-auto px-4 lg:px-12 pt-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}><TranslatedText text="Refund Policy" /></span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}><TranslatedText text="Refund Policy" /></span>
                        </h2>
                    </div>
                    <h3 className="text-gray-900 mt-4" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '18px', fontWeight: '600' }}>
                        <TranslatedText text="Refund &amp; Cancellation Policy" />
                    </h3>
                    <p className="text-gray-500 mt-1" style={{ ...bodyStyle, fontSize: '13px' }}>
                        Last Updated: 25 August 2026
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '24px' }}>
                            <TranslatedText text="This Refund &amp; Cancellation Policy explains how subscription cancellations, withdrawal rights, and refund requests work for Testbrain, a digital IQ testing and cognitive assessment service operated by Comparo Media d.o.o., Miliutina Barača 7, 51000 Rijeka, Croatia." />
                        </p>
                        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '24px' }}>
                            <TranslatedText text="This policy applies to purchases made through Testbrain. Nothing in this policy limits any mandatory consumer rights that apply under the laws of your country of residence." />
                        </p>
                        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '24px' }}>
                            <TranslatedText text="For assistance, you can use Testbrain Live Chat when available or contact support@testbrain.net." />
                        </p>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>1. <TranslatedText text="Testbrain Purchases" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain currently offers both recurring subscriptions and individual one-time assessment purchases." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Trial Subscription" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="&euro;2.99 for 3 days" /></li>
                                <li><TranslatedText text="The trial fee is charged when you subscribe." /></li>
                                <li><TranslatedText text="Unless cancelled before the trial period ends, the subscription automatically converts to the Monthly Subscription." /></li>
                                <li><TranslatedText text="After the trial, the applicable subscription fee is &euro;35.00 per month." /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Monthly Subscription" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="&euro;35.00 per month" /></li>
                                <li><TranslatedText text="Automatically renews each month until cancelled." /></li>
                                <li><TranslatedText text="There is no fixed contract term." /></li>
                                <li><TranslatedText text="You can cancel at any time to prevent future renewals." /></li>
                            </ul>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Individual Assessment Purchase" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="&euro;10.00 per assessment" /></li>
                                <li><TranslatedText text="One-time payment." /></li>
                                <li><TranslatedText text="No automatic renewal." /></li>
                                <li><TranslatedText text="Does not create a Trial or Monthly Subscription." /></li>
                                <li><TranslatedText text="Applies only to the individual assessment purchased." /></li>
                                <li><TranslatedText text="Includes access to the purchased assessment and its applicable personalized report and certificate after completion." /></li>
                            </ul>

                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="All displayed prices include VAT where applicable." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Payments are securely processed by Stripe, Inc. Testbrain does not store your full payment card number." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>2. <TranslatedText text="Cancelling Your Subscription" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You can cancel your Trial or Monthly Subscription at any time through your Testbrain account." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="How to Cancel" /></p>
                            <ol className="text-gray-600" style={{ ...listStyle, listStyleType: 'decimal' }}>
                                <li><TranslatedText text="Log in to your Testbrain account." /></li>
                                <li><TranslatedText text="Go to Subscription Management." /></li>
                                <li><TranslatedText text="Select Cancel Subscription." /></li>
                                <li><TranslatedText text="Follow the on-screen instructions and confirm the cancellation." /></li>
                            </ol>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Once the cancellation is confirmed, no further automatic renewal charges will be made." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Cancelling During the Trial" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you cancel your Trial before it expires, the &euro;35.00 Monthly Subscription charge will not be taken." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Cancelling a Monthly Subscription" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you cancel an active Monthly Subscription, future renewals will stop." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Unless otherwise stated during the cancellation process, you may continue using the subscription until the end of the billing period already paid for." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Cancellation Is Not a Refund" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Cancelling your subscription prevents future renewals. It does not automatically refund charges that have already been processed." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you want to request a refund for an existing charge, see the refund sections below." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>3. <TranslatedText text="Refund Requests for Subscription Charges" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Refund requests concerning Trial or Monthly Subscription payments are reviewed separately from subscription cancellation." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you would like to request a refund, you can contact a human Testbrain Support agent through Live Chat, when available." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If Live Chat is unavailable, contact: support@testbrain.net" />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Please use the email address associated with your Testbrain account where possible." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Submitting a refund request does not guarantee approval. We will review the circumstances of your request together with the applicable Testbrain terms and any mandatory consumer rights." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>4. <TranslatedText text="30-Day Satisfaction Guarantee" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="In addition to any mandatory consumer rights that may apply, Testbrain offers a voluntary 30-Day Satisfaction Guarantee for eligible Monthly Subscription charges." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you are not satisfied, you may request a refund of your most recent Monthly Subscription charge within 30 days of that charge." />
                            </p>
                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="The guarantee:" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Applies to the most recent eligible Monthly Subscription payment." /></li>
                                <li><TranslatedText text="Does not automatically refund earlier billing periods." /></li>
                                <li><TranslatedText text="Does not automatically cancel your subscription." /></li>
                                <li><TranslatedText text="Is generally available once per eligible billing relationship." /></li>
                                <li><TranslatedText text="Does not extend your access after an approved refund where access is terminated as part of that refund." /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The 30-Day Satisfaction Guarantee is a voluntary commercial commitment offered by Comparo Media and is separate from any mandatory statutory consumer rights." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>5. <TranslatedText text="Individual Assessment Refunds" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Individual assessments are &euro;10.00 one-time purchases and are not recurring subscriptions." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Assessment Not Yet Started" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you purchased an individual assessment but have not started it, you may submit a refund request for human review." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Use Testbrain Live Chat when available or contact support@testbrain.net." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="A human Testbrain Support agent will review the request and determine whether a refund can be issued." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Assessment Already Completed" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you have completed the individually purchased assessment and the corresponding report or certificate has been provided or made available to you, the purchase is generally not eligible for a voluntary refund, subject always to any mandatory consumer rights that apply." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="This does not affect your statutory rights where the digital content or service is defective, not supplied as agreed, or otherwise does not conform to the contract." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>6. <TranslatedText text="EU/EEA Right of Withdrawal" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="This section applies to consumers in the European Union and European Economic Area where the statutory right of withdrawal applies." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Consumers generally have 14 days to withdraw from a distance contract without giving a reason, subject to the exceptions and conditions provided by applicable consumer law." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Digital Content and Immediate Performance" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Certain Testbrain products provide digital content or digital services immediately after purchase." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Under EU consumer law, the statutory right of withdrawal for digital content not supplied on a tangible medium may cease once performance has begun where the legally required conditions are satisfied, including the consumer's prior express consent to immediate performance and acknowledgement of the resulting loss of the withdrawal right. The trader must also provide the required confirmation." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Where those legal requirements have not been satisfied, your statutory withdrawal rights remain unaffected." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Nothing in this policy is intended to remove or restrict a statutory withdrawal right that you retain under applicable law." />
                            </p>

                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="Exercising a Statutory Withdrawal Right" /></p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Where you have a statutory right of withdrawal, you may exercise it by making a clear statement that you wish to withdraw from the contract." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You can contact support@testbrain.net or use any withdrawal functionality provided directly through Testbrain where available." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="No specific wording is required as long as your decision to withdraw is clear." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>7. <TranslatedText text="Defective or Non-Conforming Digital Services" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The refund rules above do not limit your statutory rights where Testbrain digital content or services are defective, unavailable, or otherwise fail to conform to the contract." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="EU rules provide consumers with remedies for digital content and digital services that are not supplied as agreed, which can include bringing the service into conformity, a price reduction, or termination and reimbursement where the applicable legal conditions are met." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you believe a technical problem materially prevented you from receiving the service you purchased, contact Testbrain Support and describe the issue." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>8. <TranslatedText text="How to Request a Refund" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="The preferred method is to contact a human Testbrain Support agent through Live Chat when available." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If Live Chat is unavailable, email: support@testbrain.net" />
                            </p>
                            <p className="text-gray-800" style={subLabelStyle}><TranslatedText text="When contacting us, please provide:" /></p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="The email address associated with your Testbrain account." /></li>
                                <li><TranslatedText text="The purchase or charge concerned." /></li>
                                <li><TranslatedText text="The approximate purchase or charge date." /></li>
                                <li><TranslatedText text="A short explanation of the issue." /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Please do not send your full payment card number, CVV/CVC, PIN, banking password, account password, or authentication codes." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We may request additional information where reasonably necessary to identify the transaction or investigate your request." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>9. <TranslatedText text="Refund Processing" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If a refund is approved, it will normally be issued to the original payment method." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We do not ordinarily issue refunds as store credit, vouchers, or to a different payment card." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="After Testbrain issues a refund, the time required for the funds to appear on your account depends on your bank, card issuer, and payment processor." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain cannot control the final settlement time imposed by your financial institution." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Where applicable law establishes a mandatory reimbursement deadline, that deadline will apply." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>10. <TranslatedText text="Exceptions and Fair Use" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Testbrain may refuse requests made under its voluntary refund or satisfaction guarantees in cases involving abuse, fraud, or misuse, including:" />
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><TranslatedText text="Repeated purchase-and-refund activity intended to obtain Testbrain services without payment." /></li>
                                <li><TranslatedText text="Multiple accounts created to repeatedly claim voluntary refunds." /></li>
                                <li><TranslatedText text="Fraudulent refund requests." /></li>
                                <li><TranslatedText text="Duplicate voluntary refund claims for the same transaction." /></li>
                                <li><TranslatedText text="Other demonstrable abuse of Testbrain's voluntary refund programs." /></li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="These restrictions apply to voluntary Testbrain refund guarantees only." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="They do not limit statutory withdrawal rights, remedies for defective or non-conforming digital services, chargeback rights, or other mandatory consumer protections." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>11. <TranslatedText text="Chargebacks and Unrecognized Payments" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you do not recognize a Testbrain payment or believe you were charged incorrectly, please contact Testbrain Support so we can investigate the transaction." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Use Live Chat when available or contact: support@testbrain.net" />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We may ask for limited transaction information necessary to locate the payment. Never send your full card number, CVV/CVC, PIN, banking password, or authentication codes." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Contacting Testbrain first may allow us to resolve the issue more quickly, but nothing in this policy restricts any right you may have to contact your bank, card issuer, payment provider, or other competent authority regarding a disputed transaction." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>12. <TranslatedText text="Account Deletion and Subscription Cancellation" /></h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Deleting a Testbrain account and cancelling a subscription are related but separate actions." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="If you currently have an active subscription, you must first cancel it through Subscription Management." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Once the cancellation has been successfully confirmed, you may proceed immediately to: Profile &rarr; Settings &rarr; Delete Account" />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="You do not need to wait until the end of the current billing period before deleting your account after the subscription cancellation has been confirmed." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Account deletion does not create a refund request. If you also want to request a refund for an existing charge, you must submit a separate refund request." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="Certain information may be retained after account deletion where required for legal, accounting, fraud-prevention, dispute-resolution, or other legitimate compliance purposes, as described in the Testbrain Privacy Policy." />
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>13. <TranslatedText text="Contact &amp; Governing Law" /></h3>
                            <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '12px' }}>
                                Comparo Media d.o.o. (Testbrain)<br />
                                Miliutina Barača 7<br />
                                51000 Rijeka, Croatia<br />
                                Email: support@testbrain.net
                            </p>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                <TranslatedText text="This policy is governed by the laws of Croatia and applicable European Union law, without depriving consumers of mandatory protections available under the laws applicable to them." />
                            </p>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                <TranslatedText text="EU consumers can find information about their consumer rights through official European Union consumer resources." />
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                <TranslatedText text="We may update this Refund &amp; Cancellation Policy from time to time. The Last Updated date at the top identifies the current version." />
                            </p>
                        </div>

                        <p className="text-gray-500" style={{ ...bodyStyle, fontSize: '14px' }}>
                            <TranslatedText text="This Refund &amp; Cancellation Policy forms part of the Testbrain Terms &amp; Conditions and does not limit mandatory consumer rights." />
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RefundPolicy;
