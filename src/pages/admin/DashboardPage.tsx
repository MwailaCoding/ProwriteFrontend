import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalPayments: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        totalDocuments: 3420,
        totalPayments: 890,
        totalRevenue: 45600
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Documents',
      value: stats.totalDocuments.toLocaleString(),
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Total Payments',
      value: stats.totalPayments.toLocaleString(),
      icon: CreditCardIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-mb-8">
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <UsersIcon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            New user registered: <span className="font-medium text-gray-900">john@example.com</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>2 hours ago</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <DocumentTextIcon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Document generated: <span className="font-medium text-gray-900">Resume_12345.pdf</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>4 hours ago</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                          <CreditCardIcon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Payment received: <span className="font-medium text-gray-900">$25.00</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>6 hours ago</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;