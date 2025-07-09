import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Plus, Minus, Menu } from 'lucide-react';
import Header from '../components/Header';

function HelpFAQs() {
    const navigate = useNavigate();
    const [expandedFAQ, setExpandedFAQ] = useState(0); // First FAQ is expanded by default
    const unreadCount = 3;

    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "Go to Settings > Update Password. Enter your current password and set a new one."
        },
        {
            question: "What are badges and how do I earn them?",
            answer: "Badges are achievements you earn by completing specific tasks or reaching milestones in games. You can view your badges in your profile section."
        },
        {
            question: "Can I delete my account?",
            answer: "Yes, you can delete your account by going to Settings > Account Settings > Delete Account. Please note that this action is irreversible."
        },
        {
            question: "Why didn't I get a badge after a game?",
            answer: "Badges are awarded based on specific criteria. Make sure you've met all the requirements for the badge. Some badges may take time to appear in your profile."
        },
        {
            question: "How is the leaderboard rank calculated?",
            answer: "The leaderboard rank is calculated based on your total points earned across all games, completion time, and accuracy. Rankings are updated in real-time."
        }
    ];

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? -1 : index);
    };

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            {/* Header */}
            <Header unreadCount={3} />

            {/* Main Content */}
            <main>
                {/* Page Header */}
                <div className="mx-auto px-4 lg:px-12 py-4 lg:pb-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600" />
                        <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: '600' }}>Help & FAQs</h2>
                    </div>
                    <p className="text-gray-600" style={{ fontSize: '11px' }}>Find answers to the most common questions. Still need help? Raise a ticket.</p>
                </div>

                {/* Content Container */}
                <div className="mx-auto px-4 lg:px-12 py-4 lg:py-1">
                    <div className="max-w-[600px]">
                        <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>FAQs</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {faqs.map((faq, index) => (
                                <div key={index} className="border border-[#D1D5DB] rounded-lg bg-white">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none rounded-lg"
                                        style={{ padding: '12px 16px', minHeight: '48px' }}
                                    >
                                        <span className="text-gray-900" style={{ fontSize: '11px', fontWeight: '500', paddingRight: '16px' }}>{faq.question}</span>
                                        <div className="flex-shrink-0">
                                            {expandedFAQ === index ? (
                                                <Minus style={{ height: '12px', width: '12px' }} className="text-gray-600" />
                                            ) : (
                                                <Plus style={{ height: '12px', width: '12px' }} className="text-gray-600" />
                                            )}
                                        </div>
                                    </button>
                                    {expandedFAQ === index && (
                                        <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }} className="rounded-b-lg">
                                            <p className="text-gray-600" style={{ fontSize: '11px', marginTop: '12px' }}>{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HelpFAQs;
