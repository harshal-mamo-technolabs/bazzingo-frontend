import React from 'react';
import { ArrowLeft, Bell, Menu } from 'lucide-react';

function PrivacyPolicy() {
    const unreadCount = 3;

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
                        <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: '600' }}>Privacy Policy</h2>
                    </div>
                    <p className="text-gray-600" style={{ fontSize: '11px' }}>Your privacy is important to us. Here's how we collect, use, and protect your information.</p>
                </div>

                {/* Content Container */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-5">
                    <div className="max-w-[800px]">
                        {/* Section 1 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>1. Data We Collect:</h3>
                            <p className="text-gray-600" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                Lorem Ipsum has been the industry's standard dummy text ever since the
                                1500s, when an unknown printer took a galley of type and scrambled it to
                                make a type specimen book. It has survived not only five centuries, but also
                                the leap into electronic typesetting, remaining essentially unchanged. It was
                                popularised in the 1960s with the release of Letraset sheets containing
                                Lorem Ipsum passages, and more recently with desktop publishing
                                software like Aldus PageMaker including versions of Lorem Ipsum.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>2. Why We Collect It:</h3>
                            <p className="text-gray-600" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                Lorem Ipsum has been the industry's standard dummy text ever since the
                                1500s, when an unknown printer took a galley of type and scrambled it to
                                make a type specimen book. It has survived not only five centuries, but also
                                the leap into electronic typesetting, remaining essentially unchanged. It was
                                popularised in the 1960s with the release of Letraset sheets containing
                                Lorem Ipsum passages, and more recently with desktop publishing
                                software like Aldus PageMaker including versions of Lorem Ipsum.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;
