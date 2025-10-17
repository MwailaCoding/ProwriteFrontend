/**
 * Admin Layout Component
 * Modern sidebar layout with navigation and user profile
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import type { AdminLayoutProps, NavItem } from '../../types/admin';

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  currentPath, 
  user, 
  onLogout 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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

  const NavLink: React.FC<{ item: NavItem }> = ({ item }) => (
    <Link
      to={item.path}
      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive(item.path)
          ? 'bg-blue-100 text-blue-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
      onClick={() => setSidebarOpen(false)}
    >
      <span className={`mr-3 ${isActive(item.path) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-gray-900">ProWrite Admin</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <NavLink key={item.id} item={item} />
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900">ProWrite Admin</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <NavLink key={item.id} item={item} />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.path === currentPath)?.label || 'Admin Panel'}
              </h2>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* User menu */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center space-x-3">
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-700">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                </div>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
