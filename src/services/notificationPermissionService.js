import pushNotificationService from './pushNotificationService';
import { toast } from 'react-hot-toast';

class NotificationPermissionService {
  constructor() {
    this.hasRequestedPermission = false;
    this.permissionRequestDelay = 3000; // 3 seconds delay
    this.checkInterval = null;
  }

  // Check if user is logged in
  isUserLoggedIn() {
    const token = localStorage.getItem('user');
    if (!token) return false;
    
    try {
      const userData = JSON.parse(token);
      return !!(userData?.accessToken || userData?.user?.token);
    } catch (error) {
      return false;
    }
  }

  // Check if notifications are already enabled
  isNotificationPermissionGranted() {
    return Notification.permission === 'granted';
  }

  // Check if user has already been asked for permission
  hasUserBeenAsked() {
    return localStorage.getItem('notificationPermissionAsked') === 'true';
  }

  // Mark that user has been asked for permission
  markAsAsked() {
    localStorage.setItem('notificationPermissionAsked', 'true');
  }

  // Request notification permission with user-friendly approach
  async requestPermissionWithDelay() {
    // Don't request if already granted or already asked
    if (this.isNotificationPermissionGranted() || this.hasUserBeenAsked()) {
      return;
    }

    // Wait for the delay period
    await new Promise(resolve => setTimeout(resolve, this.permissionRequestDelay));

    // Check again after delay (user might have navigated away)
    if (!this.isUserLoggedIn() || this.isNotificationPermissionGranted() || this.hasUserBeenAsked()) {
      return;
    }

    this.hasRequestedPermission = true;
    this.markAsAsked();

    try {
      // Show a friendly toast message first
      toast.loading('Would you like to receive notifications from Bazzingo?', {
        duration: 5000,
        id: 'notification-permission-toast'
      });

      // Request permission
      const permission = await Notification.requestPermission();
      
      // Dismiss the loading toast
      toast.dismiss('notification-permission-toast');

      if (permission === 'granted') {
        // Subscribe to push notifications
        await pushNotificationService.subscribeToPush();
        toast.success('🎉 Notifications enabled! You\'ll receive updates from Bazzingo.');
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. You can enable them later in your browser settings.');
      } else {
        toast('Notifications permission not granted. You can enable them later.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.dismiss('notification-permission-toast');
      toast.error('Failed to enable notifications. Please try again later.');
    }
  }

  // Start monitoring for permission requests
  startPermissionMonitoring() {
    // Only start if user is logged in and hasn't been asked yet
    if (!this.isUserLoggedIn() || this.hasUserBeenAsked()) {
      return;
    }

    // Request permission after delay
    this.requestPermissionWithDelay();
  }

  // Stop monitoring
  stopPermissionMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Reset permission state (for testing)
  resetPermissionState() {
    localStorage.removeItem('notificationPermissionAsked');
    this.hasRequestedPermission = false;
  }

  // Check current status
  getStatus() {
    return {
      isLoggedIn: this.isUserLoggedIn(),
      permissionGranted: this.isNotificationPermissionGranted(),
      hasBeenAsked: this.hasUserBeenAsked(),
      hasRequested: this.hasRequestedPermission
    };
  }
}

export default new NotificationPermissionService();
