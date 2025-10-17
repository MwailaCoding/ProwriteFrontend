# ProWrite Admin System

## Overview

A comprehensive admin interface for managing the ProWrite platform, featuring user management, document oversight, payment processing, system monitoring, and analytics.

## Features

### 🏠 Dashboard
- **Key Metrics**: Total users, documents, payments, revenue
- **Real-time Stats**: New users, documents, pending payments
- **System Health**: Database, email service, payment gateway status
- **Activity Feed**: Recent user registrations, document generations, payments
- **Quick Actions**: Send notifications, export data, view analytics

### 👥 User Management
- **User List**: Searchable, filterable table with pagination
- **User Details**: Complete user profile with edit capabilities
- **User Actions**: 
  - Suspend/activate accounts
  - Promote to premium
  - Grant/revoke admin privileges
  - Delete user accounts
- **User Analytics**: Document count, payment history, activity tracking

### 📄 Document Management
- **Document Repository**: View all generated documents across users
- **Document Preview**: PDF viewer for document inspection
- **Download Management**: Download any document with tracking
- **Filtering**: By user, document type, date range, status
- **Metadata**: Reference numbers, creation dates, download counts

### 💳 Payment Management
- **Payment Overview**: All transactions with status tracking
- **Approval Workflow**: Approve/reject manual payments
- **Payment Details**: Transaction codes, amounts, user information
- **Revenue Tracking**: Total revenue, payment success rates
- **Export Capabilities**: Payment reports and analytics

### 📊 System Logs & Audit
- **System Logs**: Real-time activity monitoring
- **Log Levels**: Error, warning, info, debug filtering
- **Audit Trail**: Complete admin action history
- **Search & Filter**: By date, user, action type, module
- **Export Logs**: Download log data for analysis

### 🔔 Notifications
- **Email Composer**: Rich text email editor
- **Recipient Types**: Individual users, all users, premium users, free users
- **Scheduling**: Send immediately or schedule for later
- **Delivery Tracking**: Sent, pending, failed status
- **Notification History**: Complete email campaign history

### 📈 Analytics & Reporting
- **Interactive Charts**: User growth, revenue trends, document generation
- **Time Periods**: 7 days, 30 days, 90 days, 1 year
- **Key Metrics**: Premium conversion rate, active users, revenue
- **Data Export**: CSV/JSON export for all data types
- **Custom Reports**: Generate reports for specific date ranges

## Technical Architecture

### Backend (Python/Flask)
- **Admin Routes**: `/api/admin/*` endpoints for all admin operations
- **Authentication**: JWT-based admin authentication with role verification
- **Database**: MySQL with new admin-specific tables
- **Logging**: Comprehensive audit trail and system logging
- **Security**: Admin-only access with IP logging

### Frontend (React/TypeScript)
- **Modern UI**: Tailwind CSS with responsive design
- **Component Architecture**: Reusable components for tables, modals, forms
- **State Management**: React hooks for data management
- **Type Safety**: Comprehensive TypeScript definitions
- **Error Handling**: Graceful error handling with user feedback

### Database Schema

#### New Tables
- `admin_activity_logs`: Track all admin actions
- `user_documents`: Document metadata and tracking
- `notification_queue`: Email notification management
- `payment_approvals`: Payment approval workflow

#### Enhanced Tables
- `users`: Added `is_admin` column for admin privileges

## Installation & Setup

### 1. Backend Setup

```bash
# Run database migrations
python backend/Prowritesolutions/create_admin_tables.py

# Create admin user
python backend/Prowritesolutions/create_admin_user.py
```

### 2. Frontend Setup

```bash
# Install dependencies (if not already installed)
npm install

# The admin interface is already integrated into the main app
# Access at: /admin/dashboard
```

### 3. Environment Configuration

