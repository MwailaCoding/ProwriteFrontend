import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  Download,
  Search,
  Filter,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Eye,
  FileText,
  Crown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { paymentService } from '../../services/paymentService';
import { PaymentHistoryItem, PaymentStats } from '../../types';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const PaymentHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [stats, setStats] = useState<PaymentStats | null>(null);

  const { data: payments, loading, refetch } = useApi<PaymentHistoryItem[]>(
    () => paymentService.getPaymentHistory()
  );

  // Fetch payment stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const paymentStats = await paymentService.getPaymentStats();
        setStats(paymentStats);
      } catch (error) {
        console.error('Failed to fetch payment stats:', error);
      }
    };

    fetchStats();
  }, []);

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.checkout_request_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phone_number?.includes(searchTerm) ||
      payment.mpesa_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = paymentTypeFilter === 'all' || payment.payment_type === paymentTypeFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = paymentDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'resume':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'cover_letter':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'premium':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success('Payment history refreshed');
  };

  const statsData = [
    {
      title: 'Total Revenue',
      value: stats ? `KES ${stats.totalRevenue.toLocaleString()}` : 'KES 0',
      icon: CreditCard,
      color: 'sunset',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Total Payments',
      value: stats?.totalPayments || 0,
      icon: Receipt,
      color: 'blue',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: 'This Month',
      value: stats ? `KES ${stats.payments30d.toLocaleString()}` : 'KES 0',
      icon: Calendar,
      color: 'green',
      change: '+15.3%',
      changeType: 'positive'
    },
    {
      title: 'Success Rate',
      value: stats && stats.totalPayments > 0 
        ? `${Math.round((stats.paymentStatusStats.completed || 0) / stats.totalPayments * 100)}%`
        : '0%',
      icon: CheckCircle,
      color: 'emerald',
      change: '+2.1%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="mt-2 text-gray-600">
                Track all your M-Pesa payments and download history
          </p>
        </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="mt-4 sm:mt-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <motion.div key={stat.title} variants={itemVariants}>
                <Card className="h-full">
                  <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-sm ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">from last month</span>
                        </div>
                </div>
                      <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
                  </CardContent>
            </Card>
              </motion.div>
          ))}
        </div>

      {/* Filters */}
        <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                      placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={paymentTypeFilter}
                    onChange={(e) => setPaymentTypeFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="resume">Resume</option>
                    <option value="cover_letter">Cover Letter</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
              </select>
            </div>
          </div>
            </CardContent>
        </Card>

          {/* Payments List */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Payment History</span>
                <span className="text-sm font-normal text-gray-500">
                  {filteredPayments.length} payments
                </span>
              </CardTitle>
          </CardHeader>
          <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' || paymentTypeFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Start making payments to see them here'
                    }
                  </p>
              </div>
              ) : (
                <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                    <motion.div
                      key={payment.payment_id}
                      variants={itemVariants}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getPaymentTypeIcon(payment.payment_type)}
                          <div>
                              <p className="font-medium text-gray-900 capitalize">
                                {payment.payment_type.replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {payment.item_id}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {paymentService.formatCurrency(payment.amount, payment.currency)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(payment.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {payment.phone_number && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Smartphone className="h-4 w-4" />
                                <span>{payment.phone_number}</span>
                              </div>
                            )}
                            
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                              <span className="ml-1 capitalize">{payment.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional payment details */}
                      {(payment.checkout_request_id || payment.mpesa_code) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              {payment.checkout_request_id && (
                                <span>Checkout ID: {payment.checkout_request_id}</span>
                              )}
                              {payment.mpesa_code && (
                                <span>M-Pesa Code: {payment.mpesa_code}</span>
                              )}
                            </div>
                            {payment.completed_at && (
                              <span>Completed: {formatDate(payment.completed_at)}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
};