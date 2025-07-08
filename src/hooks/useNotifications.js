import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { showInAppNotification } from '../utils/showInAppNotification';

const SOCKET_URL = 'http://localhost:3000';

function useNotifications(userId) {
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('registerUser', userId);
    });

    socket.on('newNotification', (notification) => {
      console.log('Received notification:', notification);
      showInAppNotification(notification);
    });

    return () => {
      socket.disconnect();
      console.log('Socket disconnected.');
    };
  }, [userId]);
}

export default useNotifications;
