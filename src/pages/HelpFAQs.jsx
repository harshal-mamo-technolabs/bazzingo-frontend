import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Plus, Minus, Menu } from 'lucide-react';
import Header from '../components/Header';

function HelpFAQs() {
    const navigate = useNavigate();
    const [expandedFAQ, setExpandedFAQ] = useState(0); // First FAQ is expanded by default
    const unreadCount = 3;
    const [expanded, setExpanded] = useState(0);

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
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}>Help & FAQs</span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}>Help & FAQs</span>
                        </h2>
                    </div>
                    <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400' }}>Find answers to the most common questions. Still need help? Raise a ticket.</p>
                </div>

                {/* Content Container */}
                <div className="px-4 lg:px-12 py-4 lg:py-1 max-w-xl">
                    <h3 className="text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600' }}>FAQs</h3>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => {
                            const isOpen = expanded === i;
                            return (
                                <div key={i} className="border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setExpanded(isOpen ? -1 : i)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 focus:outline-none"
                                    >
                                        <span className="text-gray-900 text-sm lg:text-base" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: '400' }}>
                                            <span className="lg:hidden" style={{ fontSize: '14px', fontWeight: '400' }}>{faq.question}</span>
                                            <span className="hidden lg:inline" style={{ fontSize: '16px', fontWeight: '400' }}>{faq.question}</span>
                                        </span>
                                        {isOpen
                                            ? <Minus className="w-4 h-4 text-gray-600" />
                                            : <Plus className="w-4 h-4 text-gray-600" />
                                        }
                                    </button>

                                    {isOpen && <hr className="border-t border-black mx-4" />}

                                    {isOpen && (
                                        <div className="bg-gray-50 px-4 pb-4 pt-3 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                            <span className="lg:hidden" style={{ fontSize: '14px' }}>{faq.answer}</span>
                                            <span className="hidden lg:inline" style={{ fontSize: '16px' }}>{faq.answer}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HelpFAQs;
