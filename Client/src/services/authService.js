import api from '@/utils/axios';

// Authentication service
export const authService = {
  // Login user (Better Auth)
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/sign-in/email', credentials, {
        headers: {
          origin: 'http://localhost:3000',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register new user (Better Auth signup)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/sign-up/email', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete user profile with business information
  completeProfile: async (profileData) => {
    try {
      const response = await api.post('/users/complete-profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user (Better Auth)
  logout: async () => {
    try {
      await api.post('/auth/sign-out');
    } catch (error) {
      // Even if API call fails, we should clear local storage
      console.error('Logout API call failed:', error);
    }
  },

  // Get current session (Better Auth)
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/get-session');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Request password reset (Better Auth)
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/reset-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify email (uses query param per Postman)
  verifyEmail: async (token) => {
    try {
      const response = await api.get('/auth/verify-email', { params: { token } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
