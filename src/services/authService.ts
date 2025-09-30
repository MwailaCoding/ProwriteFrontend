/**
 * Complete Authentication Service for ProWrite
 * Handles login, registration, token management, and API calls
 */

import axios, { AxiosResponse } from 'axios';

// Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isPremium: number;
  is_admin: number;
  createdAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

class AuthService {
  private baseURL: string;
  private tokenKey: string = 'access_token';
  private userKey: string = 'user_data';
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;
  private lastRefreshAttempt: number = 0;
  private refreshCooldown: number = 5000; // 5 seconds cooldown

  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.setupAxiosInterceptors();
  }

  /**
   * Setup axios interceptors for automatic token handling
   */
  private setupAxiosInterceptors(): void {
    // Request interceptor - add token to requests
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried and not a refresh request
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const newToken = await this.refreshToken();
            if (newToken) {
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // If refresh fails, logout user
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/auth/register`,
        data
      );

      // Store token and user data
      this.setToken(response.data.access_token);
      this.setUser(response.data.user);

      return response.data;
    } catch (error: any) {
      console.error('❌ AuthService: Registration failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService: Starting login...', { email: data.email });
      
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/auth/login`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log('🔐 AuthService: Login successful:', response.data);

      // Store token and user data
      this.setToken(response.data.access_token);
      this.setUser(response.data.user);

      return response.data;
    } catch (error: any) {
      console.error('❌ AuthService: Login failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<{ user: User }> = await axios.get(
        `${this.baseURL}/auth/me`
      );
      return response.data.user;
    } catch (error: any) {
      console.error('❌ AuthService: Get current user failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    const now = Date.now();
    
    // Check cooldown period
    if (now - this.lastRefreshAttempt < this.refreshCooldown) {
      return null;
    }

    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.lastRefreshAttempt = now;
    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      console.log('🔄 AuthService: Refreshing token...');
      
      const response: AxiosResponse<{ access_token: string }> = await axios.post(
        `${this.baseURL}/auth/refresh`,
        {},
        {
          timeout: 5000, // 5 second timeout
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const newToken = response.data.access_token;
      this.setToken(newToken);
      
      console.log('🔄 AuthService: Token refreshed successfully');
      return newToken;
    } catch (error: any) {
      console.error('❌ AuthService: Token refresh failed:', error);
      // Clear invalid token
      this.clearStorage();
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await axios.post(`${this.baseURL}/auth/logout`);
    } catch (error) {
      console.error('Logout endpoint error:', error);
    } finally {
      // Clear local storage regardless of endpoint success
      this.clearStorage();
      // Reset refresh state
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.lastRefreshAttempt = 0;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set token in storage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Set user data in storage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Clear all stored data
   */
  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    // Reset refresh state
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.lastRefreshAttempt = 0;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    console.error('🔍 AuthService: Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return new Error('Network error. Please check your connection and try again.');
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }

    // Server errors
    if (error.response?.status >= 500) {
      return new Error('Server error. Please try again later.');
    }

    // Client errors
    if (error.response?.status >= 400) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message;
      if (errorMessage) {
        return new Error(errorMessage);
      }
      
      // Specific status code handling
      switch (error.response.status) {
        case 401:
          return new Error('Invalid email or password.');
        case 403:
          return new Error('Access denied. Please contact support.');
        case 404:
          return new Error('Service not found. Please try again later.');
        case 422:
          return new Error('Invalid input. Please check your information.');
        default:
          return new Error('Login failed. Please try again.');
      }
    }

    // Generic error
    return new Error(error.message || 'An unexpected error occurred. Please try again.');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    try {
      console.log('🔐 AuthService: Requesting password reset...', data);
      
      const response: AxiosResponse<{ message: string }> = await axios.post(
        `${this.baseURL}/auth/forgot-password`,
        data
      );

      console.log('🔐 AuthService: Password reset request successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthService: Password reset request failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    try {
      console.log('🔐 AuthService: Confirming password reset...');
      
      const response: AxiosResponse<{ message: string }> = await axios.post(
        `${this.baseURL}/auth/reset-password`,
        data
      );

      console.log('🔐 AuthService: Password reset confirmation successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthService: Password reset confirmation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Debug authentication state
   */
  debugAuthState(): void {
    const token = this.getToken();
    const user = this.getUser();
    
    // Debug information (production-safe)
    const debugInfo = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasUser: !!user,
      userEmail: user?.email || 'N/A',
      isAuthenticated: this.isAuthenticated()
    };
    
    console.log('Auth Debug Info:', debugInfo);
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
