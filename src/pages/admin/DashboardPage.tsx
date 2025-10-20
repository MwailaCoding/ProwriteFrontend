/**
 * Admin Dashboard Page
 * Overview with metrics, charts, and activity feed
 */

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import type { AnalyticsStats, DashboardStats, RecentActivity } from '../../types/admin';
import StatCard from '../../components/admin/StatCard';
import ActivityFeed from '../../components/admin/ActivityFeed';
import QuickActions from '../../components/admin/QuickActions';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboard stats directly
      const dashboardData = await adminService.getDashboardStats();
      setStats(dashboardData.stats);

      // Load analytics data for charts
      const analyticsData = await adminService.getAnalyticsStats('30d');
      setAnalytics(analyticsData);

      // Mock recent activity - in real implementation, this would come from an API
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered: john.doe@example.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          user: { name: 'John Doe', email: 'john.doe@example.com' }
        },
        {
          id: '2',
          type: 'document_generation',
          description: 'Resume generated for user: jane.smith@example.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          user: { name: 'Jane Smith', email: 'jane.smith@example.com' }
        },
        {
          id: '3',
          type: 'payment_completed',
          description: 'Payment completed: $500 for premium resume',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: { name: 'Bob Johnson', email: 'bob.johnson@example.com' }
        }
      ];
      setRecentActivity(mockActivity);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your ProWrite system performance and activity
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change={{
              value: stats.newUsersToday,
              type: 'increase'
            }}
            icon={<UsersIcon className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Total Documents"
            value={stats.totalDocuments.toLocaleString()}
            change={{
              value: stats.newDocumentsToday,
              type: 'increase'
            }}
            icon={<DocumentTextIcon className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<CreditCardIcon className="h-6 w-6" />}
            color="purple"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments.toString()}
            icon={<ChartBarIcon className="h-6 w-6" />}
            color={stats.pendingPayments > 0 ? 'yellow' : 'green'}
          />
        </div>
      )}

      {/* System Health */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <CheckCircleIcon className="h-8 w-8 text-green-500" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
            <p className="text-sm text-gray-500">All systems operational</p>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth (Last 30 Days)</h3>
          {analytics && (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chart visualization would go here</p>
                <p className="text-xs text-gray-400 mt-1">
                  {analytics.charts.dailyRegistrations.length} data points
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends (Last 30 Days)</h3>
          {analytics && (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chart visualization would go here</p>
                <p className="text-xs text-gray-400 mt-1">
                  Total: ${analytics.payments.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={recentActivity} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.users.premiumPercentage}%
              </div>
              <div className="text-sm text-gray-500">Premium Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.users.active}
              </div>
              <div className="text-sm text-gray-500">Active Users (30d)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.payments.statuses.completed || 0}
              </div>
              <div className="text-sm text-gray-500">Completed Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.keys(analytics.documents.types).length}
              </div>
              <div className="text-sm text-gray-500">Document Types</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
