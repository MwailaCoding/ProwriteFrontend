/**
 * Admin API Service
 * Separate API instance for admin requests with admin token
 */

import axios from 'axios';

// Create admin-specific axios instance
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add admin auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Admin token expired or invalid, redirect to admin login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
