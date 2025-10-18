import React, { useState, useEffect } from 'react';
import { 
  BellIcon,
  EnvelopeIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  userId?: number;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });

  useEffect(() => {
    // Simulate loading notifications
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          title: 'New User Registration',
          message: 'A new user john@example.com has registered for premium access.',
          type: 'info',
          isRead: false,
          createdAt: '2025-01-18T10:30:00Z',
          userId: 1
        },
        {
          id: 2,
          title: 'Payment Received',
          message: 'Payment of $25.00 has been successfully processed for user jane@example.com.',
          type: 'success',
          isRead: true,
          createdAt: '2025-01-18T09:15:00Z',
          userId: 2
        },
        {
          id: 3,
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM.',
          type: 'warning',
          isRead: false,
          createdAt: '2025-01-17T16:45:00Z'
        },
        {
          id: 4,
          title: 'Failed Payment',
          message: 'Payment attempt failed for user admin@example.com. Please investigate.',
          type: 'error',
          isRead: true,
          createdAt: '2025-01-17T14:20:00Z',
          userId: 3
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleSendNotification = () => {
    if (newNotification.title && newNotification.message) {
      const notification: Notification = {
        id: Date.now(),
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications([notification, ...notifications]);
      setNewNotification({ title: '', message: '', type: 'info' });
      setShowCompose(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system notifications and alerts
          </p>
        </div>
        <div className="flex space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Notification</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notification message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendNotification}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <li key={notification.id} className={notification.isRead ? 'bg-gray-50' : 'bg-white'}>
              <div className="px-4 py-4 flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <BellIcon className={`h-5 w-5 ${notification.isRead ? 'text-gray-400' : 'text-blue-500'}`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      {!notification.isRead && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Mark as read"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            No notifications found.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;