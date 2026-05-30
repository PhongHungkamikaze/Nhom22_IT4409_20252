import apiClient from './apiClient';

/**
 * Fetch notifications for the current user
 */
export const getNotifications = async (params = {}) => {
  const response = await apiClient.request('/notification/', { params });
  return response;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await apiClient.request('/notification/unread-count/');
  return response;
};

/**
 * Mark specific notifications as read
 */
export const markNotificationsRead = async (ids) => {
  const response = await apiClient.request('/notification/mark-as-read/', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  return response;
};

/**
 * Mark specific notifications as deleted
 */
export const markNotificationsDeleted = async (ids) => {
  const response = await apiClient.request('/notification/mark-as-deleted/', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  return response;
};

export default {
    getNotifications,
    getUnreadCount,
    markNotificationsRead,
    markNotificationsDeleted,
};
