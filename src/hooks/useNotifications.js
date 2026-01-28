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
      socket.emit('registerUser', userId);
    });

    socket.on('newNotification', (notification) => {
      showInAppNotification(notification);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
}

export default useNotifications;
