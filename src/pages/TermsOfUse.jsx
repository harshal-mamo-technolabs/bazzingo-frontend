import React from 'react';
import { ArrowLeft, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';

function TermsOfUse() {
    const unreadCount = 3;
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            {/* Header */}
            <Header unreadCount={3} />

            {/* Main Content */}
            <main>
                {/* Page Header */}
                <div className="mx-auto px-4 lg:px-12 pt-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}><TranslatedText text="AGB – General Terms and Conditions" /></span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}><TranslatedText text="AGB – General Terms and Conditions" /></span>
                        </h2>
                    </div>
                    <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400' }}><TranslatedText text="AGB – General Terms and Conditions" /></p>
                </div>

                {/* Content Container */}
                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        {/* Section 1 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="1. General Provisions, Scope, and Contracting Parties" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="These General Terms and Conditions comprehensively govern the use of all content provided by the provider via the digital platform &quot;Bazingo.&quot; The following provisions apply to all users who access the digital services offered through their mobile device." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="These GTC apply exclusively to consumers with their habitual residence in the Federal Republic of Germany. Deviating general terms and conditions of the user do not apply; their inclusion is expressly rejected." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="The provider is a company based in the European Union, whose complete details are listed in the platform's legal notice (&quot;Impressum&quot;). The legal notice forms an integral part of the contractual relationship." />
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="2. Subject Matter of the Contract" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The provider offers digital content — in particular audiovisual, multimedia, or other electronic content — which can be accessed via the user's mobile device. The specific functionality of the content may vary depending on technical design and is subject to ongoing updates, extensions, or adjustments by the provider." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="Use of the provided content is exclusively online; permanent storage, distribution, or reproduction by the user is not permitted." />
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="3. Conclusion of the Contract" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="A contract is concluded once the user clicks the displayed confirmation or activation button on their device and the provider technically enables access." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="Billing is carried out exclusively through the respective mobile network operator, who collects the fee payable by the user on behalf of the provider. Any telecommunications charges of the mobile network operator are not part of the services provided by the provider." />
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="4. Provision of Access" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="After successful activation, the user receives time-limited access to all content available on the platform for a clearly defined period. This usage period ends automatically upon expiration of the agreed duration, without requiring any termination." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="Access can be restored at any time thereafter by reactivation. There is expressly no subscription or automatic renewal." />
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="5. Scope of Usage Rights" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="The provider grants the user a simple, non-transferable, revocable right, valid only for the duration of each usage period, to use the provided content within the functionalities of the platform." />
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="6. Technical Requirements and Availability" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Use of the service requires a suitable mobile device and a stable internet or mobile data connection. The provider does not guarantee full compatibility with all devices or all network operators." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="The provider ensures an average technical availability of 99.5% on an annual basis." />
                            </p>
                        </div>

                        {/* Section 7 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="7. Limitation of Liability" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="For damages not resulting from injury to life, body, or health, the provider is liable only in cases of intentional or grossly negligent conduct. Any further liability is excluded." />
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="8. Cancellation Policy" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="Consumers have the right to withdraw from the contract at any time and receive a full refund. To exercise the right of withdrawal, a brief notification to the contact details listed in the legal notice is sufficient." />
                            </p>
                        </div>

                        {/* Section 9 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="9. Privacy Policy" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Controller:" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The company named in the legal notice." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Data processed:" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Mobile phone number, IP address, technical device information, activation data, log data, billing data." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Purposes:" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Provision of services, billing, security, fraud prevention, legal obligations." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Legal bases:" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Art. 6(1)(b), (c), and (f) GDPR." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Storage period:" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Only as long as necessary or legally required." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="Data subject rights:" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="Right of access, rectification, erasure, restriction of processing, data portability, and objection." />
                            </p>
                        </div>

                        {/* Section 10 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="10. Final Provisions" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="Should individual provisions of these GTC be invalid, the validity of the remaining provisions shall remain unaffected. The law of the Federal Republic of Germany applies." />
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TermsOfUse;
