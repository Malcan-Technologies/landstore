import api from '@/utils/axios';

// Authentication service
export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials, {
        skipAuthRedirectOn401: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register and complete profile in one request (new Postman flow)
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData, {
        skipAuthRedirectOn401: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Explicit alias for the same endpoint
  registerComplete: async (userData) => {
    try {
      const response = await api.post('/users/register-complete', userData, {
        skipAuthRedirectOn401: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete user profile (kept for compatibility with existing UI flow)
  completeProfile: async (profileData) => {
    try {
      const response = await api.post('/users/complete-profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/sign-out', null);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current session
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/get-session');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get my profile
  myProfile: async () => {
    try {
      const response = await api.get('/users/my-profile');
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

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/users/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.get('/auth/verify-email', token ? { params: { token } } : {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token', null);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
