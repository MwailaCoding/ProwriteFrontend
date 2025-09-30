import { useState, useEffect } from 'react';

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  is_admin: boolean;
}

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
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
    
    // Redirect to admin login
    window.location.href = '/admin/login';
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
