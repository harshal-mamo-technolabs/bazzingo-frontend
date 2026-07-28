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
                        Last Updated: 27.07.2026
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '24px' }}>
                            This Refund &amp; Cancellation Policy explains how cancellations, withdrawals, and refunds work for TestBrain, a digital IQ testing and brain training service operated by Comparo Media, Milutina Bara&ccedil;a 7, 51000 Rijeka, Croatia. It applies to every purchase made through testbrain.net. If anything here is unclear, email us at support@testbrain.net before you buy &mdash; we would rather answer a question than process a refund.
                        </p>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>What You Are Purchasing</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                TestBrain is sold as an auto-renewing subscription:
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>3-day trial: &euro;2.99, charged immediately when you subscribe</li>
                                <li>After the trial: &euro;35.00 per month, charged automatically on the same day each month</li>
                                <li>Renewal continues until you cancel &mdash; there is no fixed contract term and no cancellation fee</li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                All amounts are in euros and include VAT where applicable. Payments are processed by Stripe, Inc.; we never store your full card number.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>Cancelling Your Subscription</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                You can cancel at any time, for any reason.
                            </p>
                            <p className="text-gray-800" style={subLabelStyle}>How to cancel:</p>
                            <ol className="text-gray-600" style={{ ...listStyle, listStyleType: 'decimal' }}>
                                <li>Email support@testbrain.net with the subject line &ldquo;Cancel Subscription&rdquo;</li>
                                <li>Include the email address you used at checkout</li>
                                <li>We confirm your cancellation by email within 24 hours</li>
                            </ol>
                            <p className="text-gray-800" style={subLabelStyle}>What happens next:</p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>Cancelling before your 3-day trial ends means the &euro;35.00 monthly charge is never taken</li>
                                <li>Cancelling during a paid month stops all future charges; you keep access until the end of the period you already paid for</li>
                                <li>Cancellation alone is not a refund request &mdash; if you also want money back, see the sections below</li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>14-Day Right of Withdrawal (EU/EEA Consumers)</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                If you are a consumer resident in the EU or EEA, the Consumer Rights Directive (2011/83/EU) gives you 14 days from the day the contract is concluded to withdraw without giving any reason.
                            </p>
                            <p className="text-gray-600 mt-2" style={bodyStyle}>
                                <strong>Digital content note:</strong> When you start using TestBrain immediately (taking the test, opening your report or certificate), you give express consent to immediate performance and, under Article 16(m) of the Directive, you would normally lose the statutory right of withdrawal. TestBrain waives this exclusion: we honour the full 14-day withdrawal period even if you have already accessed your results.
                            </p>
                            <p className="text-gray-600 mt-2" style={bodyStyle}>
                                <strong>How to withdraw:</strong> Send a clear statement to support@testbrain.net (&ldquo;I withdraw from my contract&rdquo;) within 14 days of purchase, together with the email address used at checkout and the date of purchase. No form or justification is required.
                            </p>
                            <p className="text-gray-600 mt-2" style={bodyStyle}>
                                We refund all payments received under the withdrawn contract to your original payment method.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>30-Day Satisfaction Guarantee</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                Beyond your statutory rights, we offer a voluntary goodwill guarantee on monthly subscription charges.
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>If you are not satisfied, request a refund of your most recent monthly charge within 30 days of that charge</li>
                                <li>No explanation and no justification required</li>
                                <li>Applies to the latest monthly payment only &mdash; earlier billing periods that were used are not retroactively refunded</li>
                                <li>Available once per billing period and does not extend your access after the refund is issued</li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                This guarantee is offered by Comparo Media as a commercial commitment and is in addition to &mdash; never a replacement for &mdash; your mandatory consumer rights.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>Rights of Customers in the United States</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                Customers in the United States receive the same treatment described above.
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><strong>Automatic renewal disclosure:</strong> This is a negative-option, automatically renewing subscription. The trial converts to &euro;35.00/month unless cancelled before the trial ends. This is disclosed at checkout, on the payment form, and in your confirmation email.</li>
                                <li><strong>Easy cancellation:</strong> You can cancel by a single email to support@testbrain.net; we do not require phone calls, retention interviews, or additional steps.</li>
                                <li><strong>Same refund windows:</strong> The 14-day withdrawal window and the 30-day satisfaction guarantee are applied to US customers on identical terms.</li>
                                <li>Nothing in this policy limits rights you may have under applicable state consumer protection or auto-renewal laws.</li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>How to Request a Refund</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                Send one email to support@testbrain.net with the subject line &ldquo;Refund Request&rdquo; and include:
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>The email address used at checkout</li>
                                <li>The date and amount of the charge you want refunded</li>
                                <li>Whether you are exercising the 14-day withdrawal right or the 30-day guarantee (optional &mdash; we will apply whichever is more favourable to you)</li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                We acknowledge every request within 2 business days and tell you clearly whether it is approved. If we need more information, we will ask for it in that first reply.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>Processing Time</h3>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                Approved refunds are processed to the original payment method within 14 days of us approving the request &mdash; usually much sooner.
                            </p>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                Once Stripe releases the refund, the time it takes to appear on your statement depends on your bank or card issuer, typically 5&ndash;10 business days. We cannot influence that final settlement window, but the refund reference is available on request.
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                We do not issue refunds as store credit, vouchers, or to a different card than the one used for the original payment.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>Exceptions &amp; Fair Use</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                We may decline a refund request in the following limited cases:
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li><strong>Abuse of the guarantee:</strong> repeated subscribe-refund cycles, or multiple accounts created by the same person to claim repeated refunds</li>
                                <li>Fraudulent or unauthorised claims, including chargebacks filed on charges you actually authorised</li>
                                <li>Charges older than the applicable window, outside the 14-day withdrawal period and the 30-day guarantee</li>
                                <li>Purchases made through a third party (for example an app store), which must be refunded through that provider under its own policy</li>
                            </ul>
                            <p className="text-gray-600" style={bodyStyle}>
                                If we decline, we will explain why in writing and tell you how to escalate.
                            </p>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>Chargebacks &amp; Payment Disputes</h3>
                            <p className="text-gray-600" style={bodyStyle}>
                                Please contact us before filing a chargeback with your bank. Almost every dispute we see &mdash; an unexpected renewal, a duplicate charge, an unrecognised descriptor &mdash; is resolved by email within one business day.
                            </p>
                            <ul className="text-gray-600" style={listStyle}>
                                <li>Charges appear on your statement via our payment processor, Stripe, Inc.</li>
                                <li>Duplicate or clearly unauthorised charges are refunded in full, without any time limit</li>
                                <li>A chargeback filed before contacting support may suspend your account while the dispute is investigated with the card network</li>
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <h3 className="text-gray-900" style={headingStyle}>Contact &amp; Governing Law</h3>
                            <p className="text-gray-600" style={{ ...bodyStyle, marginBottom: '12px' }}>
                                Comparo Media (operating as TestBrain)<br />
                                Milutina Bara&ccedil;a 7<br />
                                51000 Rijeka, Croatia<br />
                                Email: support@testbrain.net
                            </p>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                This policy is governed by the laws of Croatia and the European Union, without prejudice to the mandatory consumer protection rules of your country of residence.
                            </p>
                            <p className="text-gray-600 mb-2" style={bodyStyle}>
                                <strong>EU Online Dispute Resolution:</strong> https://ec.europa.eu/consumers/odr
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                We update this policy from time to time; the &ldquo;Last Updated&rdquo; date above always reflects the current version.
                            </p>
                        </div>

                        <p className="text-gray-500" style={{ ...bodyStyle, fontSize: '14px' }}>
                            This Refund &amp; Cancellation Policy forms part of our Terms &amp; Conditions and does not limit your statutory consumer rights.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RefundPolicy;
