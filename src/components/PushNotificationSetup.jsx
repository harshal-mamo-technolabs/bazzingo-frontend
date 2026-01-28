import React, { useState, useEffect } from 'react';
import pushNotificationService from '../services/pushNotificationService';
import { toast } from 'react-hot-toast';

const PushNotificationSetup = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState(null);

  useEffect(() => {
    checkInitialStatus();
  }, []);

  const checkInitialStatus = async () => {
    setIsSupported(pushNotificationService.isPushSupported());
    
    if (pushNotificationService.isPushSupported()) {
      // Check permission directly from browser
      const browserPermission = Notification.permission;
      
      const status = await pushNotificationService.getSubscriptionStatus();
      
      // Force default state for testing if permission is not explicitly set
      const finalPermission = browserPermission === 'default' ? 'default' : browserPermission;
      setPermission(finalPermission);
      setIsSubscribed(status.isSubscribed);
      
      // Check service worker status
      const swStatus = await pushNotificationService.checkServiceWorkerStatus();
      setServiceWorkerStatus(swStatus);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      
      // Check service worker status first
      const swStatus = await pushNotificationService.checkServiceWorkerStatus();
      
      // Request permission
      const hasPermission = await pushNotificationService.requestPermission();
      
      if (!hasPermission) {
        setError('Notification permission denied. Please enable notifications in your browser settings.');
        setPermission('denied');
        toast.error('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }

      setPermission('granted');

      // Subscribe to push notifications
      await pushNotificationService.subscribeToPush();
      setIsSubscribed(true);
      
      // Update service worker status
      const newSwStatus = await pushNotificationService.checkServiceWorkerStatus();
      setServiceWorkerStatus(newSwStatus);
      
      // Show success message
      toast.success('Push notifications enabled successfully!');
      
    } catch (error) {
      console.error('Error enabling notifications:', error);
      let errorMessage = error.message || 'Failed to enable notifications';
      
      // Provide more specific error messages
      if (error.message.includes('no active Service Worker')) {
        errorMessage = 'Service worker is not active. Please refresh the page and try again.';
      } else if (error.message.includes('Service worker registration failed')) {
        errorMessage = 'Failed to register service worker. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await pushNotificationService.unsubscribeFromPush();
      setIsSubscribed(false);
      setPermission('denied');
      toast.success('Push notifications disabled successfully!');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setError(error.message || 'Failed to disable notifications');
      toast.error(error.message || 'Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification('Test Notification', {
          body: 'This is a test notification from Bazzingo!',
          icon: '/icon-192x192.svg',
          badge: '/badge-72x72.svg'
        });
        
        notification.onclick = () => {
          notification.close();
        };
        
        toast.success('Test notification sent!');
      } else {
        toast.error('Notification permission not granted');
      }
    } catch (error) {
      console.error('Error showing test notification:', error);
      toast.error('Failed to show test notification');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h15a2 2 0 002-2v-15a2 2 0 00-2-2h-15a2 2 0 00-2 2v15a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
          </div>
        </div>
        <p className="text-gray-600">Push notifications are not supported in this browser.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h15a2 2 0 002-2v-15a2 2 0 00-2-2h-15a2 2 0 00-2 2v15a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {permission === 'default' && (
        <div>
          <p className="text-gray-600 mb-4">Enable push notifications to receive real-time updates and important messages from Bazzingo.</p>
          <div className="flex gap-3">
            <button 
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enabling...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h15a2 2 0 002-2v-15a2 2 0 00-2-2h-15a2 2 0 00-2 2v15a2 2 0 002 2z" />
                  </svg>
                  Enable Notifications
                </>
              )}
            </button>
            <button 
              onClick={checkInitialStatus}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </button>
            <button 
              onClick={testNotification}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h15a2 2 0 002-2v-15a2 2 0 00-2-2h-15a2 2 0 00-2 2v15a2 2 0 002 2z" />
              </svg>
              Test Notification
            </button>
          </div>
        </div>
      )}

      {permission === 'granted' && isSubscribed && (
        <div>
          <div className="flex items-center mb-4">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-green-600 font-medium">Push notifications are enabled</p>
          </div>
          <p className="text-gray-600 mb-4">You'll receive real-time updates and important messages from Bazzingo.</p>
          <button 
            onClick={handleDisableNotifications}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Disabling...
              </>
            ) : (
              'Disable Notifications'
            )}
          </button>
        </div>
      )}

      {permission === 'denied' && (
        <div>
          <div className="flex items-center mb-4">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <p className="text-red-600 font-medium">Push notifications are disabled</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">To enable notifications:</h4>
            <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Set notifications to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && serviceWorkerStatus && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Debug Information:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Browser Permission: {permission}</p>
            <p>Is Subscribed: {isSubscribed ? '✅' : '❌'}</p>
            <p>Service Worker Registered: {serviceWorkerStatus.registered ? '✅' : '❌'}</p>
            <p>Service Worker Active: {serviceWorkerStatus.active ? '✅' : '❌'}</p>
            <p>Service Worker Installing: {serviceWorkerStatus.installing ? '⏳' : '❌'}</p>
            <p>Service Worker Waiting: {serviceWorkerStatus.waiting ? '⏳' : '❌'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationSetup;
