import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import PageHeader from '../components/notifications/PageHeader';
import NotificationSection from '../components/notifications/NotificationSection';
import SaveButton from '../components/notifications/SaveButton';
import usePushNotifications from '../hooks/usePushNotifications';
import { updateUserPreferences } from '../services/dashbaordService';
import toast from 'react-hot-toast';

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

  const [isSaving, setIsSaving] = useState(false);

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
        console.error(e);
        toast.error('Failed to update push notifications');
      }
    }
  };

  const unreadCount = 3;

  const handleSave = async () => {
    setIsSaving(true);
    
    const savePromise = new Promise(async (resolve, reject) => {
      try {
        // Map UI state to API request format
        const preferencesData = {
          email: {
            gameReminders: notifications.gameReminders,
            newAssessmentsAvailable: notifications.newAssessments,
            achievementAndBadgeAlerts: notifications.achievementAlerts,
            weeklyPerformanceSummary: notifications.weeklyPerformance,
          },
          push: {
            enablePushNotifications: notifications.pushNotifications,
          },
          newsletter: {
            subscribeToTipsAndNews: notifications.newsletter,
          }
        };

        const response = await updateUserPreferences(preferencesData);
        resolve(response);
      } catch (error) {
        console.error('Error saving preferences:', error);
        reject(error);
      } finally {
        setIsSaving(false);
      }
    });

    toast.promise(
      savePromise,
      {
        loading: 'Saving preferences...',
        success: 'Preferences saved successfully!',
        error: (err) => `Failed to save preferences: ${err.message || 'Please try again'}`,
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 3000,
          icon: '✅',
        },
        error: {
          duration: 4000,
          icon: '❌',
        },
      }
    );
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
              <SaveButton onSave={handleSave} loading={isSaving} />
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}

export default NotificationPreferences;