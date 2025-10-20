import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AdminUser } from '../types/admin';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: AdminUser, token: string) => void;
  logout: () => void;
  hasPermission: (role: 'super_admin' | 'admin' | 'moderator') => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize authentication state only once
  useEffect(() => {
    if (initialized) return;

    const initAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');
        
        console.log('AdminAuthProvider - init:', { token: !!token, userStr: !!userStr });

        if (token && userStr) {
          const user = JSON.parse(userStr);
          console.log('AdminAuthProvider - user found:', user);
          setAdminUser(user);
          setIsAuthenticated(true);
        } else {
          console.log('AdminAuthProvider - no auth data');
          setAdminUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('AdminAuthProvider - error:', error);
        setAdminUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [initialized]);

  const login = (user: AdminUser, token: string) => {
    console.log('AdminAuthProvider - login called with:', { user: user.email, token: !!token });
    
    // Store in localStorage
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    
    console.log('AdminAuthProvider - data stored in localStorage');
    
    // Update state immediately
    setAdminUser(user);
    setIsAuthenticated(true);
    setLoading(false);
    
    console.log('AdminAuthProvider - state updated:', { 
      adminUser: !!user, 
      isAuthenticated: true,
      userEmail: user.email 
    });
  };

  const logout = () => {
    console.log('AdminAuthProvider - logout called');
    
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

  const value: AdminAuthContextType = {
    adminUser,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission
  };

  console.log('AdminAuthProvider - rendering with state:', {
    adminUser: !!adminUser,
    isAuthenticated,
    loading,
    userEmail: adminUser?.email,
    initialized
  });

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};