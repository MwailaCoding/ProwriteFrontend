import { useState, useEffect } from 'react';
import type { AdminUser } from '../types/admin';

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('adminToken');
      const userStr = localStorage.getItem('adminUser');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setAdminUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing admin user:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (user: AdminUser, token: string) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAdminUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    setIsAuthenticated(false);
    window.location.href = '/admin/login';
  };

  return {
    adminUser,
    isAuthenticated,
    loading,
    login,
    logout
  };
};