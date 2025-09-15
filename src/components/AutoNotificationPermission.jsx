import React, { useEffect } from 'react';
import notificationPermissionService from '../services/notificationPermissionService';

const AutoNotificationPermission = () => {
  useEffect(() => {
    // Start monitoring for permission requests when component mounts
    notificationPermissionService.startPermissionMonitoring();

    // Cleanup when component unmounts
    return () => {
      notificationPermissionService.stopPermissionMonitoring();
    };
  }, []);

  // This component doesn't render anything - it just handles the permission logic
  return null;
};

export default AutoNotificationPermission;
