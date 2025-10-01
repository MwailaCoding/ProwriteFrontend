/**
 * API Configuration - Complete Rewrite
 * Axios instance with proper interceptors and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, {
      message: error.message,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/auth/refresh`, 
          {}, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        const newToken = refreshResponse.data.access_token;
        localStorage.setItem('access_token', newToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        console.log('🔄 Token refreshed, retrying request...');
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear auth data and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      console.error('🚨 Server Error:', error.response.data);
    } else if (error.response?.status >= 400) {
      console.error('⚠️ Client Error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Export default instance
export default api;

// Export named instance for compatibility
export { api };
