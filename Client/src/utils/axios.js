import axios from 'axios';
import { showToast } from './toastStore';
import { resolveMutationToastMessages } from './mutationToastMessages';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);
const DEDUPABLE_POST_PATHS = new Set(['/list-lands/search/by-radius']);
const MAX_GET_TIMEOUT_ATTEMPTS = 3;

const inflightRequests = new Map();

const stableStringify = (value) => {
  if (value === undefined) {
    return '';
  }

  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const sortedKeys = Object.keys(value).sort();
  return `{${sortedKeys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
};

const isDedupableRequest = (config) => {
  const method = String(config?.method || 'get').toLowerCase();
  const url = String(config?.url || '');

  if (method === 'get' || method === 'head') {
    return true;
  }

  return method === 'post' && DEDUPABLE_POST_PATHS.has(url);
};

const buildRequestKey = (config) => {
  if (!isDedupableRequest(config)) {
    return null;
  }

  if (typeof FormData !== 'undefined' && config?.data instanceof FormData) {
    return null;
  }

  return [
    String(config?.method || 'get').toLowerCase(),
    String(config?.url || ''),
    stableStringify(config?.params ?? null),
    stableStringify(config?.data ?? null),
  ].join('|');
};

const isTimeoutError = (error) => {
  if (!error) {
    return false;
  }

  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === 'ECONNABORTED' &&
    !error?.response &&
    (message.includes('timeout') || message.includes('exceeded'))
  );
};

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const originalRequest = api.request.bind(api);

api.request = function requestWithDedup(config) {
  const requestKey = buildRequestKey(config);

  if (!requestKey) {
    return originalRequest(config);
  }

  const pendingRequest = inflightRequests.get(requestKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  const requestPromise = originalRequest(config).finally(() => {
    if (inflightRequests.get(requestKey) === requestPromise) {
      inflightRequests.delete(requestKey);
    }
  });

  inflightRequests.set(requestKey, requestPromise);
  return requestPromise;
};

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

    if (requestMethod === 'get' && isTimeoutError(error)) {
      const retryCount = Number(error?.config?.__timeoutRetryCount || 0);

      if (retryCount < MAX_GET_TIMEOUT_ATTEMPTS - 1) {
        const nextConfig = {
          ...error.config,
          __timeoutRetryCount: retryCount + 1,
          timeout: error.config?.timeout ?? api.defaults.timeout,
        };

        return api.request(nextConfig);
      }
    }

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
