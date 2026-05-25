import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';
import { AgbBody } from '../components/legal/AgbBody.jsx';

function AGB() {
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
                        <ArrowLeft
                            style={{ height: '14px', width: '14px', marginRight: '8px' }}
                            className="text-gray-600 cursor-pointer"
                            onClick={() => navigate(-1)}
                        />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}>
                                <TranslatedText text="AGB – General Terms and Conditions" />
                            </span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                <TranslatedText text="AGB – General Terms and Conditions" />
                            </span>
                        </h2>
                    </div>
                    <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400' }}>
                        <TranslatedText text="AGB – General Terms and Conditions" />
                    </p>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        <AgbBody />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AGB;
