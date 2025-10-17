import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';

// Import admin pages
import DashboardPage from '../../pages/admin/DashboardPage';
import UsersPage from '../../pages/admin/UsersPage';
import DocumentsPage from '../../pages/admin/DocumentsPage';
import PaymentsPage from '../../pages/admin/PaymentsPage';
import SystemLogsPage from '../../pages/admin/SystemLogsPage';
import NotificationsPage from '../../pages/admin/NotificationsPage';
import AnalyticsPage from '../../pages/admin/AnalyticsPage';

// Import admin components
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';

const AdminRoutes: React.FC = () => {
  const { adminUser, isAuthenticated, loading, logout } = useAdminAuth();
  const location = useLocation();

  console.log('🔧 AdminRoutes - Current state:', { 
    isAuthenticated, 
    adminUser: !!adminUser, 
    loading, 
    path: location.pathname,
    isAdmin: adminUser?.is_admin 
  });

  // Show loading while checking authentication
  if (loading) {
    console.log('🔧 AdminRoutes - Showing loading...');
      return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
  // Show login page if not authenticated
  if (!isAuthenticated || !adminUser) {
    console.log('🔧 AdminRoutes - Not authenticated, showing login');
    return <AdminLogin />;
  }

  // Redirect to home if not admin
  if (!adminUser.is_admin) {
    console.log('🔧 AdminRoutes - Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('🔧 AdminRoutes - Showing admin layout');

  // Show admin dashboard
  return (
    <AdminLayout
      currentPath={location.pathname}
      user={adminUser}
      onLogout={logout}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/logs" element={<SystemLogsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;