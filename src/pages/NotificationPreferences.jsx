import React, { useState } from 'react';
import Header from '../components/Header';
import PageHeader from '../components/notifications/PageHeader';
import NotificationSection from '../components/notifications/NotificationSection';
import SaveButton from '../components/notifications/SaveButton';

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

    const handleSave = () => {
        // Handle save logic here
        console.log('Saving notification preferences:', notifications);
    };

    const emailNotifications = [
        { key: 'gameReminders', label: 'Game reminders' },
        { key: 'newAssessments', label: 'New assessments available' },
        { key: 'achievementAlerts', label: 'Achievement and badge alerts' },
        { key: 'weeklyPerformance', label: 'Weekly performance summary' }
    ];

    const pushNotifications = [
        { key: 'pushNotifications', label: 'Enable push notifications on this device' }
    ];

    const newsletterNotifications = [
        { key: 'newsletter', label: 'Subscribe to Bazingo tips and news' }
    ];

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
            {/* Header */}
            <Header unreadCount={unreadCount} />

            {/* Main Content */}
            <main>
                {/* Page Header */}
                <PageHeader />

                {/* Content Container */}
                <div className="mx-auto px-4 lg:px-12">
                    <div className="max-w-[600px]">
                        {/* Email Notifications Section */}
                        <NotificationSection
                            title="Email Notifications"
                            notifications={emailNotifications}
                            notificationStates={notifications}
                            onToggle={handleToggle}
                        />

                        {/* Push Notifications Section */}
                        <NotificationSection
                            title="Push Notifications"
                            notifications={pushNotifications}
                            notificationStates={notifications}
                            onToggle={handleToggle}
                        />

                        {/* Newsletter Section */}
                        <NotificationSection
                            title="Newsletter"
                            notifications={newsletterNotifications}
                            notificationStates={notifications}
                            onToggle={handleToggle}
                        />

                        {/* Save Button */}
                        <SaveButton onSave={handleSave} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default NotificationPreferences;
