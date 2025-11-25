import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { UserNotification } from '@/types/notification.type';
import { getUserInfo } from '@/lib/utils';

export type NotificationHandler = (notification: UserNotification) => void;

export function useNotificationSocket(onNotification: NotificationHandler) {
  useEffect(() => {
    const userInfo = getUserInfo();
    const userId = userInfo?.id ?? userInfo?.id;
    if (!userId) return;

    const url = import.meta.env.VITE_NOTIFICATION_SOCKET_URL || 'http://localhost:5001';

    const socket: Socket = io(url, {
      transports: ['websocket'],
      query: {
        userId,
      },
    });

    socket.on('notification', (notification: UserNotification) => {
      onNotification(notification);
    });

    socket.on('connect_error', (err) => {
      console.error('Notification socket connection error', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [onNotification]);
}
