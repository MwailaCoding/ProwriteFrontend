/**
 * Admin Service Layer
 * Comprehensive API service for admin functionality
 */

import adminApi from './adminApi';
import type {
  AdminUser,
  Document,
  Payment,
  SystemLog,
  AdminActivityLog,
  Notification,
  AnalyticsStats,
  DashboardStats,
  UsersResponse,
  DocumentsResponse,
  PaymentsResponse,
  SystemLogsResponse,
  AuditLogsResponse,
  NotificationsResponse,
  UserFilters,
  DocumentFilters,
  PaymentFilters,
  LogFilters,
  AuditFilters,
  UserUpdateForm,
  PaymentApprovalForm,
  NotificationForm,
  ExportOptions,
  ExportResponse,
  ApiError
} from '../types/admin';

class AdminService {
  private baseUrl = '/api/admin';

  // User Management
  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.filter) params.append('filter', filters.filter);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());

      const response = await adminApi.get(`${this.baseUrl}/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserDetails(userId: number): Promise<AdminUser> {
    try {
      const response = await adminApi.get(`${this.baseUrl}/users/${userId}`);
      return response.data.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(userId: number, updates: UserUpdateForm): Promise<void> {
    try {
      await adminApi.put(`${this.baseUrl}/users/${userId}`, updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await adminApi.delete(`${this.baseUrl}/users/${userId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserDocuments(userId: number, page: number = 1, perPage: number = 20): Promise<DocumentsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });

      const response = await adminApi.get(`${this.baseUrl}/users/${userId}/documents?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Document Management
  async getDocuments(filters: DocumentFilters = {}): Promise<DocumentsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());

      const response = await adminApi.get(`${this.baseUrl}/documents?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async downloadDocument(reference: string): Promise<Blob> {
    try {
      const response = await adminApi.get(`${this.baseUrl}/documents/${reference}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Payment Management
  async getPayments(filters: PaymentFilters = {}): Promise<PaymentsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());

      const response = await adminApi.get(`${this.baseUrl}/payments?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approvePayment(paymentId: number, approval: PaymentApprovalForm): Promise<void> {
    try {
      await adminApi.put(`${this.baseUrl}/payments/${paymentId}/approve`, approval);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentDocument(paymentId: number): Promise<Document> {
    try {
      const response = await adminApi.get(`${this.baseUrl}/payments/${paymentId}/document`);
      return response.data.document;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Logs
  async getSystemLogs(filters: LogFilters = {}): Promise<SystemLogsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.level) params.append('level', filters.level);
      if (filters.module) params.append('module', filters.module);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());

      const response = await adminApi.get(`${this.baseUrl}/system/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAuditTrail(filters: AuditFilters = {}): Promise<AuditLogsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.admin_id) params.append('admin_id', filters.admin_id);
      if (filters.action) params.append('action', filters.action);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());

      const response = await adminApi.get(`${this.baseUrl}/system/audit?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notifications
  async sendNotification(notification: NotificationForm): Promise<void> {
    try {
      await adminApi.post(`${this.baseUrl}/notifications/send`, notification);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotifications(page: number = 1, perPage: number = 50, status?: string): Promise<NotificationsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      if (status) params.append('status', status);

      const response = await adminApi.get(`${this.baseUrl}/notifications?${params.toString()}`);
    return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // First try the simple test endpoint
      const response = await adminApi.get('/api/simple-admin/stats');
      if (response.data.status === 'success') {
        return {
          stats: response.data.stats,
          recent_activity: []
        };
      }
    } catch (error) {
      console.log('Simple admin endpoint failed, trying main endpoint...');
    }
    
    // Fallback to main endpoint
    const response = await adminApi.get(`${this.baseUrl}/dashboard/stats`);
    return response.data;
  }

  // Analytics
  async getAnalyticsStats(period: string = '30d'): Promise<AnalyticsStats> {
    try {
      const params = new URLSearchParams({ period });
      const response = await adminApi.get(`${this.baseUrl}/analytics/stats?${params.toString()}`);
    return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportAnalytics(options: ExportOptions): Promise<ExportResponse> {
    try {
      const params = new URLSearchParams({
        type: options.type,
        format: options.format
      });
      
      if (options.date_from) params.append('date_from', options.date_from);
      if (options.date_to) params.append('date_to', options.date_to);

      const response = await adminApi.get(`${this.baseUrl}/analytics/export?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility Methods
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = error.response.data;
      return new Error(apiError.error || apiError.message || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Helper method to download files
  async downloadFile(blob: Blob, filename: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Download not available in server environment');
    }
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Helper method to format date for API
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper method to build query string
  buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return searchParams.toString();
  }

}

// Create and export singleton instance
export const adminService = new AdminService();

// Export class for testing
export { AdminService };