Ensure your `.env` file includes:
```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

## Usage

### Accessing the Admin Interface

1. **Login**: Use admin credentials at `/admin/login`
2. **Dashboard**: Navigate to `/admin/dashboard` for overview
3. **Navigation**: Use the sidebar to access different sections

### Admin User Management

1. **Create Admin**: Use the API endpoint `/api/auth/create-admin`
2. **Admin Privileges**: Only existing admins can create new admins
3. **Security**: All admin actions are logged and audited

### Key Workflows

#### User Management
1. Navigate to Users section
2. Search/filter users as needed
3. Click on user to view details
4. Use action buttons to edit, suspend, or delete

#### Payment Approval
1. Go to Payments section
2. Filter for pending payments
3. Click approve/reject button
4. Provide reason if rejecting
5. Payment status updates automatically

#### Document Management
1. Access Documents section
2. Filter by user, type, or date
3. Click view to preview document
4. Use download button to get PDF

#### System Monitoring
1. Check System Logs for errors
2. Review Audit Trail for admin actions
3. Monitor system health on dashboard
4. Export logs for analysis

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/auth/create-admin` - Create new admin (admin only)

### User Management
- `GET /api/admin/users` - List users with filtering
- `GET /api/admin/users/{id}` - Get user details
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/users/{id}/documents` - Get user documents

### Document Management
- `GET /api/admin/documents` - List all documents
- `GET /api/admin/documents/{reference}/download` - Download document

### Payment Management
- `GET /api/admin/payments` - List payments
- `PUT /api/admin/payments/{id}/approve` - Approve/reject payment

### System & Analytics
- `GET /api/admin/system/logs` - Get system logs
- `GET /api/admin/system/audit` - Get audit trail
- `GET /api/admin/analytics/stats` - Get analytics
- `GET /api/admin/analytics/export` - Export data

### Notifications
- `POST /api/admin/notifications/send` - Send notification
- `GET /api/admin/notifications` - Get notification history

## Security Features

- **Admin Authentication**: JWT tokens with admin role verification
- **Action Logging**: All admin actions logged with IP addresses
- **Audit Trail**: Complete history of admin activities
- **Role-based Access**: Only admins can access admin interface
- **Input Validation**: Comprehensive validation on all inputs
- **Error Handling**: Secure error messages without sensitive data

## Testing

Run the test script to verify admin system functionality:

```bash
python test_admin_system.py
```

This will test:
- Admin login functionality
- API endpoint accessibility
- Database table existence
- Basic system health

## File Structure

```
src/
├── pages/admin/
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   ├── DocumentsPage.tsx
│   ├── PaymentsPage.tsx
│   ├── SystemLogsPage.tsx
│   ├── NotificationsPage.tsx
│   └── AnalyticsPage.tsx
├── components/admin/
│   ├── AdminLayout.tsx
│   ├── AdminSidebar.tsx
│   ├── DataTable.tsx
│   ├── StatCard.tsx
│   ├── UserDetailsModal.tsx
│   ├── DocumentViewerModal.tsx
│   ├── PaymentApprovalModal.tsx
│   ├── EmailComposerModal.tsx
│   ├── ActivityFeed.tsx
│   ├── QuickActions.tsx
│   └── ConfirmDialog.tsx
├── services/
│   └── adminService.ts
└── types/
    └── admin.ts

backend/Prowritesolutions/
├── admin_routes.py
├── create_admin_tables.py
├── create_admin_user.py
└── app.py (modified)
```

## Troubleshooting

### Common Issues

1. **Admin Login Fails**
   - Verify admin user exists in database
   - Check `is_admin` flag is set to TRUE
   - Ensure password is correct

2. **API Endpoints Return 403**
   - Verify JWT token is valid
   - Check user has admin privileges
   - Ensure token is included in Authorization header

3. **Database Errors**
   - Run migration script: `python create_admin_tables.py`
   - Check database connection settings
   - Verify table permissions

4. **Frontend Not Loading**
   - Check if admin routes are properly configured
   - Verify user authentication state
   - Check browser console for errors

### Support

For issues or questions:
1. Check system logs in admin interface
2. Review audit trail for recent actions
3. Verify database table structure
4. Test API endpoints directly

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: More detailed charts and metrics
- **Bulk Operations**: Mass user actions and data processing
- **Email Templates**: Pre-built notification templates
- **API Rate Limiting**: Enhanced security and performance
- **Mobile Admin App**: Dedicated mobile interface
- **Advanced Reporting**: Custom report builder
- **Integration APIs**: Third-party service integrations

---

**Note**: This admin system replaces the previous template-focused admin interface with a comprehensive platform management solution focused on user management, document oversight, and system monitoring.
