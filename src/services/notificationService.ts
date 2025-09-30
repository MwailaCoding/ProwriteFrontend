/**
 * Advanced Notification Service for ProWrite
 * Handles real-time notifications, WebSocket connections, and notification management
 */

import api from '../config/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  created_at: string;
  read_at?: string;
  archived_at?: string;
  data?: any;
  action_url?: string;
  expires_at?: string;
  category?: string;
  icon?: string;
  color?: string;
}

export enum NotificationType {
  SYSTEM = 'system',
  PAYMENT = 'payment',
  AI_ENHANCEMENT = 'ai_enhancement',
  COLLABORATION = 'collaboration',
  SECURITY = 'security',
  TEMPLATE = 'template',
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  MARKET_INSIGHTS = 'market_insights',
  REMINDER = 'reminder',
  ACHIEVEMENT = 'achievement',
  WELCOME = 'welcome',
  UPDATES = 'updates',
  MAINTENANCE = 'maintenance'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  marketing_enabled: boolean;
  security_enabled: boolean;
  updates_enabled: boolean;
  reminders_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

export interface WebSocketMessage {
  type: 'notification' | 'unread_count' | 'pong';
  data: any;
}

class NotificationService {
  private listeners: Map<string, Function[]> = new Map();
  private userId: number | null = null;
  private pollingInterval: number | null = null;
  private isPolling = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for page visibility changes to start/stop polling
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.userId && !this.isPolling) {
        this.startPolling(this.userId);
      } else if (document.visibilityState === 'hidden' && this.isPolling) {
        this.stopPolling();
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      if (this.userId && !this.isPolling) {
        this.startPolling(this.userId);
      }
    });

    window.addEventListener('offline', () => {
      this.stopPolling();
    });
  }

  /**
   * Start polling for notifications (simplified version without WebSocket)
   */
  startPolling(userId: number): void {
    if (this.isPolling) return;
    
    this.userId = userId;
    this.isPolling = true;
    
    // Poll for notifications every 30 seconds
    this.pollingInterval = window.setInterval(async () => {
      try {
        const unreadCount = await this.getUnreadCount();
        this.emit('unread_count_update', unreadCount);
      } catch (error) {
        console.error('Error polling for notifications:', error);
      }
    }, 30000);
    
    console.log('Started polling for notifications');
  }

  /**
   * Stop polling for notifications
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('Stopped polling for notifications');
  }

  /**
   * Connect to WebSocket for real-time notifications (placeholder for future)
   */
  connectWebSocket(userId: number): void {
    // For now, just start polling instead of WebSocket
    this.startPolling(userId);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnectWebSocket(): void {
    this.stopPolling();
  }

  /**
   * Event listener system
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Get notifications for the current user
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await api.get(`/notifications?${params.toString()}`);
      return response.data.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.unread_count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data.success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return response.data.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Create a new notification (for testing)
   */
  async createNotification(notification: Partial<Notification>): Promise<Notification | null> {
    try {
      const response = await api.post('/notifications/create', notification);
      return response.data.notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data.preferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return {
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
        marketing_enabled: true,
        security_enabled: true,
        updates_enabled: true,
        reminders_enabled: true,
        timezone: 'UTC'
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data.success;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Test notification creation
   */
  async testNotification(type: string): Promise<boolean> {
    try {
      const response = await api.post('/notifications/test', { type });
      return response.data.success;
    } catch (error) {
      console.error('Error creating test notification:', error);
      return false;
    }
  }

  /**
   * Get notification templates
   */
  async getTemplates(): Promise<Record<string, any>> {
    try {
      const response = await api.get('/notifications/templates');
      return response.data.templates;
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      return {};
    }
  }

  /**
   * Format notification time
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: NotificationType): string {
    const iconMap: Record<NotificationType, string> = {
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
  }

  /**
   * Get notification color based on priority
   */
  getNotificationColor(priority: NotificationPriority): string {
    const colorMap: Record<NotificationPriority, string> = {
      [NotificationPriority.LOW]: '#6B7280',
      [NotificationPriority.MEDIUM]: '#3B82F6',
      [NotificationPriority.HIGH]: '#F59E0B',
      [NotificationPriority.URGENT]: '#EF4444'
    };
    return colorMap[priority] || '#3B82F6';
  }

  /**
   * Check if notification is expired
   */
  isExpired(notification: Notification): boolean {
    if (!notification.expires_at) return false;
    return new Date(notification.expires_at) < new Date();
  }

  /**
   * Filter notifications by category
   */
  filterByCategory(notifications: Notification[], category: string): Notification[] {
    return notifications.filter(notification => 
      notification.category === category || 
      notification.type === category
    );
  }

  /**
   * Sort notifications by priority and date
   */
  sortNotifications(notifications: Notification[]): Notification[] {
    const priorityOrder = {
      [NotificationPriority.URGENT]: 4,
      [NotificationPriority.HIGH]: 3,
      [NotificationPriority.MEDIUM]: 2,
      [NotificationPriority.LOW]: 1
    };

    return notifications.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
