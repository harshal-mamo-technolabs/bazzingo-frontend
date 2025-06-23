import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Plus, Minus, Menu } from 'lucide-react';

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
            <nav className="bg-[#F2F2F2] border-b border-gray-200">
                <div className="max-w-[1500px] mx-auto px-4 md:px-12">
                    <div className="flex justify-between items-center" style={{ height: '56px' }}>
                        {/* Logo */}
                        <div className="flex items-center">
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                <span className="text-[#FF6B3E]">B</span>
                                <span className="text-black">AZIN</span>
                                <span className="text-[#FF6B3E]">G</span>
                                <span className="text-[#FF6B3E]">O</span>
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex" style={{ gap: '28px' }}>
                            <a href="#" className="text-gray-700 hover:text-gray-900" style={{ fontSize: '12px', fontWeight: '500' }}>Games</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900" style={{ fontSize: '12px', fontWeight: '500' }}>Assessments</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900" style={{ fontSize: '12px', fontWeight: '500' }}>Statistics</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900" style={{ fontSize: '12px', fontWeight: '500' }}>Leaderboard</a>
                        </nav>

                        {/* Right side icons */}
                        <div className="flex items-center" style={{ gap: '14px' }}>
                            <div className="relative hidden lg:block">
                                <Bell style={{ height: '18px', width: '18px' }} className="text-gray-600" />
                                {unreadCount > 0 && (
                                    <span
                                        className="absolute bg-[#FF6B3E] text-white rounded-full flex items-center justify-center"
                                        style={{
                                            top: '-2px',
                                            right: '-2px',
                                            height: '12px',
                                            width: '12px',
                                            fontSize: '8px',
                                            lineHeight: '1'
                                        }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div
                                className="bg-black text-white rounded-full flex items-center justify-center hidden lg:flex"
                                style={{ height: '28px', width: '28px', fontSize: '12px', fontWeight: '500' }}
                            >
                                A
                            </div>
                            {/* Mobile hamburger menu */}
                            <Menu className="lg:hidden text-gray-600" style={{ height: '24px', width: '24px' }} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {/* Page Header */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-5" style={{ paddingTop: '28px', paddingBottom: '20px' }}>
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600" />
                        <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: '600' }}>Help & FAQs</h2>
                    </div>
                    <p className="text-gray-600" style={{ fontSize: '11px' }}>Find answers to the most common questions. Still need help? Raise a ticket.</p>
                </div>

                {/* Content Container */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-5">
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
