import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const skipAuthRedirectOn401 = Boolean(error?.config?.skipAuthRedirectOn401);

    // Handle common errors
    if (error.response?.status === 401 && !skipAuthRedirectOn401) {
      // Unauthorized - clear stored user and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    
    // Return formatted error
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
