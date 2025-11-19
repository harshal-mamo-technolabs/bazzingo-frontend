import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import PageHeader from '../components/notifications/PageHeader';
import NotificationSection from '../components/notifications/NotificationSection';
import SaveButton from '../components/notifications/SaveButton';
import usePushNotifications from '../hooks/usePushNotifications';
import { updateUserPreferences } from '../services/dashbaordService';
import toast from 'react-hot-toast';
import TranslatedText from '../components/TranslatedText.jsx';
import { useTranslateText } from '../hooks/useTranslate';

function NotificationPreferences() {
  const { isSubscribed, subscribe, unsubscribe, loading } = usePushNotifications();
  const savingText = useTranslateText('Saving preferences...');
  const successText = useTranslateText('Preferences saved successfully!');
  const errorTextPrefix = useTranslateText('Failed to save preferences:');
  const tryAgainText = useTranslateText('Please try again');
  const pushNotificationErrorText = useTranslateText('Failed to update push notifications');

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
        toast.error(pushNotificationErrorText);
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
        loading: savingText,
        success: successText,
        error: (err) => `${errorTextPrefix} ${err.message || tryAgainText}`,
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
    { key: 'gameReminders', label: <TranslatedText text="Game reminders" /> },
    { key: 'newAssessments', label: <TranslatedText text="New assessments available" /> },
    { key: 'achievementAlerts', label: <TranslatedText text="Achievement and badge alerts" /> },
    { key: 'weeklyPerformance', label: <TranslatedText text="Weekly performance summary" /> },
  ];

  const pushNotifications = [
    { key: 'pushNotifications', label: <TranslatedText text="Enable push notifications on this device" /> },
  ];

  const newsletterNotifications = [
    { key: 'newsletter', label: <TranslatedText text="Subscribe to Bazingo tips and news" /> },
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
                title={<TranslatedText text="Email Notifications" />}
                notifications={emailNotifications}
                notificationStates={notifications}
                onToggle={handleToggle}
              />

              {/* Push Notifications Section */}
              <NotificationSection
                title={<TranslatedText text="Push Notifications" />}
                notifications={pushNotifications}
                notificationStates={notifications}
                onToggle={handleToggle}
              />

              {/* Newsletter Section */}
              <NotificationSection
                title={<TranslatedText text="Newsletter" />}
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