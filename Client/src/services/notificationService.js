import api from '@/utils/axios';

// Notification service
export const notificationService = {
  // Create notification
  createNotification: async (data) => {
    try {
      const response = await api.post('/notifications/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update notification
  updateNotification: async (id, data) => {
    try {
      const response = await api.patch(`/notifications/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (params = {}) => {
    try {
      const { userId, ...queryParams } = params || {};
      const response = await api.get('/notifications/', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get notification by ID
  getNotificationById: async (id) => {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/mark-as-read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const response = await api.patch(`/notifications/user/${userId}/mark-all-as-read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const response = await api.get(`/notifications/user/${userId}/unread-count`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
