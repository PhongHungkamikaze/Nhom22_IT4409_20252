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
      console.log('--- API CALL: FETCHING NOTIFICATIONS ---');
      const data = await apiService.getNotifications({ limit: 10 });
      setNotifications(data.results || []);
      const countData = await apiService.getUnreadCount();
      setUnreadCount(countData.count || 0);
    } catch (err) {
      console.error('--- API ERROR:', err);
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
    if (!isAuthenticated || !user?.id) {
      console.log('--- NOTIFICATION LISTENER: Skipping (not auth or no user id)', { isAuthenticated, userId: user?.id });
      return;
    }

    let isMounted = true;
    console.log(`--- LISTENING FOR NOTIFICATIONS AT: notifications/${user.id}/items`);

    try {
      const colRef = collection(db, "notifications", user.id.toString(), "items");
      // Lắng nghe items mới nhất
      const q = query(colRef, orderBy("created_at", "desc"), limit(1));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted) return;

        if (snapshot.empty) {
          console.log('--- FIREBASE SIGNAL: Snapshot empty (no notifications yet)');
          return;
        }

        snapshot.docChanges().forEach((change) => {
          // Chỉ xử lý khi có item THÊM MỚI
          if (change.type === "added") {
            const newNotif = change.doc.data();
            console.log('--- FIREBASE SIGNAL: NEW NOTIFICATION ADDED ---', newNotif);

            // Kiểm tra xem đây có phải là bản ghi mới thực sự (không phải snapshot đầu tiên của thông báo cũ)
            // Hoặc đơn giản là cứ refresh cho chắc cũng được
            fetchNotifications();

            // Hiển thị thông báo trình duyệt
            if (Notification.permission === 'granted') {
              new Notification(newNotif.title || "Thông báo mới", {
                body: newNotif.content || "Bạn có một thông báo mới trong hệ thống",
                icon: '/favicon.ico'
              });
            }
          }
        });
      }, (error) => {
        console.error('--- FIRESTORE LISTENER ERROR:', error);
      });

      // Load initial data from API
      fetchNotifications();

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.error('--- FIRESTORE SETUP ERROR:', err);
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
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await apiService.markNotificationsRead([id]);
    } catch (err) {
      console.error('Failed to mark as read:', err);
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
