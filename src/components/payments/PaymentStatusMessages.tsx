import React from 'react';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, CheckCircle, Copy, RefreshCw, LifeBuoy } from 'lucide-react';
import { Button } from '../common/Button';

interface PaymentStatusMessagesProps {
  status: 'processing' | 'completed' | 'failed';
  message: string;
  pollingAttempt?: number;
  maxPolls?: number;
  elapsedTime?: number;
  errorCode?: string;
  errorCategory?: 'user_action_required' | 'payment_issue' | 'technical_issue' | 'system_error';
  userMessage?: string | null;
  checkoutRequestId?: string | null;
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
  onCopyReference,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader className="w-6 h-6 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Loader className="w-6 h-6 animate-spin text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getProgressPercentage = () => {
    if (status === 'completed') return 100;
    if (status === 'failed') return 0;
    return Math.min((pollingAttempt / maxPolls) * 100, 90);
  };

  const getErrorMessage = () => {
    if (userMessage) return userMessage;
    
    switch (errorCategory) {
      case 'user_action_required':
        return 'Please check your phone and respond to the M-Pesa prompt.';
      case 'payment_issue':
        return 'There was an issue with your payment. Please check your M-Pesa balance and try again.';
      case 'technical_issue':
        return 'We\'re experiencing technical difficulties. Please try again in a moment.';
      case 'system_error':
        return 'System error occurred. Please contact support if this persists.';
      default:
        return 'Payment failed. Please try again.';
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    if (status === 'failed') {
      if (errorCategory === 'user_action_required' || errorCategory === 'payment_issue') {
        buttons.push(
          <Button
            key="retry"
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        );
      }
      
      buttons.push(
        <Button
          key="cancel"
          onClick={onCancel}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg"
        >
          Cancel
        </Button>
      );
    }

    if (status === 'processing' && pollingAttempt > 0) {
      buttons.push(
        <Button
          key="cancel-processing"
          onClick={onCancel}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg"
        >
          Cancel
        </Button>
      );
    }

    return buttons;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-lg border-2 ${getStatusColor()}`}
    >
      {/* Header with Icon and Status */}
      <div className="flex items-center gap-3 mb-4">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {status === 'processing' && 'Processing Payment'}
            {status === 'completed' && 'Payment Successful'}
            {status === 'failed' && 'Payment Failed'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
      </div>

      {/* Progress Bar for Processing */}
      {status === 'processing' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Poll {pollingAttempt} of {maxPolls}
            </span>
            <span className="text-sm text-gray-500">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Error Details for Failed Payments */}
      {status === 'failed' && (
        <div className="mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">What happened?</h4>
            <p className="text-red-700 text-sm mb-3">{getErrorMessage()}</p>
            
            {errorCode && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <span>Error Code: {errorCode}</span>
                {onCopyReference && (
                  <button
                    onClick={() => onCopyReference(`Error Code: ${errorCode}`)}
                    className="flex items-center gap-1 hover:text-red-800"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reference Information */}
      {checkoutRequestId && (
        <div className="mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reference ID:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {checkoutRequestId}
                </code>
                {onCopyReference && (
                  <button
                    onClick={() => onCopyReference(checkoutRequestId)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {getActionButtons().length > 0 && (
        <div className="flex gap-3">
          {getActionButtons()}
        </div>
      )}

      {/* Support Information for System Errors */}
      {status === 'failed' && errorCategory === 'system_error' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <LifeBuoy className="w-4 h-4" />
            <span>Need help? Contact support with the reference ID above.</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentStatusMessages;