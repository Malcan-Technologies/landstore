import axios from 'axios';
import { showToast } from './toastStore';
import { resolveMutationToastMessages } from './mutationToastMessages';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

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
    const requestMethod = String(config?.method || '').toLowerCase();

    if (MUTATION_METHODS.has(requestMethod)) {
      config.timeout = 0;
    }

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
    const requestMethod = String(response?.config?.method || '').toLowerCase();

    if (MUTATION_METHODS.has(requestMethod)) {
      const messages = resolveMutationToastMessages(response?.config);

      if (messages?.successTitle || messages?.successMessage) {
        showToast({
          type: requestMethod === 'delete' ? 'destructive' : 'success',
          title: messages.successTitle,
          message: messages.successMessage || '',
          duration: 3500,
        });
      }
    }

    return response;
  },
  (error) => {
    const requestMethod = String(error?.config?.method || '').toLowerCase();
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

    if (MUTATION_METHODS.has(requestMethod)) {
      const messages = resolveMutationToastMessages(error?.config);

      if (messages?.errorTitle || messages?.errorMessage) {
        showToast({
          type: 'error',
          title: messages.errorTitle,
          message: messages.errorMessage || errorMessage,
          duration: 4500,
        });
      }
    }

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
    const formattedError = new Error(errorMessage);
    formattedError.response = error.response;
    formattedError.config = error.config;
    formattedError.status = error.response?.status;
    return Promise.reject(formattedError);
  }
);

export default api;
