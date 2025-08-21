import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import PageHeader from '../components/notifications/PageHeader';
import NotificationSection from '../components/notifications/NotificationSection';
import SaveButton from '../components/notifications/SaveButton';
import usePushNotifications from '../hooks/usePushNotifications';

function NotificationPreferences() {
  const { isSubscribed, subscribe, unsubscribe, loading } = usePushNotifications();

  const [notifications, setNotifications] = useState({
    gameReminders: true,
    newAssessments: true,
    achievementAlerts: true,
    weeklyPerformance: true,
    pushNotifications: false,
    newsletter: true,
  });

  const handleToggle = async (key) => {
    setNotifications((prev) => {
      const newValue = !prev[key];
      return {
        ...prev,
        [key]: newValue,
      };
    });

    if (key === 'pushNotifications') {
      try {
        if (!isSubscribed && !loading) {
          await subscribe();
        } else if (isSubscribed && !loading) {
          await unsubscribe();
        }
      } catch (e) {
        // Optionally show a toast
        console.error(e);
      }
    }
  };

  const unreadCount = 3;

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving notification preferences:', notifications);
  };

  useEffect(() => {
    setNotifications((prev) => ({ ...prev, pushNotifications: isSubscribed }));
  }, [isSubscribed]);

  const emailNotifications = [
    { key: 'gameReminders', label: 'Game reminders' },
    { key: 'newAssessments', label: 'New assessments available' },
    { key: 'achievementAlerts', label: 'Achievement and badge alerts' },
    { key: 'weeklyPerformance', label: 'Weekly performance summary' },
  ];

  const pushNotifications = [
    { key: 'pushNotifications', label: 'Enable push notifications on this device' },
  ];

  const newsletterNotifications = [
    { key: 'newsletter', label: 'Subscribe to Bazingo tips and news' },
  ];

  return (
    <MainLayout unreadCount={unreadCount}>
      <div
        className="bg-white min-h-screen"
        style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}
      >
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
    </MainLayout>
  );
}

export default NotificationPreferences;
