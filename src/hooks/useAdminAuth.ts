import { useState, useEffect } from 'react';
import type { AdminUser } from '../types/admin';

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');
        
        console.log('useAdminAuth - initialize:', { token: !!token, userStr: !!userStr });

        if (token && userStr) {
          const user = JSON.parse(userStr);
          console.log('useAdminAuth - user found:', user);
          setAdminUser(user);
          setIsAuthenticated(true);
        } else {
          console.log('useAdminAuth - no auth data found');
          setAdminUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('useAdminAuth - error initializing:', error);
        setAdminUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Only run once on mount

  const login = (user: AdminUser, token: string) => {
    console.log('useAdminAuth - login called');
    
    // Store in localStorage
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    
    // Update state
    setAdminUser(user);
    setIsAuthenticated(true);
    
    console.log('useAdminAuth - login complete');
  };

  const logout = () => {
    console.log('useAdminAuth - logout called');
    
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Update state
    setAdminUser(null);
    setIsAuthenticated(false);
    
    // Redirect
    window.location.href = '/admin/login';
  };

  const hasPermission = (requiredRole: 'super_admin' | 'admin' | 'moderator') => {
    if (!adminUser) return false;
    return adminUser.is_admin;
  };

  return {
    adminUser,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission
  };
};