import api from '@/utils/axios';

// User management service
export const userService = {
  // Get complete authenticated profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/users/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile (PATCH per Postman)
  updateUserProfile: async (id, profileData) => {
    try {
      const response = await api.patch(`/users/${id}`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete/deactivate user account (Postman currently defines PATCH)
  deleteAccount: async (id, data = {}) => {
    try {
      const response = await api.patch(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Hard delete user (matches current server route)
  hardDeleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete profile endpoint from Postman
  completeProfile: async (profileData) => {
    try {
      const response = await api.post('/users/complete-profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Folder endpoints (Short List Folders group)
  createFolder: async (data) => {
    try {
      const response = await api.post('/folders/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFolders: async (params = {}) => {
    try {
      const response = await api.get('/folders/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFolderById: async (id) => {
    try {
      const response = await api.get(`/folders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  renameFolder: async (id, data) => {
    try {
      const response = await api.patch(`/folders/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteFolder: async (id) => {
    try {
      const response = await api.delete(`/folders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addToFolder: async (id, propertyId) => {
    try {
      const response = await api.post(`/folders/${id}/shortlist`, { propertyId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeFromFolder: async (id, propertyId) => {
    try {
      const response = await api.delete(`/folders/${id}/shortlist/${propertyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkShortlisted: async (id, propertyId) => {
    try {
      const response = await api.get(`/folders/${id}/shortlist/${propertyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Notification endpoints
  createNotification: async (data) => {
    try {
      const response = await api.post('/notifications/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getNotifications: async (userIdOrParams = {}, params = {}) => {
    try {
      if (typeof userIdOrParams === 'string') {
        const response = await api.get(`/notifications/user/${userIdOrParams}`, { params });
        return response.data;
      }

      const response = await api.get('/notifications/', { params: userIdOrParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getNotificationById: async (id) => {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateNotification: async (id, data) => {
    try {
      const response = await api.patch(`/notifications/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markNotificationRead: async (userIdOrNotificationId, maybeNotificationId) => {
    try {
      const notificationId = maybeNotificationId || userIdOrNotificationId;
      const response = await api.patch(`/notifications/${notificationId}/mark-as-read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAllNotificationsRead: async (userId) => {
    try {
      const response = await api.patch(`/notifications/user/${userId}/mark-all-as-read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAllNotificationsByUserId: async (userId) => {
    try {
      const response = await api.delete(`/notifications/user/${userId}/all`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUnreadNotificationCount: async (userId) => {
    try {
      const response = await api.get(`/notifications/user/${userId}/unread-count`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
