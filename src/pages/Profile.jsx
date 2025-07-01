// Profile.jsx
import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export default function Profile() {
    const unread = 3;

    return (
        <div className="min-h-screen bg-white font-inter text-[12px]">
            {/* ─── HEADER ─── */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-[1200px] mx-auto px-4 lg:px-12">
                    <div className="flex justify-between items-center h-[64px]">
                        {/* Logo */}
                        <h1 className="text-[24px] font-bold tracking-[0.075em]">
                            <span className="text-[#FF6B3E]">B</span>
                            <span className="text-black">AZIN</span>
                            <span className="text-[#FF6B3E]">G</span>
                            <span className="text-black">O</span>
                        </h1>

                        {/* Desktop nav */}
                        <nav className="hidden lg:flex gap-8">
                            {['Games', 'Assessments', 'Statistics', 'Leaderboard'].map(t => (
                                <a
                                    key={t}
                                    href="#"
                                    className="text-[14px] font-medium text-black hover:text-gray-700"
                                >
                                    {t}
                                </a>
                            ))}
                        </nav>

                        {/* Bell + Avatar */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div
                                    className="h-12 w-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#EEEEEE' }}
                                >
                                    <Bell className="h-8 w-8 text-gray-800" strokeWidth={2} />
                                </div>
                                {unread > 0 && (
                                    <span
                                        className="
                      absolute top-0 right-0
                      inline-flex items-center justify-center
                      h-6 w-6 rounded-full
                      bg-[#FF6B3E] text-white text-[12px] font-bold
                      transform translate-x-1/4 -translate-y-1/4
                    "
                                    >
                                        {unread}
                                    </span>
                                )}
                            </div>
                            <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center font-medium">
                                A
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ─── MAIN ─── */}
            <main className="px-4 py-6">
                <div className="max-w-[360px] mx-auto sm:max-w-none">
                    {/* Profile Information */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Profile Information
                    </h2>
                    <div className="bg-[#F5F5F5] rounded-[16px] p-6 flex items-center justify-between">
                        {/* Left: Avatar + Details */}
                        <div className="flex items-center">
                            {/* White circle behind photo */}
                            <div className="h-16 w-16 rounded-full bg-white overflow-hidden flex-shrink-0">
                                <img
                                    src="/mark.png"
                                    alt="Alex Johnson"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-1 px-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Alex Johnson
                                </h3>
                                <div className="mt-1 flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Age: 25</span>
                                    <span className="bg-[#FF6B3E] text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        Premium
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Edit Profile button */}
                        <button className="bg-black text-white text-sm font-medium px-5 py-2 rounded-lg">
                            Edit Profile
                        </button>
                    </div>

                    {/* Achievements placeholder */}
                    <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                        Achievements
                    </h2>
                    <div className="bg-[#F5F5F5] rounded-[16px] h-32">
                        {/* badges will go here */}
                    </div>
                </div>
            </main>
        </div>
    );
}
