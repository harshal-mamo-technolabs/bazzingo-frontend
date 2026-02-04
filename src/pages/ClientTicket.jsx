import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Mail, HelpCircle, BookOpen, Wrench, CreditCard } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import useHelpScout from '../hooks/useHelpScout';
import { selectSubscriptionData } from '../app/subscriptionSlice';
import { isComponentVisible } from '../config/accessControl';
import TranslatedText from '../components/TranslatedText.jsx';

function ClientTicket() {
    const navigate = useNavigate();
    const subscriptionData = useSelector(selectSubscriptionData);
    const beaconId = import.meta.env.VITE_HELPSCOUT_BEACON_ID;

    const helpScoutAttributes = useMemo(() => {
        const attributes = {};
        
        if (subscriptionData?.planName) {
            attributes.subscriptionPlan = subscriptionData.planName;
        }
        
        if (subscriptionData?.subscriptionStatus) {
            attributes.subscriptionStatus = subscriptionData.subscriptionStatus;
        }
        
        if (subscriptionData?.status) {
            attributes.planStatus = subscriptionData.status;
        }
        
        return attributes;
    }, [subscriptionData]);

    useHelpScout(beaconId, {
        customAttributes: helpScoutAttributes
    }, !isComponentVisible('hideHelpScoutBeaconForMSISDN')); // Pass false to hide beacon if switch is enabled

    const helpResources = [
        { label: <TranslatedText text="Frequently Asked Questions" />, icon: HelpCircle, route: '/help-faqs' },
        { label: <TranslatedText text="Impressum" />, icon: BookOpen, route: '/impressum' },
        { label: <TranslatedText text="Terms of Use" />, icon: Wrench, route: '/agb' },
    ];

    return (
        <MainLayout>
            <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <style>{`
                    iframe[src*="helpscout"],
                    iframe[src*="beacon"],
                    [class*="Beacon"],
                    [id*="beacon"],
                    [id*="Beacon"] {
                        z-index: 999999 !important;
                        pointer-events: auto !important;
                    }
                    
                    #beacon-container,
                    .BeaconContainer,
                    [class*="BeaconContainer"] {
                        z-index: 999999 !important;
                        pointer-events: auto !important;
                    }
                    
                    .BeaconFabButtonFrame,
                    [class*="BeaconFabButtonFrame"],
                    button[class*="Beacon"] {
                        z-index: 999999 !important;
                        pointer-events: auto !important;
                        cursor: pointer !important;
                    }
                    
                    [class*="BeaconModal"],
                    [class*="BeaconFrame"],
                    [data-beacon-modal] {
                        z-index: 999999 !important;
                        pointer-events: auto !important;
                    }
                    
                    iframe[src*="helpscout"] *,
                    iframe[src*="beacon"] * {
                        pointer-events: auto !important;
                    }
                `}</style>

                {/* Main Content */}
                <main>
                    {/* Page Header */}
                    <div className="mx-auto px-4 lg:px-12 py-4 lg:pb-6">
                        <div className="flex items-center mb-3">
                            <ArrowLeft 
                                className="text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" 
                                style={{ height: '18px', width: '18px', marginRight: '12px' }} 
                                onClick={() => navigate(-1)} 
                            />
                            <h1 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>
                                <TranslatedText text="Help & Support" />
                            </h1>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="mx-auto px-4 lg:px-12 pb-8 max-w-4xl">
                        {/* We're Here to Help Section */}
                        <section className="mb-8">
                            <h2 className="text-gray-900 mb-3" style={{ fontSize: '24px', fontWeight: 600 }}>
                                <TranslatedText text="We're Here to Help" />
                            </h2>
                            <p className="text-gray-600 mb-6" style={{ fontSize: '16px', fontWeight: 400, lineHeight: '1.5' }}>
                                <TranslatedText text="Get in touch with our support team. We're available to assist you with any questions or concerns." />
                            </p>

                            {/* Support Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Live Chat Card */}
                                <div className="border border-gray-300 rounded-lg p-6 bg-white hover:border-[#FF6B3E] transition-colors cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-[#FF6B3E] rounded-lg flex items-center justify-center">
                                                <MessageCircle className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-gray-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
                                                <TranslatedText text="Live Chat" />
                                            </h3>
                                            <p className="text-gray-600" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.5' }}>
                                                <TranslatedText text="Chat with our support team in real-time. Click the chat widget in the bottom right corner to start a conversation." />
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Support Card */}
                                <div className="border border-gray-300 rounded-lg p-6 bg-white hover:border-[#FF6B3E] transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-[#FF6B3E] rounded-lg flex items-center justify-center">
                                                <Mail className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-gray-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
                                                <TranslatedText text="Email Support" />
                                            </h3>
                                            <p className="text-gray-600 mb-2" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.5' }}>
                                                <TranslatedText text="Send us an email and we'll get back to you as soon as possible." />
                                            </p>
                                            <a 
                                                href="mailto:support@bazzingo.net" 
                                                className="text-[#FF6B3E] hover:text-[#e55a35] underline transition-colors"
                                                style={{ fontSize: '14px', fontWeight: 500 }}
                                            >
                                                support@bazzingo.net
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Before You Contact Us Section */}
                        <section>
                            <h2 className="text-gray-900 mb-3" style={{ fontSize: '24px', fontWeight: 600 }}>
                                <TranslatedText text="Before You Contact Us" />
                            </h2>
                            <p className="text-gray-600 mb-6" style={{ fontSize: '16px', fontWeight: 400, lineHeight: '1.5' }}>
                                <TranslatedText text="You might find the answer you're looking for in our help resources:" />
                            </p>

                            {/* Help Resources Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {helpResources.map((resource, index) => {
                                    const Icon = resource.icon;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => resource.route && navigate(resource.route)}
                                            className="border border-gray-300 rounded-lg p-4 bg-white hover:bg-gray-50 hover:border-[#FF6B3E] transition-all cursor-pointer flex items-center gap-3"
                                        >
                                            <Icon className="w-5 h-5 text-[#FF6B3E] flex-shrink-0" />
                                            <span 
                                                className="text-gray-700 hover:text-[#FF6B3E] transition-colors"
                                                style={{ fontSize: '15px', fontWeight: 400 }}
                                            >
                                                {typeof resource.label === 'string' ? <TranslatedText text={resource.label} /> : resource.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}

export default ClientTicket;
