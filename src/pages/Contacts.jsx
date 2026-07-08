import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';

const sectionStyle = { marginBottom: '24px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };

function Contacts() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            <Header unreadCount={3} />
            <main>
                <div className="mx-auto px-4 lg:px-12 pt-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}><TranslatedText text="Contacts" /></span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}><TranslatedText text="Contacts" /></span>
                        </h2>
                    </div>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        <div style={sectionStyle}>
                            <p className="text-gray-600 mb-4" style={bodyStyle}>
                                Sollten Sie noch Fragen haben, dann können Sie Kontakt mit uns unter{' '}
                                <a href="mailto:bazingo.de@silverlines.info" className="text-blue-600 underline">
                                    bazingo.de@silverlines.info
                                </a>{' '}
                                aufnehmen. Bitte vergessen Sie nicht, Ihre Handynummer anzugeben. Wir setzen uns so schnell wie möglich mit Ihnen in Verbindung!
                            </p>
                            <p className="text-gray-600" style={bodyStyle}>
                                Telefonnummer Helpdesk:{' '}
                                <a href="tel:08005895405" className="text-blue-600 underline">
                                    08005895405
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Contacts;
