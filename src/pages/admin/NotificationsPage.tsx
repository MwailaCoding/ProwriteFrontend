/**
 * Notifications Page
 * Communication management with email composer
 */

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import type { Notification, NotificationsResponse, NotificationForm } from '../../types/admin';
import DataTable from '../../components/admin/DataTable';
import EmailComposerModal from '../../components/admin/EmailComposerModal';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total: 0,
    pages: 0
  });
  
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: NotificationsResponse = await adminService.getNotifications();
      setNotifications(response.notifications);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (notification: NotificationForm) => {
    try {
      await adminService.sendNotification(notification);
      setShowComposer(false);
      loadNotifications(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'recipientEmail',
      label: 'Recipient',
      render: (value: string) => (
        <div className="flex items-center">
          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <div className="flex items-center">
          {getStatusIcon(value)}
          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value.toUpperCase()}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-900">
          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div>{new Date(value).toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">
              {new Date(value).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'sentAt',
      label: 'Sent At',
      render: (value: string | undefined) => (
        <div className="text-sm text-gray-900">
          {value ? (
            <div>
              <div>{new Date(value).toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">
                {new Date(value).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">Not sent</span>
          )}
        </div>
      )
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (value: string | undefined) => (
        <span className="text-sm text-gray-900">{value || 'System'}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send emails and manage notifications
          </p>
        </div>
        <button
          onClick={() => setShowComposer(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Send Notification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sent</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {notifications.filter(n => n.status === 'sent').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {notifications.filter(n => n.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {notifications.filter(n => n.status === 'failed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{pagination.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Notifications Table */}
      <DataTable
        data={notifications}
        columns={columns}
        pagination={pagination}
        loading={loading}
      />

      {/* Email Composer Modal */}
      {showComposer && (
        <EmailComposerModal
          isOpen={showComposer}
          onClose={() => setShowComposer(false)}
          onSend={handleSendNotification}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
