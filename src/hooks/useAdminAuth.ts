import { useState, useEffect } from 'react';
import type { AdminUser } from '../types/admin';

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setAdminUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse admin user:', error);
        logout();
      }
    } else {
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  };

  const login = (user: AdminUser, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
    }
    setAdminUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Redirect to admin login
      window.location.href = '/admin/login';
    }
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (requiredRole: 'super_admin' | 'admin' | 'moderator') => {
    if (!adminUser) return false;
    
    // For now, if user is admin, they have all permissions
    return adminUser.is_admin;
  };

  return {
    adminUser,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    checkAuthStatus
  };
};
