import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      console.log('--- FETCHING INITIAL NOTIFICATIONS ---');
      const data = await apiService.getNotifications({ limit: 10 });
      console.log('--- FETCH NOTIFICATIONS SUCCESS:', data);
      setNotifications(data.results || []);
      const countData = await apiService.getUnreadCount();
      console.log('--- FETCH UNREAD COUNT SUCCESS:', countData);
      setUnreadCount(countData.count || 0);
    } catch (err) {
      console.error('--- FAILED TO FETCH NOTIFICATIONS:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // WebSocket for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let socket = null;
    let isMounted = true;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/notifications/${user.id}/`;
      
      console.log('--- ATTEMPTING NOTIFICATION WS CONNECT:', wsUrl);
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('--- NOTIFICATION WS CONNECTED ---');
      };

      socket.onmessage = (event) => {
        console.log('--- NOTIFICATION WS MESSAGE RECEIVED:', event.data);
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_notification') {
            console.log('--- PROCESSING NEW NOTIFICATION ---');
            const newNotif = data.notification;
            setNotifications(prev => [newNotif, ...prev].slice(0, 20));
            setUnreadCount(prev => prev + 1);
            
            if (Notification.permission === 'granted') {
               new Notification(newNotif.title, { body: newNotif.content });
            }
          }
        } catch (err) {
          console.error('Error parsing notification WS:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('--- NOTIFICATION WS ERROR:', error);
      };

      socket.onclose = (e) => {
        console.log('--- NOTIFICATION WS CLOSED ---', e.code, e.reason);
        if (isMounted) {
          setTimeout(connect, 5000); // Reconnect
        }
      };
    };

    connect();
    fetchNotifications();

    return () => {
      isMounted = false;
      if (socket) socket.close();
    };
  }, [isAuthenticated, user, fetchNotifications]);

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length > 0) {
        await apiService.markNotificationsRead(unreadIds);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationsRead([id]);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAllRead,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
