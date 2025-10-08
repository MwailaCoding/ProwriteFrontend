import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  CogIcon, 
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ArchiveBoxIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/admin',
      description: 'Overview and analytics'
    },
    {
      name: 'User Management',
      icon: UsersIcon,
      path: '/admin/users',
      description: 'Manage user accounts'
    },
    {
      name: 'Templates',
      icon: DocumentTextIcon,
      path: '/admin/templates',
      description: 'Template management'
    },
    {
      name: 'PDF Templates',
      icon: DocumentDuplicateIcon,
      path: '/admin/pdf-templates',
      description: 'PDF template management'
    },
    {
      name: 'AI Processor',
      icon: CogIcon,
      path: '/admin/ai-processor',
      description: 'AI-powered content area processing'
    },
    {
      name: 'Upload Template',
      icon: ArrowUpTrayIcon,
      path: '/admin/upload-template',
      description: 'Upload new PDF templates'
    },
    {
      name: 'Template Test',
      icon: DocumentTextIcon,
      path: '/admin/template-test',
      description: 'Test template data loading'
    },
    {
      name: 'Content Moderation',
      icon: ShieldCheckIcon,
      path: '/admin/moderation',
      description: 'AI content review'
    },
    {
      name: 'Market Data',
      icon: ChartBarIcon,
      path: '/admin/market-data',
      description: 'Skill demand analytics'
    },
    {
      name: 'Payments',
      icon: CurrencyDollarIcon,
      path: '/admin/payments',
      description: 'Payment tracking'
    },
    {
      name: 'AI Metrics',
      icon: EyeIcon,
      path: '/admin/ai-metrics',
      description: 'AI performance data'
    },
    {
      name: 'System Config',
      icon: CogIcon,
      path: '/admin/config',
      description: 'System settings'
    },
    {
      name: 'Audit Logs',
      icon: ArchiveBoxIcon,
      path: '/admin/audit',
      description: 'Activity tracking'
    }
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {collapsed ? (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-800">ProWrite</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={collapsed ? item.description : undefined}
                >
                  <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="absolute bottom-4 left-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
              collapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
