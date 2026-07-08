import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };

// Pre-filled withdrawal request email (subject + body are already URL-encoded).
const WITHDRAWAL_MAILTO =
    'mailto:withdrawal.de@silverlines.info?subject=Antrag%20auf%20Widerruf%20des%20Vertrags&body=Sehr%20geehrte%20Damen%20und%20Herren%2C%0A%0Aich%20m%C3%B6chte%20hiermit%20den%20Widerruf%20des%20Vertrags%20beantragen.%0A%0ATelefonnummer%2C%20mit%20der%20ich%20den%20Dienst%20aktiviert%20habe%3A%0AName%20des%20Dienstes%3A%0AAktivierungsdatum%2C%20falls%20bekannt%3A%0A%0AVielen%20Dank.';

function WithdrawContract() {
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
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}>Vertrag widerrufen</span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}>Vertrag widerrufen</span>
                        </h2>
                    </div>
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        <div className="border border-gray-300 rounded-lg p-6 lg:p-8 bg-white">
                            <p className="text-gray-600 mb-6" style={bodyStyle}>
                                Wenn Sie einen Antrag auf Widerruf des Vertrags stellen möchten, klicken Sie bitte auf die
                                Schaltfläche unten. Ihre E-Mail-App wird mit einer vorbereiteten Nachricht geöffnet.
                            </p>

                            <div className="rounded-lg p-4 mb-6 bg-[#FFF4F0] border border-[#FFD9CC]">
                                <p className="text-gray-900 mb-1" style={{ ...bodyStyle, fontWeight: 600 }}>
                                    Wichtig:
                                </p>
                                <p className="text-gray-600" style={bodyStyle}>
                                    Bitte geben Sie in der E-Mail unbedingt die Telefonnummer an, mit der Sie den Dienst
                                    aktiviert haben. Ohne diese Telefonnummer kann Ihre Anfrage möglicherweise nicht gefunden
                                    und bearbeitet werden.
                                </p>
                            </div>

                            <a
                                href={WITHDRAWAL_MAILTO}
                                className="inline-flex items-center justify-center w-full sm:w-auto bg-[#FF6B3E] hover:bg-[#e55a35] text-white rounded-lg px-6 py-3 transition-colors"
                                style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: 600 }}
                            >
                                Vertrag widerrufen
                            </a>

                            <p className="text-gray-500 mt-6" style={{ ...bodyStyle, fontSize: '14px' }}>
                                Das Absenden eines Antrags bedeutet nicht automatisch eine Rückerstattung. Die Anfrage wird
                                gemäß den Nutzungsbedingungen und den geltenden gesetzlichen Bestimmungen geprüft.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default WithdrawContract;
