import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 1250,
    totalDocuments: 3420,
    totalRevenue: 45600,
    monthlyGrowth: 12.5,
    userGrowth: 8.3,
    documentGrowth: 15.2,
    revenueGrowth: 22.1
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      name: 'Total Users',
      value: analytics.totalUsers.toLocaleString(),
      change: analytics.userGrowth,
      changeType: 'increase',
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Documents',
      value: analytics.totalDocuments.toLocaleString(),
      change: analytics.documentGrowth,
      changeType: 'increase',
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      change: analytics.revenueGrowth,
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Monthly Growth',
      value: `${analytics.monthlyGrowth}%`,
      change: 2.1,
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of system performance and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Chart would be rendered here</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Chart would be rendered here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity Summary
          </h3>
          <div className="mt-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex">
                  <UsersIcon className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">New Users</p>
                    <p className="text-2xl font-semibold text-blue-900">+24</p>
                    <p className="text-xs text-blue-600">This week</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex">
                  <DocumentTextIcon className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Documents Generated</p>
                    <p className="text-2xl font-semibold text-green-900">+156</p>
                    <p className="text-xs text-green-600">This week</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex">
                  <CurrencyDollarIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">Revenue</p>
                    <p className="text-2xl font-semibold text-yellow-900">+$2,340</p>
                    <p className="text-xs text-yellow-600">This week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Export Users (CSV)
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Export Payments (CSV)
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Export Analytics (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;