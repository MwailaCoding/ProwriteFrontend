import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

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

  console.log('AdminRoutes - render:', { 
    isAuthenticated, 
    adminUser: !!adminUser, 
    loading, 
    path: location.pathname 
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated || !adminUser) {
    console.log('AdminRoutes - showing login page');
    return <AdminLogin />;
  }

  // If user is not admin, redirect to home
  if (!adminUser.is_admin) {
    console.log('AdminRoutes - user is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is admin - show admin layout
  console.log('AdminRoutes - showing admin layout');
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