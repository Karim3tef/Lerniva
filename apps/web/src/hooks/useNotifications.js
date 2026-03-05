'use client';
import { useEffect, useState } from 'react';
import { connectSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    api.get('/notifications').then((data) => {
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length || 0);
    }).catch(() => {});

    const socket = connectSocket();
    socket.on('notification', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.off('notification');
  }, [isAuthenticated]);

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
