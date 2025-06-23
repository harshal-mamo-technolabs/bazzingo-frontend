import React, { useState } from 'react';
import { ArrowLeft, Bell, Menu } from 'lucide-react';

function NotificationPreferences() {
    const [notifications, setNotifications] = useState({
        gameReminders: true,
        newAssessments: true,
        achievementAlerts: true,
        weeklyPerformance: true,
        pushNotifications: true,
        newsletter: true
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const unreadCount = 3;

    const ToggleSwitch = ({ isOn, onToggle }) => (
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${isOn ? 'bg-[#FF6B3E]' : 'bg-[#E5E7EB]'
                }`}
            style={{ width: '36px', height: '20px' }}
        >
            <span
                className={`inline-block bg-white rounded-full shadow transform transition-transform duration-200 ${isOn ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                style={{ width: '16px', height: '16px' }}
            />
        </button>
    );

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
                        <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: '600' }}>Notification Preference</h2>
                    </div>
                    <p className="text-gray-600" style={{ fontSize: '11px' }}>Manage how and when you receive updates from Bazingo. Stay in the loop without the noise.</p>
                </div>

                {/* Content Container */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-5">
                    <div className="max-w-[600px]">
                        {/* Email Notifications Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>Email Notifications</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="bg-gray-50 rounded-lg flex justify-between items-center" style={{ padding: '12px 16px' }}>
                                    <span className="text-gray-600" style={{ fontSize: '11px' }}>Game reminders</span>
                                    <ToggleSwitch
                                        isOn={notifications.gameReminders}
                                        onToggle={() => handleToggle('gameReminders')}
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg flex justify-between items-center" style={{ padding: '12px 16px' }}>
                                    <span className="text-gray-600" style={{ fontSize: '11px' }}>New assessments available</span>
                                    <ToggleSwitch
                                        isOn={notifications.newAssessments}
                                        onToggle={() => handleToggle('newAssessments')}
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg flex justify-between items-center" style={{ padding: '12px 16px' }}>
                                    <span className="text-gray-600" style={{ fontSize: '11px' }}>Achievement and badge alerts</span>
                                    <ToggleSwitch
                                        isOn={notifications.achievementAlerts}
                                        onToggle={() => handleToggle('achievementAlerts')}
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg flex justify-between items-center" style={{ padding: '12px 16px' }}>
                                    <span className="text-gray-600" style={{ fontSize: '11px' }}>Weekly performance summary</span>
                                    <ToggleSwitch
                                        isOn={notifications.weeklyPerformance}
                                        onToggle={() => handleToggle('weeklyPerformance')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Push Notifications Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>Push Notifications</h3>

                            <div className="bg-gray-50 rounded-lg flex justify-between items-center" style={{ padding: '12px 16px' }}>
                                <span className="text-gray-600" style={{ fontSize: '11px' }}>Enable push notifications on this device</span>
                                <ToggleSwitch
                                    isOn={notifications.pushNotifications}
                                    onToggle={() => handleToggle('pushNotifications')}
                                />
                            </div>
                        </div>

                        {/* Newsletter Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className="text-gray-900" style={{ fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>Newsletter</h3>

                            <div className="bg-gray-50 rounded-lg flex justify-between items-center" style={{ padding: '12px 16px' }}>
                                <span className="text-gray-600" style={{ fontSize: '11px' }}>Subscribe to Bazingo tips and news</span>
                                <ToggleSwitch
                                    isOn={notifications.newsletter}
                                    onToggle={() => handleToggle('newsletter')}
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            className="w-full sm:w-auto bg-[#FF6B3E] text-white border-none hover:bg-[#e55a35] transition-colors duration-200 flex items-center justify-center"
                            style={{
                                height: '32px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '0 20px',
                                marginTop: '8px'
                            }}
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default NotificationPreferences;
