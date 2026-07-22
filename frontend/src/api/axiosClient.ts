import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Ensure the base URL always ends with /api/v1 regardless of how VITE_API_BASE_URL is set.
// e.g. "https://salon-website-o8qe.onrender.com" → "https://salon-website-o8qe.onrender.com/api/v1"
function resolveBaseUrl(): string {
  // In production, force relative URL to use the Vercel rewrite proxy.
  // This prevents third-party cookie blocking issues from cross-origin requests.
  if (import.meta.env.PROD) {
    return '/api/v1';
  }

  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!raw) return '/api/v1';
  const trimmed = raw.replace(/\/$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

const BASE_URL = resolveBaseUrl();

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Avoid duplicate /api/v1/api/v1 in requests when components hardcode the prefix
axiosClient.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('/api/v1/')) {
      config.url = config.url.substring(7); // Removes '/api/v1' and leaves the leading '/'
    } else if (config.url === '/api/v1') {
      config.url = '/';
    }
  }
  return config;
});

// We rely on withCredentials: true to send the HttpOnly cookies for JWT automatically.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not attempt to refresh if the failure was on the login endpoint itself
      if (originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.status === 200) {
          const { role, branchId, staffId, customerId } = response.data;
          useAuthStore.getState().setAuth(role, branchId || null, { staffId, customerId });
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
