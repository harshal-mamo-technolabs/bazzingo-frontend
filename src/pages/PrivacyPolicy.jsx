import React from 'react';
import { ArrowLeft, Bell, Menu } from 'lucide-react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import TranslatedText from '../components/TranslatedText.jsx';

function PrivacyPolicy() {
    const navigate = useNavigate();
    const unreadCount = 3;

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
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}><TranslatedText text="Impressum" /></span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}><TranslatedText text="Impressum" /></span>
                        </h2>
                    </div>
                </div>

                {/* Content Container */}
                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        {/* Information pursuant to § 5 TMG */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="Information pursuant to § 5 TMG" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '8px' }}>
                                <TranslatedText text="Comparo Media d.o.o." />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '8px' }}>
                                <TranslatedText text="Tometići 15a" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '8px' }}>
                                <TranslatedText text="51215 Kastav" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '24px' }}>
                                <TranslatedText text="Croatia" />
                            </p>
                        </div>

                        {/* Contact */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="Contact" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '8px' }}>
                                <TranslatedText text="Phone number: 0800 589 5405" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="Email: bazingo.de@silverlines.info" />
                            </p>
                        </div>

                        {/* VAT ID */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}><TranslatedText text="VAT ID" /></h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5', marginBottom: '8px' }}>
                                <TranslatedText text="Value Added Tax Identification Number pursuant to § 27 a of the German Value Added Tax Act:" />
                            </p>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' }}>
                                <TranslatedText text="HR80948414608" />
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;
