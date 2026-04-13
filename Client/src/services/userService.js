import api from '@/utils/axios';

// User management service
export const userService = {
  // Get complete user profile (authenticated user)
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

  // Upload user profile picture
  uploadProfilePicture: async (id, formData) => {
    try {
      const response = await api.post(`/users/${id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's saved lands
  getSavedLands: async (userId, params = {}) => {
    try {
      const response = await api.get(`/users/${userId}/saved-lands`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save/unsave land
  toggleSaveLand: async (userId, landId) => {
    try {
      const response = await api.post(`/users/${userId}/save-land`, { landId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's favorite lands
  getFavoriteLands: async (userId, params = {}) => {
    try {
      const response = await api.get(`/users/${userId}/favorites`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add/remove favorite land
  toggleFavoriteLand: async (userId, landId) => {
    try {
      const response = await api.post(`/users/${userId}/favorite-land`, { landId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's search history
  getSearchHistory: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/search-history`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear search history
  clearSearchHistory: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/search-history`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user notifications
  getNotifications: async (userId, params = {}) => {
    try {
      const response = await api.get(`/users/${userId}/notifications`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark notification as read
  markNotificationRead: async (userId, notificationId) => {
    try {
      const response = await api.put(`/users/${userId}/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete (or deactivate) user account — server expects PATCH per Postman
  deleteAccount: async (id, data = {}) => {
    try {
      const response = await api.patch(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
