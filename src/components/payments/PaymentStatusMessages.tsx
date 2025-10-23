import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '../common/Button';

interface PaymentStatusMessagesProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  message: string;
  pollingAttempt?: number;
  maxPolls?: number;
  elapsedTime?: number;
  errorCode?: string;
  errorCategory?: string;
  userMessage?: string;
  checkoutRequestId?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  onCopyReference?: (text: string) => void;
}

const PaymentStatusMessages: React.FC<PaymentStatusMessagesProps> = ({
  status,
  message,
  pollingAttempt = 0,
  maxPolls = 3,
  elapsedTime = 0,
  errorCode,
  errorCategory,
  userMessage,
  checkoutRequestId,
  onRetry,
  onCancel,
  onCopyReference
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'processing':
        return <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getProgressPercentage = () => {
    if (status === 'completed') return 100;
    if (status === 'failed' || status === 'cancelled') return 0;
    return Math.min((pollingAttempt / maxPolls) * 100, 90);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Status Header */}
      <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="font-semibold">{message}</h3>
            {status === 'processing' && (
              <div className="flex items-center space-x-2 text-sm mt-1">
                <span>Poll {pollingAttempt} of {maxPolls}</span>
                <span>•</span>
                <span>{elapsedTime}s elapsed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'processing' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Error Details */}
      {(status === 'failed' || status === 'cancelled') && errorCode && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {userMessage || 'Payment failed'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Error Code: {errorCode} • Category: {errorCategory}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Reference */}
      {checkoutRequestId && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Transaction Reference</p>
              <p className="text-xs text-gray-600 font-mono">{checkoutRequestId}</p>
            </div>
            {onCopyReference && (
              <button
                onClick={() => onCopyReference(checkoutRequestId)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {status === 'failed' && onRetry && (
          <Button
            onClick={onRetry}
            className="flex-1"
            variant="primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {status === 'processing' && onCancel && (
          <Button
            onClick={onCancel}
            className="flex-1"
            variant="outline"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {/* Support Information */}
      {(status === 'failed' || status === 'cancelled') && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact support with your transaction reference
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentStatusMessages;
