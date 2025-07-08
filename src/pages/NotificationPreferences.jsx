import React, { useState } from 'react';
import Header from '../components/Header';
import PageHeader from '../components/notifications/PageHeader';
import NotificationSection from '../components/notifications/NotificationSection';
import SaveButton from '../components/notifications/SaveButton';
import axios from 'axios';

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
    setNotifications(prev => {
        const newValue = !prev[key];

        if (key === 'pushNotifications' && newValue === true) {
            handleSubscribe();
        }

        return {
            ...prev,
            [key]: newValue
        };
    });
};


    const unreadCount = 3;

    const handleSave = () => {
        // Handle save logic here
        console.log('Saving notification preferences:', notifications);
    };

    const userId= '6867c23bcb56dbf1e48e5af9';

    const handleSubscribe = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    alert('Permission denied.');
    return;
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      'BKHoVAto9Hahq9SrS9Ie15YHCWgyBb6HQADUyiEacM_Aycf1IUIU1YwCVvnl5TxwU1W9fSd72_iSem8g5iUYKL0'
    )
  });

  await axios.post('http://localhost:3000/notifications/subscribe', {
    userId,
    subscription
  });

  alert('Subscribed successfully!');
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

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default NotificationPreferences;
