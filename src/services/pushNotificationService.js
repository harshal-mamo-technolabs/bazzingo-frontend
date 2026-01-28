import { API_CONNECTION_HOST_URL } from '../utils/constant';

class PushNotificationService {
  constructor() {
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'your_vapid_public_key_here';
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Check if push notifications are supported
  isPushSupported() {
    return this.isSupported;
  }

  // Request notification permission from user
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Register service worker
  async registerServiceWorker() {
    if (!this.isSupported) {
      throw new Error('Service worker not supported');
    }

    try {
      // Check if service worker is already registered
      const existingRegistration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (existingRegistration) {
        return existingRegistration;
      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    try {
      // Register service worker first
      const registration = await this.registerServiceWorker();
      
      // Ensure service worker is active
      if (registration.active) {
      } else if (registration.installing) {
        await new Promise((resolve) => {
          registration.installing.addEventListener('statechange', () => {
            if (registration.installing.state === 'activated') {
              resolve();
            }
          });
        });
      } else if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        await navigator.serviceWorker.ready;
      }
      
      // Wait a bit more to ensure service worker is fully ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });


      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  // Send subscription to backend
  async sendSubscriptionToBackend(subscription) {
    const token = localStorage.getItem('user');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const userData = JSON.parse(token);
    const accessToken = userData?.accessToken || userData?.user?.token;

    const response = await fetch(`${API_CONNECTION_HOST_URL}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        subscription: subscription
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to backend');
    }

  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify backend about unsubscription
        await this.notifyBackendUnsubscribe();
      }
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      throw error;
    }
  }

  // Notify backend about unsubscription
  async notifyBackendUnsubscribe() {
    const token = localStorage.getItem('user');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const userData = JSON.parse(token);
    const accessToken = userData?.accessToken || userData?.user?.token;
    
    const response = await fetch(`${API_CONNECTION_HOST_URL}/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to notify backend about unsubscription');
    }
  }

  // Convert VAPID key to Uint8Array
  urlBase64ToUint8Array(base64String) {
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

  // Check current subscription status
  async getSubscriptionStatus() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return {
        isSubscribed: !!subscription,
        permission: Notification.permission,
        serviceWorkerReady: true
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return {
        isSubscribed: false,
        permission: 'denied',
        serviceWorkerReady: false
      };
    }
  }

  // Check if service worker is properly registered
  async checkServiceWorkerStatus() {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) {
        return { registered: false, active: false };
      }
      
      return {
        registered: true,
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting
      };
    } catch (error) {
      console.error('Error checking service worker status:', error);
      return { registered: false, active: false };
    }
  }
}

export default new PushNotificationService();
