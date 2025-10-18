import adminApi from './adminApi';
import type { 
  AdminUser, 
  Document, 
  Payment, 
  SystemLog, 
  Notification,
  AnalyticsStats,
  UsersResponse,
  DocumentsResponse,
  PaymentsResponse,
  SystemLogsResponse,
  NotificationsResponse,
  UserFilters,
  DocumentFilters,
  PaymentFilters,
  LogFilters,
  UserUpdateForm,
  PaymentApprovalForm,
  NotificationForm,
  ExportOptions,
  ExportResponse,
  ApiError
} from '../types/admin';

class AdminService {
  // User Management
  async getUsers(filters?: UserFilters): Promise<UsersResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await adminApi.get(`/admin/users?${params.toString()}`);
    return response.data;
  }

  async getUserById(userId: number): Promise<AdminUser> {
    const response = await adminApi.get(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: number, userData: UserUpdateForm): Promise<AdminUser> {
    const response = await adminApi.put(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await adminApi.delete(`/admin/users/${userId}`);
  }

  async suspendUser(userId: number): Promise<void> {
    await adminApi.post(`/admin/users/${userId}/suspend`);
  }

  async activateUser(userId: number): Promise<void> {
    await adminApi.post(`/admin/users/${userId}/activate`);
  }

  async promoteToPremium(userId: number): Promise<void> {
    await adminApi.post(`/admin/users/${userId}/promote`);
  }

  async demoteFromPremium(userId: number): Promise<void> {
    await adminApi.post(`/admin/users/${userId}/demote`);
  }

  async bulkActionUser(userIds: number[], action: string): Promise<void> {
    await adminApi.post('/admin/users/bulk-action', { userIds, action });
  }

  // Document Management
  async getDocuments(filters?: DocumentFilters): Promise<DocumentsResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await adminApi.get(`/admin/documents?${params.toString()}`);
    return response.data;
  }

  async getDocumentById(documentId: number): Promise<Document> {
    const response = await adminApi.get(`/admin/documents/${documentId}`);
    return response.data;
  }

  async downloadDocument(documentId: number): Promise<Blob> {
    const response = await adminApi.get(`/admin/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteDocument(documentId: number): Promise<void> {
    await adminApi.delete(`/admin/documents/${documentId}`);
  }

  // Payment Management
  async getPayments(filters?: PaymentFilters): Promise<PaymentsResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.method) params.append('method', filters.method);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await adminApi.get(`/admin/payments?${params.toString()}`);
    return response.data;
  }

  async getPaymentById(paymentId: number): Promise<Payment> {
    const response = await adminApi.get(`/admin/payments/${paymentId}`);
    return response.data;
  }

  async approvePayment(paymentId: number, approvalData: PaymentApprovalForm): Promise<void> {
    await adminApi.post(`/admin/payments/${paymentId}/approve`, approvalData);
  }

  async rejectPayment(paymentId: number, reason: string): Promise<void> {
    await adminApi.post(`/admin/payments/${paymentId}/reject`, { reason });
  }

  async refundPayment(paymentId: number, amount: number, reason: string): Promise<void> {
    await adminApi.post(`/admin/payments/${paymentId}/refund`, { amount, reason });
  }

  // System Logs
  async getSystemLogs(filters?: LogFilters): Promise<SystemLogsResponse> {
    const params = new URLSearchParams();
    if (filters?.level) params.append('level', filters.level);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await adminApi.get(`/admin/logs?${params.toString()}`);
    return response.data;
  }

  async getAuditLogs(filters?: LogFilters): Promise<SystemLogsResponse> {
    const params = new URLSearchParams();
    if (filters?.level) params.append('level', filters.level);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await adminApi.get(`/admin/audit-logs?${params.toString()}`);
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<NotificationsResponse> {
    const response = await adminApi.get('/admin/notifications');
    return response.data;
  }

  async sendNotification(notification: NotificationForm): Promise<void> {
    await adminApi.post('/admin/notifications', notification);
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await adminApi.post(`/admin/notifications/${notificationId}/read`);
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await adminApi.delete(`/admin/notifications/${notificationId}`);
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsStats> {
    const response = await adminApi.get('/admin/analytics');
    return response.data;
  }

  async getDashboardStats(): Promise<any> {
    const response = await adminApi.get('/admin/dashboard/stats');
    return response.data;
  }

  async getRevenueAnalytics(period: string): Promise<any> {
    const response = await adminApi.get(`/admin/analytics/revenue?period=${period}`);
    return response.data;
  }

  async getUserAnalytics(period: string): Promise<any> {
    const response = await adminApi.get(`/admin/analytics/users?period=${period}`);
    return response.data;
  }

  // Export Functions
  async exportData(options: ExportOptions): Promise<ExportResponse> {
    const response = await adminApi.post('/admin/export', options);
    return response.data;
  }

  async downloadExport(exportId: string): Promise<Blob> {
    const response = await adminApi.get(`/admin/export/${exportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Utility function for file downloads
  downloadFile(blob: Blob, filename: string): void {
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }
}

export default new AdminService();