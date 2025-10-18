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

  // Initialize authentication state
  useEffect(() => {
    const initAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
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
      }
    };

    initAuth();
  }, []);

  const login = (user: AdminUser, token: string) => {
    console.log('AdminAuthProvider - login called');
    
    // Store in localStorage
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    
    // Update state
    setAdminUser(user);
    setIsAuthenticated(true);
    
    console.log('AdminAuthProvider - login complete, state:', { user: !!user, authenticated: true });
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

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
