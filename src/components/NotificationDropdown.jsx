import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { toast } from 'react-hot-toast';

const NotificationDropdown = ({ isOpen, onClose, onRefresh }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.getUserNotifications();
      if (response.status === 'success') {
        setNotifications(response.data.items || []);
      } else {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Acknowledge the notification
      await notificationService.acknowledgeNotification(notification._id);
      
      // Refresh notifications in header
      if (onRefresh) {
        onRefresh();
      }
      
      // Navigate to the notification URL
      notificationService.navigateToNotification(notification.websiteUrl);
      
      // Close dropdown
      onClose();
      
      // Show success message
      toast.success('Notification acknowledged');
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Failed to acknowledge notification');
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Since the API doesn't provide isAcknowledged field, we'll use a different approach
  // For now, we'll assume all notifications are unread until acknowledged
  const unreadCount = notifications.length;

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
            <button
              onClick={() => navigate('/notifications')}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-2 text-sm text-orange-500 hover:text-orange-600"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h15a2 2 0 002-2v-15a2 2 0 00-2-2h-15a2 2 0 00-2 2v15a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-orange-500"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 4 && (
              <div className="px-4 py-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    onClose();
                  }}
                  className="w-full text-center text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  View {notifications.length - 4} more notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
