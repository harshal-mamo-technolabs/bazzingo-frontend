import { API_CONNECTION_HOST_URL } from '../utils/constant';

class NotificationService {
  constructor() {
    this.baseURL = API_CONNECTION_HOST_URL;
  }

  // Get user token
  getUserToken() {
    const token = localStorage.getItem('user');
    if (!token) return null;
    
    try {
      const userData = JSON.parse(token);
      return userData?.accessToken || userData?.user?.token;
    } catch (error) {
      console.error('Error parsing user token:', error);
      return null;
    }
  }

  // Get user notifications
  async getUserNotifications() {
    try {
      const token = this.getUserToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.baseURL}/notifications/my-notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Acknowledge a notification
  async acknowledgeNotification(notificationId) {
    try {
      const token = this.getUserToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.baseURL}/notifications/${notificationId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to acknowledge notification: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      throw error;
    }
  }

  // Navigate to notification URL
  navigateToNotification(websiteUrl) {
    let urlToNavigate = websiteUrl || '/';
    
    // If it's a relative path (starts with /), make it absolute with current domain
    if (urlToNavigate.startsWith('/')) {
      urlToNavigate = window.location.origin + urlToNavigate;
    }
    
    // Navigate to the URL
    window.location.href = urlToNavigate;
  }
}

export default new NotificationService();
