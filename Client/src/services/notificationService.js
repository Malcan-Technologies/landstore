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
      const response = await api.get('/notifications/', { params });
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
  }
};
