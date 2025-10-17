/**
 * Quick Actions Component
 * Provides quick access to common admin actions
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const QuickActions: React.FC = () => {
  const actions = [
    {
      name: 'Send Notification',
      description: 'Send email to users',
      icon: <EnvelopeIcon className="h-6 w-6" />,
      href: '/admin/notifications',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      name: 'Export Data',
      description: 'Export users or payments',
      icon: <DocumentArrowDownIcon className="h-6 w-6" />,
      href: '/admin/analytics',
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      name: 'View Analytics',
      description: 'Check system metrics',
      icon: <ChartBarIcon className="h-6 w-6" />,
      href: '/admin/analytics',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    {
      name: 'Manage Users',
      description: 'View and edit users',
      icon: <UserGroupIcon className="h-6 w-6" />,
      href: '/admin/users',
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {actions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className={`flex items-center p-3 rounded-lg border border-transparent transition-colors ${action.color}`}
            >
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{action.name}</p>
                <p className="text-xs opacity-75">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">System Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Database</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Email Service</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Gateway</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
