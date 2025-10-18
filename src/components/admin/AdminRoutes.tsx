import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import AdminLogin from './AdminLogin';

const AdminRoutes: React.FC = () => {
  const { adminUser, isAuthenticated, loading } = useAdminAuth();

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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p>Welcome, {adminUser.firstName}!</p>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
          <p>You are successfully logged in as an admin!</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;