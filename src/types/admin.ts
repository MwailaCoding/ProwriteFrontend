// Core Types
export interface AdminUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_premium: boolean;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
  status: 'active' | 'suspended' | 'pending';
  phone?: string;
  country?: string;
  subscription_expires?: string;
}

export interface Document {
  id: number;
  user_id: number;
  user_email: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  document_type: 'resume' | 'cover_letter' | 'cv' | 'other';
  status: 'active' | 'deleted';
  created_at: string;
  updated_at: string;
  download_count: number;
}

export interface Payment {
  id: number;
  user_id: number;
  user_email: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_method: 'mpesa_stk' | 'manual_admin';
  transaction_id: string;
  reference: string;
  description: string;
  created_at: string;
  processed_at?: string;
  failure_reason?: string;
  metadata?: Record<string, any>;
}

export interface SystemLog {
  id: number;
  level: 'info' | 'warning' | 'error' | 'success' | 'debug';
  message: string;
  source: string;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  user_id?: number;
  created_at: string;
  expires_at?: string;
  action_url?: string;
}

export interface AnalyticsStats {
  total_users: number;
  total_documents: number;
  total_payments: number;
  total_revenue: number;
  monthly_growth: number;
  user_growth: number;
  document_growth: number;
  revenue_growth: number;
  active_users: number;
  premium_users: number;
  conversion_rate: number;
  average_revenue_per_user: number;
}

// Response Types
export interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DocumentsResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  total_revenue: number;
  pending_amount: number;
}

export interface SystemLogsResponse {
  logs: SystemLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

// Filter Types
export interface UserFilters {
  search?: string;
  role?: 'all' | 'admin' | 'premium' | 'regular';
  status?: 'all' | 'active' | 'suspended' | 'pending';
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DocumentFilters {
  search?: string;
  type?: 'all' | 'resume' | 'cover_letter' | 'cv' | 'other';
  user_id?: number;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaymentFilters {
  search?: string;
  status?: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  method?: 'all' | 'mpesa_stk' | 'manual_admin';
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
}

export interface LogFilters {
  level?: 'all' | 'info' | 'warning' | 'error' | 'success' | 'debug';
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
}

// Form Types
export interface UserUpdateForm {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_premium?: boolean;
  is_admin?: boolean;
  status?: 'active' | 'suspended' | 'pending';
  phone?: string;
  country?: string;
}

export interface PaymentApprovalForm {
  approved: boolean;
  notes?: string;
  admin_notes?: string;
}

export interface NotificationForm {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user_ids?: number[];
  send_to_all?: boolean;
  expires_at?: string;
  action_url?: string;
}

export interface ExportOptions {
  type: 'users' | 'documents' | 'payments' | 'logs' | 'analytics';
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: any;
  date_range?: {
    from: string;
    to: string;
  };
}

export interface ExportResponse {
  export_id: string;
  status: 'processing' | 'completed' | 'failed';
  download_url?: string;
  expires_at: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  field_errors?: Record<string, string[]>;
}

// Component Props
export interface AdminLayoutProps {
  children: React.ReactNode;
  user: AdminUser;
  onLogout: () => void;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
  loading?: boolean;
}

export interface DataTableProps {
  data: any[];
  columns: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  selectable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export interface UserDetailsModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserUpdateForm) => void;
  loading?: boolean;
}

export interface DocumentViewerModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (documentId: number) => void;
  onDelete: (documentId: number) => void;
}

export interface PaymentApprovalModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approvalData: PaymentApprovalForm) => void;
  onReject: (reason: string) => void;
  loading?: boolean;
}

export interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (notification: NotificationForm) => void;
  loading?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}