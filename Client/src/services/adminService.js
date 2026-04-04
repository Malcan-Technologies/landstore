import api from '@/utils/axios';

// Admin service
export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user status (active/inactive)
  updateUserStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all land listings
  getAllLands: async (params = {}) => {
    try {
      const response = await api.get('/admin/lands', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update land status (active/inactive/featured)
  updateLandStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/lands/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete land listing
  deleteLand: async (id) => {
    try {
      const response = await api.delete(`/admin/lands/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all contact messages
  getAllContactMessages: async (params = {}) => {
    try {
      const response = await api.get('/admin/contact-messages', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark contact message as read
  markContactMessageRead: async (id) => {
    try {
      const response = await api.put(`/admin/contact-messages/${id}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete contact message
  deleteContactMessage: async (id) => {
    try {
      const response = await api.delete(`/admin/contact-messages/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system logs
  getSystemLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/logs', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get analytics data
  getAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/admin/analytics', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
