/**
 * Admin Routes Component
 * Routing configuration for admin interface
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';

// Import admin pages
import DashboardPage from '../../pages/admin/DashboardPage';
import UsersPage from '../../pages/admin/UsersPage';
import DocumentsPage from '../../pages/admin/DocumentsPage';
import PaymentsPage from '../../pages/admin/PaymentsPage';
import SystemLogsPage from '../../pages/admin/SystemLogsPage';
import NotificationsPage from '../../pages/admin/NotificationsPage';
import AnalyticsPage from '../../pages/admin/AnalyticsPage';

// Import admin layout
import AdminLayout from './AdminLayout';

const AdminRoutes: React.FC = () => {
  const { adminUser, isAuthenticated, loading } = useAdminAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to home if not admin
  if (!adminUser?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout
      currentPath={window.location.pathname}
      user={adminUser}
      onLogout={() => {
        // Handle logout logic here
        console.log('Logout clicked');
      }}
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
