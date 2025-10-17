import { useState, useEffect } from 'react';
import type { AdminUser } from '../types/admin';

// Global state to prevent reset between components
let globalAdminUser: AdminUser | null = null;
let globalIsAuthenticated = false;

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(globalAdminUser);
  const [isAuthenticated, setIsAuthenticated] = useState(globalIsAuthenticated);
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
        
        // Update global state
        globalAdminUser = user;
        globalIsAuthenticated = true;
        
        // Update local state
        setAdminUser(user);
        setIsAuthenticated(true);
        console.log('useAdminAuth - set authenticated');
      } catch (error) {
        console.error('Error parsing admin user:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        // Update global state
        globalAdminUser = null;
        globalIsAuthenticated = false;
        
        // Update local state
        setAdminUser(null);
        setIsAuthenticated(false);
      }
    } else {
      console.log('useAdminAuth - no token or user found');
      
      // Update global state
      globalAdminUser = null;
      globalIsAuthenticated = false;
      
      // Update local state
      setAdminUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = (user: AdminUser, token: string) => {
    console.log('useAdminAuth - login called with:', { user, token: !!token });
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    
    // Update global state
    globalAdminUser = user;
    globalIsAuthenticated = true;
    
    // Update local state
    setAdminUser(user);
    setIsAuthenticated(true);
    console.log('useAdminAuth - state updated');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Update global state
    globalAdminUser = null;
    globalIsAuthenticated = false;
    
    // Update local state
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