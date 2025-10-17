/**
 * Admin System Type Definitions
 * Comprehensive type definitions for the new admin interface
 */

// Base User interface (extended from existing User type)
export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  documentCount?: number;
  paymentCount?: number;
}

// Document interface
export interface Document {
  id: number;
  documentType: 'resume' | 'cover_letter';
  reference: string;
  status: 'generated' | 'processing' | 'failed';
  downloadCount: number;
  createdAt: string;
  filePath?: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Payment interface
export interface Payment {
  id: number;
  reference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  documentType: string;
  transactionCode?: string;
  createdAt: string;
  updatedAt?: string;
  userEmail: string;
  paymentType: 'manual' | 'pesapal' | 'mpesa';
}

// System Log interface
export interface SystemLog {
  id: number;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  module?: string;
  userId?: number;
  ipAddress?: string;
  metadata?: any;
  createdAt: string;
}

// Admin Activity Log interface
export interface AdminActivityLog {
  id: number;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: any;
  ipAddress?: string;
  createdAt: string;
  admin: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Notification interface
export interface Notification {
  id: number;
  recipientEmail: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
  createdBy?: string;
}

// Analytics interfaces
export interface AnalyticsStats {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  users: {
    total: number;
    premium: number;
    new: number;
    active: number;
    premiumPercentage: number;
  };
  documents: {
    total: number;
    new: number;
    types: Record<string, number>;
  };
  payments: {
    total: number;
    new: number;
    revenue: number;
    statuses: Record<string, number>;
  };
  charts: {
    dailyRegistrations: Array<{ date: string; count: number }>;
    dailyRevenue: Array<{ date: string; revenue: number }>;
  };
}

// Pagination interface
export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

// API Response interfaces
export interface UsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

export interface DocumentsResponse {
  documents: Document[];
  pagination: Pagination;
}

export interface PaymentsResponse {
  payments: Payment[];
  pagination: Pagination;
}

export interface SystemLogsResponse {
  logs: SystemLog[];
  pagination: Pagination;
}

export interface AuditLogsResponse {
  auditLogs: AdminActivityLog[];
  pagination: Pagination;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: Pagination;
}

// Filter interfaces
export interface UserFilters {
  search?: string;
  filter?: 'all' | 'premium' | 'free' | 'admin';
  page?: number;
  per_page?: number;
}

export interface DocumentFilters {
  search?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface PaymentFilters {
  status?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface LogFilters {
  level?: string;
  module?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface AuditFilters {
  admin_id?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

// Form interfaces
export interface UserUpdateForm {
  isPremium?: boolean;
  isAdmin?: boolean;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
}

export interface PaymentApprovalForm {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface NotificationForm {
  recipient_type: 'individual' | 'all' | 'premium' | 'free';
  recipient_email?: string;
  subject: string;
  body: string;
  body_html?: string;
  scheduled_at?: string;
}

// Export interfaces
export interface ExportOptions {
  type: 'users' | 'documents' | 'payments';
  format: 'csv' | 'json';
  date_from?: string;
  date_to?: string;
}

export interface ExportResponse {
  data: string;
  format: string;
  filename: string;
}

// Dashboard interfaces
export interface DashboardStats {
  totalUsers: number;
  totalDocuments: number;
  totalPayments: number;
  totalRevenue: number;
  newUsersToday: number;
  newDocumentsToday: number;
  pendingPayments: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'document_generation' | 'payment_completed' | 'admin_action';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
}

// Chart data interfaces
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

// Modal interfaces
export interface UserDetailsModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: number, updates: UserUpdateForm) => void;
}

export interface DocumentViewerModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (reference: string) => void;
}

export interface PaymentApprovalModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (paymentId: number, action: 'approve' | 'reject', reason?: string) => void;
}

export interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (notification: NotificationForm) => void;
}

// Component props interfaces
export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  actions?: (row: T) => React.ReactNode;
}

export interface FilterBarProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
  onApply: () => void;
}

// Navigation interfaces
export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: NavItem[];
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    is_admin: boolean;
  } | null;
  onLogout: () => void;
}

// Error interfaces
export interface AdminError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiError {
  error: string;
  message?: string;
  status_code?: number;
}

// Utility types
export type AdminAction = 
  | 'view_users'
  | 'edit_user'
  | 'delete_user'
  | 'view_documents'
  | 'download_document'
  | 'view_payments'
  | 'approve_payment'
  | 'view_logs'
  | 'send_notification'
  | 'view_analytics'
  | 'export_data';

export type AdminPermission = {
  action: AdminAction;
  allowed: boolean;
};

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

// Theme interfaces
export interface AdminTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Configuration interfaces
export interface AdminConfig {
  apiBaseUrl: string;
  itemsPerPage: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  notificationRetentionDays: number;
  logRetentionDays: number;
  enableRealTimeUpdates: boolean;
  enableEmailNotifications: boolean;
  enableAuditLogging: boolean;
}

// Hook return types
export interface UseAdminDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UsePaginationReturn {
  page: number;
  perPage: number;
  total: number;
  pages: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
}

export interface UseFiltersReturn<T> {
  filters: T;
  setFilter: (key: keyof T, value: any) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}
