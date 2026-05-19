import apiClient from './apiClient';

/**
 * Fetch notifications for the current user
 */
export const getNotifications = async (params = {}) => {
  const response = await apiClient.get('/notification/', { params });
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await apiClient.get('/notification/unread-count/');
  return response.data;
};

/**
 * Mark specific notifications as read
 */
export const markNotificationsRead = async (ids) => {
  const response = await apiClient.post('/notification/mark-as-read/', { ids });
  return response.data;
};

/**
 * Mark specific notifications as deleted
 */
export const markNotificationsDeleted = async (ids) => {
  const response = await apiClient.post('/notification/mark-as-deleted/', { ids });
  return response.data;
};

/**
 * [NEW] send_notification function for frontend
 * This triggers a server-side notification creation.
 * If the project uses a REST API for manual notifications, we call it here.
 */
export const sendNotification = async (type, title, content, data = {}) => {
  // If there's an endpoint for creating notifications (internal use), call it.
  // For now, many notifications are triggered automatically on the backend.
  // This function can be expanded to call specialized API endpoints if they exist.
  console.log(`Triggering notification: ${title} (${type})`);
  // return await apiClient.post('/notification/trigger/', { type, title, content, data });
};
