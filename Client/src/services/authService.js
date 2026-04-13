import api from '@/utils/axios';

const getOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:3000';
};

const withOriginHeader = (config = {}) => ({
  ...config,
  headers: {
    ...(config.headers || {}),
    Origin: getOrigin(),
  },
});

const withOriginAndNo401Redirect = (config = {}) =>
  withOriginHeader({
    ...config,
    skipAuthRedirectOn401: true,
  });

// Authentication service
export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/sign-in/email', credentials, withOriginAndNo401Redirect());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register and complete profile in one request (new Postman flow)
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData, withOriginAndNo401Redirect());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Explicit alias for the same endpoint
  registerComplete: async (userData) => {
    try {
      const response = await api.post('/users/register-complete', userData, withOriginAndNo401Redirect());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete user profile (kept for compatibility with existing UI flow)
  completeProfile: async (profileData) => {
    try {
      const response = await api.post('/users/complete-profile', profileData, withOriginHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/sign-out', null, withOriginHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current session
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/get-session', withOriginHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData, withOriginHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Request password reset (Better Auth)
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/reset-password', { email }, withOriginHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword }, withOriginHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.get(
        '/auth/verify-email',
        withOriginHeader(token ? { params: { token } } : {})
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token', null, withOriginHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
