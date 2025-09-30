/**
 * Advanced Notification Bell Component
 * Real-time notifications with dropdown, animations, and comprehensive features
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  X, 
  MoreVertical, 
  Filter, 
  Archive, 
  Trash2,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';
import { 
  notificationService, 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationStatus 
} from '../../services/notificationService';

interface NotificationBellProps {
  userId: number;
  className?: string;
  showCount?: boolean;
  maxNotifications?: number;
  autoMarkAsRead?: boolean;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  className = '',
  showCount = true,
  maxNotifications = 10,
  autoMarkAsRead = false,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<NotificationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [isConnected, setIsConnected] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Load notifications on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadNotifications();
      connectWebSocket();
    }
    return () => {
      notificationService.disconnectWebSocket();
    };
  }, [userId]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event listeners for polling-based updates
  useEffect(() => {
    const handleUnreadCountUpdate = (count: number) => {
      setUnreadCount(count);
    };

    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    notificationService.on('unread_count_update', handleUnreadCountUpdate);
    notificationService.on('connected', handleConnected);
    notificationService.on('disconnected', handleDisconnected);

    return () => {
      notificationService.off('unread_count_update', handleUnreadCountUpdate);
      notificationService.off('connected', handleConnected);
      notificationService.off('disconnected', handleDisconnected);
    };
  }, []);

  const connectWebSocket = () => {
    notificationService.connectWebSocket(userId);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications({ limit: maxNotifications }),
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === NotificationStatus.UNREAD) {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, status: NotificationStatus.READ, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: NotificationStatus.READ, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const success = await notificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleRefresh = () => {
    loadNotifications();
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.status === filter
  );

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = {
        [NotificationPriority.URGENT]: 4,
        [NotificationPriority.HIGH]: 3,
        [NotificationPriority.MEDIUM]: 2,
        [NotificationPriority.LOW]: 1
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case NotificationPriority.HIGH:
        return <Zap className="w-4 h-4 text-orange-500" />;
      case NotificationPriority.MEDIUM:
        return <Info className="w-4 h-4 text-blue-500" />;
      case NotificationPriority.LOW:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    const iconMap = {
      [NotificationType.SYSTEM]: 'settings',
      [NotificationType.PAYMENT]: 'credit-card',
      [NotificationType.AI_ENHANCEMENT]: 'brain',
      [NotificationType.COLLABORATION]: 'users',
      [NotificationType.SECURITY]: 'shield',
      [NotificationType.TEMPLATE]: 'file-text',
      [NotificationType.RESUME]: 'file-user',
      [NotificationType.COVER_LETTER]: 'mail',
      [NotificationType.MARKET_INSIGHTS]: 'trending-up',
      [NotificationType.REMINDER]: 'clock',
      [NotificationType.ACHIEVEMENT]: 'trophy',
      [NotificationType.WELCOME]: 'welcome',
      [NotificationType.UPDATES]: 'download',
      [NotificationType.MAINTENANCE]: 'wrench'
    };
    return iconMap[type] || 'bell';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <motion.button
        ref={bellRef}
        onClick={handleBellClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        
        {/* Unread Count Badge */}
        {showCount && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
        
        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="mt-3 flex items-center space-x-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as NotificationStatus | 'all')}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value={NotificationStatus.UNREAD}>Unread</option>
                  <option value={NotificationStatus.READ}>Read</option>
                  <option value={NotificationStatus.ARCHIVED}>Archived</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="date">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading notifications...
                </div>
              ) : sortedNotifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No notifications found
                </div>
              ) : (
                <AnimatePresence>
                  {sortedNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                        notification.status === NotificationStatus.UNREAD ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Notification Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.color ? '' : 'bg-gray-100'
                        }`} style={{ backgroundColor: notification.color + '20' }}>
                          {getPriorityIcon(notification.priority)}
                        </div>
                        
                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              notification.status === NotificationStatus.UNREAD ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {notification.status === NotificationStatus.UNREAD && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="p-1 rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {notificationService.formatTime(notification.created_at)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              {notification.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
