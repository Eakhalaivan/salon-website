import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Strip duplicate /api/v1 if it exists in the url
axiosClient.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/api/v1')) {
    config.url = config.url.replace('/api/v1', '');
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
          `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
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
