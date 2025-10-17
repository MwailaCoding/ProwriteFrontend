import { useState, useEffect } from 'react';
import type { AdminUser } from '../types/admin';

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    console.log('useAdminAuth - checkAuth:', { token: !!token, userStr: !!userStr });

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('useAdminAuth - parsed user:', user);
        setAdminUser(user);
        setIsAuthenticated(true);
        console.log('useAdminAuth - set authenticated');
      } catch (error) {
        console.error('Error parsing admin user:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdminUser(null);
        setIsAuthenticated(false);
      }
    } else {
      console.log('useAdminAuth - no token or user found');
      setAdminUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check auth status on every render to ensure it's up to date
  useEffect(() => {
    checkAuth();
  });

  const login = (user: AdminUser, token: string) => {
    console.log('useAdminAuth - login called with:', { user, token: !!token });
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAdminUser(user);
    setIsAuthenticated(true);
    console.log('useAdminAuth - state updated');
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