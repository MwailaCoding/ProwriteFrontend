import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  RefreshCw,
  AlertCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  Loader
} from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface PendingPayment {
  reference: string;
  submission_id: number;
  amount: number;
  document_type: string;
  user_email: string;
  phone_number?: string;
  transaction_code: string;
  created_at: string;
  form_data: any;
}

interface PaymentConfirmationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentConfirmationPanel: React.FC<PaymentConfirmationPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingPayments = async () => {
    setIsLoading(true);
    try {
      // Use absolute URL to ensure it goes to the backend
      const backendURL = 'https://prowrite.pythonanywhere.com/api';
      const response = await fetch(`${backendURL}/payments/manual/admin/pending`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPendingPayments(data.pending_payments || []);
      } else {
        toast.error('Failed to fetch pending payments');
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Failed to fetch pending payments');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPayment = async (reference: string) => {
    setIsProcessing(true);
    try {
      // Use absolute URL to ensure it goes to the backend
      const backendURL = 'https://prowrite.pythonanywhere.com/api';
      const response = await fetch(`${backendURL}/payments/manual/admin/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: reference,
          admin_user_id: 1
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment confirmed successfully');
        setPendingPayments(prev => prev.filter(p => p.reference !== reference));
        setSelectedPayment(null);
        setShowDetails(false);
      } else {
        toast.error(data.error || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectPayment = async (reference: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      // Use absolute URL to ensure it goes to the backend
      const backendURL = 'https://prowrite.pythonanywhere.com/api';
      const response = await fetch(`${backendURL}/payments/manual/admin/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: reference,
          admin_user_id: 1,
          reason: reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment rejected');
        setPendingPayments(prev => prev.filter(p => p.reference !== reference));
        setSelectedPayment(null);
        setShowDetails(false);
      } else {
        toast.error(data.error || 'Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const viewPaymentDetails = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendingPayments();
    }
  }, [isOpen]);

  const renderPaymentList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Payment Confirmations
        </h3>
        <Button
          onClick={fetchPendingPayments}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : pendingPayments.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">No pending payments to confirm</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingPayments.map((payment) => (
            <motion.div
              key={payment.reference}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {payment.reference}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Document:</span>
                      <span className="ml-2 font-medium">{payment.document_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {formatAmount(payment.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">User:</span>
                      <span className="ml-2 font-medium">{payment.user_email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Transaction Code:</span>
                      <span className="ml-2 font-mono font-medium">{payment.transaction_code}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    onClick={() => viewPaymentDetails(payment)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => confirmPayment(payment.reference)}
                    variant="primary"
                    size="sm"
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaymentDetails = () => {
    if (!selectedPayment) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h3>
          <Button
            onClick={() => setShowDetails(false)}
            variant="outline"
            size="sm"
          >
            Back to List
          </Button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Reference:</span>
              <p className="font-mono font-semibold">{selectedPayment.reference}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Amount:</span>
              <p className="font-semibold text-green-600">
                {formatAmount(selectedPayment.amount)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Document Type:</span>
              <p className="font-semibold">{selectedPayment.document_type}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Transaction Code:</span>
              <p className="font-mono font-semibold">{selectedPayment.transaction_code}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">User Email:</span>
              <p className="font-semibold">{selectedPayment.user_email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Phone:</span>
              <p className="font-semibold">{selectedPayment.phone_number || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Created:</span>
              <p className="font-semibold">{formatDate(selectedPayment.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Form Data:</h4>
          <pre className="text-sm text-blue-700 overflow-auto max-h-40">
            {JSON.stringify(selectedPayment.form_data, null, 2)}
          </pre>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => confirmPayment(selectedPayment.reference)}
            variant="primary"
            className="flex-1"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Confirm Payment
          </Button>
          <Button
            onClick={() => {
              const reason = prompt('Enter rejection reason:');
              if (reason) {
                rejectPayment(selectedPayment.reference, reason);
              }
            }}
            variant="secondary"
            className="flex-1"
            disabled={isProcessing}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Payment
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment Confirmation Panel
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {showDetails ? renderPaymentDetails() : renderPaymentList()}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};