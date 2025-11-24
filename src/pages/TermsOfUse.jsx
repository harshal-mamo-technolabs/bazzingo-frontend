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
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="1. Scope" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="These General Terms and Conditions (hereinafter: &quot;GTC&quot;) form part of every contract between Comparo Media d.o.o. (hereinafter: &quot;Provider&quot;) and the user of the services provided by the Provider. The GTC also apply to the legal successors of both the Provider and the user." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The Provider offers the user, in return for payment, the possibility to access and use the digital content offered on the website via their mobile device (mobile phone). These GTC govern all provisions related to the use of these services." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="These GTC apply exclusively to users residing in Germany." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="The services of the Provider are provided exclusively on the basis of these GTC. By using the services, the user acknowledges these GTC as binding." />
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="2. Conclusion of Contract" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The presentation of the services on the Provider's website does not constitute a binding offer, but rather an invitation to the user to submit an offer." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The contract is concluded once the user activates the displayed confirmation or play button on their mobile device, and the Provider then sets up access to the service." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="After successful activation, the user can access and use all offered content via their mobile device." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The prices communicated to the user apply. These include statutory VAT, apply to the specified period, and refer exclusively to the usage rights of the Provider's services. Any connection or data charges incurred by the user's mobile network operator are not included in the prices." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The fee becomes due immediately upon conclusion of the contract without deduction. Billing is carried out on behalf of the Provider via the user's mobile network operator as part of the regular mobile bill." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="The user receives a simple, non-transferable, time-limited (for the duration of the contract), and geographically unrestricted right to use the provided services." />
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="3. Payment Terms" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The prices communicated to the user, including statutory VAT, apply. These prices apply to the respective billing or usage period. Possible connection charges by the mobile network operator are not included." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="The usage fee becomes due immediately upon conclusion of the contract and is collected on behalf of the Provider via the user's mobile network operator." />
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="4. Usage Rights" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="The user receives a simple, non-exclusive, non-transferable right to use the Provider's services, limited to the duration of the contract. Forwarding or distributing the content to third parties is not permitted." />
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="5. Availability" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '12px' }}>
                                <TranslatedText text="The Provider guarantees an average availability of the services of 99.5% per year. If this availability is not met, the user may request an appropriate reduction. The reduction is limited to the amount the user had to pay for the period of reduced availability." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="The Provider aligns its offering with common technical standards but cannot guarantee that all mobile devices available on the market support the services without errors." />
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="6. Limitation of Liability / Release from Liability" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="For damages not resulting from injury to life, body, or health, the Provider is liable only in cases of intentional or grossly negligent conduct by the Provider, its employees, or vicarious agents. This also applies to damages resulting from breaches of duties during contract negotiations or from unlawful acts." />
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TermsOfUse;
