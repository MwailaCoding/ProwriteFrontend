import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  FileText,
  Smartphone,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PaymentHistory } from './PaymentHistory';
import { mpesaService, MpesaFormSubmission } from '../../services/mpesaService';
import { toast } from 'react-hot-toast';

interface PaymentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentDashboard: React.FC<PaymentDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const [payments, setPayments] = useState<MpesaFormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPayments();
    }
  }, [isOpen]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const response = await mpesaService.getPaymentHistory();
      if (response.success && response.payments) {
        setPayments(response.payments);
      } else {
        toast.error(response.error || 'Failed to load payment data');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handleDownload = async (submissionId: number) => {
    try {
      const response = await mpesaService.downloadPDF(submissionId);
      if (response.success && response.download_url) {
        window.open(response.download_url, '_blank');
      } else {
        toast.error('Download not available yet');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  const getStats = () => {
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed' || p.status === 'email_sent').length;
    const pendingPayments = payments.filter(p => p.status === 'pending_payment').length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      totalAmount,
      averageAmount
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'email_sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'paid':
      case 'pdf_generated':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending_payment':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'email_sent':
        return 'Email Sent';
      case 'paid':
        return 'Payment Received';
      case 'pdf_generated':
        return 'Generating PDF';
      case 'pending_payment':
        return 'Pending Payment';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'email_sent':
        return 'text-green-700 bg-green-50';
      case 'paid':
      case 'pdf_generated':
        return 'text-blue-700 bg-blue-50';
      case 'pending_payment':
        return 'text-yellow-700 bg-yellow-50';
      default:
        return 'text-red-700 bg-red-50';
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

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('254')) {
      return `0${phone.slice(3)}`;
    }
    return phone;
  };

  const recentPayments = payments.slice(0, 5);
  const stats = getStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Payment Dashboard
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <AlertCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalPayments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Completed</p>
                        <p className="text-2xl font-bold text-green-900">{stats.completedPayments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Clock className="w-8 h-8 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">{stats.pendingPayments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">Total Spent</p>
                        <p className="text-2xl font-bold text-purple-900">KES {stats.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Recent Payments</h3>
                      <Button
                        onClick={() => setShowHistory(true)}
                        variant="outline"
                        size="sm"
                      >
                        View All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {recentPayments.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No payments found
                        </h3>
                        <p className="text-gray-500">
                          Your payment history will appear here once you make a purchase.
                        </p>
                      </div>
                    ) : (
                      recentPayments.map((payment) => (
                        <motion.div
                          key={payment.submission_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {getStatusIcon(payment.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {mpesaService.formatDocumentType(payment.document_type)}
                                  </h4>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                    {getStatusText(payment.status)}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(payment.created_at)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Smartphone className="w-4 h-4" />
                                    <span>{formatPhoneNumber(payment.phone_number)}</span>
                                  </div>
                                  {payment.mpesa_receipt_number && (
                                    <div className="flex items-center space-x-1">
                                      <CreditCard className="w-4 h-4" />
                                      <span>Receipt: {payment.mpesa_receipt_number}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  KES {payment.amount.toLocaleString()}
                                </div>
                              </div>
                              {(payment.status === 'completed' || payment.status === 'email_sent') && (
                                <Button
                                  onClick={() => handleDownload(payment.submission_id)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Payment History Modal */}
      <PaymentHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
};

