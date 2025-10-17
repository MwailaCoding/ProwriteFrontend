/**
 * Admin Sidebar Component
 * Navigation sidebar for admin interface
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { NavItem } from '../../types/admin';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      path: '/admin/dashboard'
    },
    {
      id: 'users',
      label: 'Users',
      icon: <UsersIcon className="h-5 w-5" />,
      path: '/admin/users'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <DocumentTextIcon className="h-5 w-5" />,
      path: '/admin/documents'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCardIcon className="h-5 w-5" />,
      path: '/admin/payments'
    },
    {
      id: 'logs',
      label: 'System Logs',
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      path: '/admin/logs'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <BellIcon className="h-5 w-5" />,
      path: '/admin/notifications'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <ChartBarIcon className="h-5 w-5" />,
      path: '/admin/analytics'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">ProWrite Admin</h1>
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={onClose}
              >
                <span className={`mr-3 ${
                  isActive(item.path) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              ProWrite Admin Panel v2.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
