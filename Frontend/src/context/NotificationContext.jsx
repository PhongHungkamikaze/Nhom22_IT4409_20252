import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

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
      const data = await apiService.getNotifications({ limit: 10 });
      setNotifications(data.results || []);
      const countData = await apiService.getUnreadCount();
      setUnreadCount(countData.count || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Firestore Real-time Listener
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let isMounted = true;

    try {
      const colRef = collection(db, "notifications", user.id.toString(), "items");
      const q = query(colRef, orderBy("created_at", "desc"), limit(1));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted || snapshot.empty) return;

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            fetchNotifications();

            if (Notification.permission === 'granted') {
              const newNotif = change.doc.data();
              new Notification(newNotif.title || "New notification", {
                body: newNotif.content || "You have a new notification",
                icon: '/favicon.ico'
              });
            }
          }
        });
      }, () => {});

      fetchNotifications();

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch {
      // silently fail
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

  const markAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length > 0) {
        await apiService.markNotificationsRead(unreadIds);
      }
    } catch {
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await apiService.markNotificationsRead([id]);
    } catch {
      fetchNotifications();
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
