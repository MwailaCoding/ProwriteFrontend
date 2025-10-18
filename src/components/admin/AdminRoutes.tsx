import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

// Import admin pages
import DashboardPage from '../../pages/admin/DashboardPage';
import UsersPage from '../../pages/admin/UsersPage';
import DocumentsPage from '../../pages/admin/DocumentsPage';
import PaymentsPage from '../../pages/admin/PaymentsPage';
import SystemLogsPage from '../../pages/admin/SystemLogsPage';
import NotificationsPage from '../../pages/admin/NotificationsPage';
import AnalyticsPage from '../../pages/admin/AnalyticsPage';

const AdminRoutes: React.FC = () => {
  const { adminUser, isAuthenticated, loading, logout } = useAdminAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !adminUser) {
    return <AdminLogin />;
  }

  if (!adminUser.is_admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout user={adminUser} onLogout={logout}>
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