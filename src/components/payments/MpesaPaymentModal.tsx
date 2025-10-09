import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Mail,
  FileText,
  Loader,
  RefreshCw,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  documentType: 'Francisca Resume' | 'Cover Letter';
  onSuccess?: (submissionId: number) => void;
}

interface PaymentSubmission {
  submission_id: number;
  reference: string;
  amount: number;
  till_number: string;
  till_name: string;
  document_type: string;
  message: string;
}

export const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  formData,
  documentType,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<'instructions' | 'validation' | 'processing' | 'completed' | 'failed'>('instructions');
  const [transactionCode, setTransactionCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submissionData, setSubmissionData] = useState<PaymentSubmission | null>(null);
  const [error, setError] = useState('');

  const amount = documentType === 'Francisca Resume' ? 500 : 300;

  const initiatePayment = async () => {
    // Validate email before proceeding
    if (!userEmail.trim()) {
      toast.error('Please enter your email address for PDF delivery');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use absolute URL to ensure it goes to the backend
      const backendURL = 'https://prowrite.pythonanywhere.com/api';
      const response = await fetch(`${backendURL}/payments/manual/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_data: formData,
          document_type: documentType,
          user_email: userEmail.trim(),
          phone_number: userEmail.trim() // Add phone number field that backend might expect
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSubmissionData(data);
        setCurrentStep('validation');
        toast.success('Payment instructions generated!');
      } else {
        setError(data.error || 'Failed to initiate payment');
        setCurrentStep('failed');
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      setError('Failed to initiate payment');
      setCurrentStep('failed');
      toast.error('Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const validateTransaction = async () => {
    if (!transactionCode.trim()) {
      toast.error('Please enter transaction code');
      return;
    }

    if (!submissionData) {
      toast.error('No payment session found');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Use absolute URL to ensure it goes to the backend
      const backendURL = 'https://prowrite.pythonanywhere.com/api';
      const fullURL = `${backendURL}/payments/manual/validate`;
      console.log('🚀 ULTRA-FAST VALIDATION - Making API call to:', fullURL);
      console.log('🚀 ULTRA-FAST VALIDATION - Transaction code:', transactionCode.trim().toUpperCase());
      console.log('🚀 ULTRA-FAST VALIDATION - Reference:', submissionData.reference);
      console.log('🚀 ULTRA-FAST VALIDATION - Timestamp:', new Date().toISOString());
      
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          transaction_code: transactionCode.trim().toUpperCase(),
          reference: submissionData.reference
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('🚀 ULTRA-FAST VALIDATION - SUCCESS!', data);
        setCurrentStep('processing');
        toast.success('🚀 Payment validated! PDF is being generated in background...');
        pollForCompletion();
      } else {
        setError(data.error || 'Validation failed');
        
        if (data.fallback === 'admin_confirmation') {
          toast.info('Payment will be confirmed by admin shortly');
          setCurrentStep('processing');
          pollForCompletion();
        } else {
          toast.error(data.error || 'Validation failed');
        }
      }
    } catch (error: any) {
      setError('Validation failed');
      toast.error('Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const pollForCompletion = async () => {
    if (!submissionData) return;

    const poll = async () => {
      try {
        // Use absolute URL to ensure it goes to the backend
        const backendURL = 'https://prowrite.pythonanywhere.com/api';
        const response = await fetch(`${backendURL}/payments/manual/status/${submissionData.reference}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          if (data.status === 'completed') {
            setCurrentStep('completed');
            toast.success('Document generated and sent to your email!');
            if (onSuccess) {
              onSuccess(data.submission_id);
            }
          } else if (data.status === 'processing') {
            // Ultra-fast polling for processing status
            setTimeout(poll, 1000); // Poll every 1 second instead of 3
          } else if (data.status === 'paid') {
            setTimeout(poll, 2000); // Poll every 2 seconds for paid status
          } else if (data.status === 'pending_admin_confirmation') {
            setTimeout(poll, 3000); // Reduced from 5 to 3 seconds
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Retry faster on error
        setTimeout(poll, 2000);
      }
    };
    
    poll();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleClose = () => {
    if (currentStep === 'processing') {
      if (window.confirm('Document generation is in progress. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setTransactionCode('');
    setUserEmail('');
    setCurrentStep('instructions');
    setSubmissionData(null);
    setError('');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const renderInstructions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Instructions
        </h3>
        <p className="text-gray-600">
          Pay with M-Pesa to generate your {documentType}
        </p>
      </div>

      {/* Email Input for PDF Delivery */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📧 Email for PDF Delivery *
        </label>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-600 mt-1">
          Your generated PDF will be sent to this email address
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Till Number:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-semibold text-lg">6340351</span>
            <button
              onClick={() => copyToClipboard('6340351')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Till Name:</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">FRANCISCA MAJALA MWAILA</span>
            <button
              onClick={() => copyToClipboard('FRANCISCA MAJALA MWAILA')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="text-lg font-bold text-green-600">
            KES {amount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">How to Pay:</h4>
        <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
          <li>Go to M-Pesa menu on your phone</li>
          <li>Select "Pay Bill"</li>
          <li>Enter Till Number: <span className="font-mono font-semibold">6340351</span></li>
          <li>Enter Amount: <span className="font-semibold">KES {amount}</span></li>
          <li>Enter your M-Pesa PIN</li>
          <li>Wait for confirmation SMS</li>
        </ol>
      </div>

      <Button
        onClick={initiatePayment}
        disabled={isLoading}
        className="w-full"
        variant="primary"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Generating Instructions...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Continue to Payment
          </>
        )}
      </Button>
    </div>
  );

  const renderValidation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enter Transaction Code
        </h3>
        <p className="text-gray-600">
          Enter the transaction code from your M-Pesa SMS
        </p>
      </div>

      {submissionData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Reference:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">{submissionData.reference}</span>
              <button
                onClick={() => copyToClipboard(submissionData.reference)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Code
        </label>
        <input
          type="text"
          value={transactionCode}
          onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
          placeholder="e.g., QGH7X8K9"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-lg"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the transaction code from your M-Pesa confirmation SMS
        </p>
      </div>

      <Button
        onClick={validateTransaction}
        disabled={isLoading || !transactionCode.trim()}
        className="w-full"
        variant="primary"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Validating Payment...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Validate Payment
          </>
        )}
      </Button>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h3 className="text-lg font-semibold">Processing Your Order</h3>
      <p className="text-gray-600">
        Payment confirmed! Generating your document...
      </p>
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <p className="font-medium text-blue-800">What's happening:</p>
        <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
          <li>Generating your {documentType}</li>
          <li>Preparing email delivery</li>
          <li>Almost ready!</li>
        </ul>
      </div>
    </div>
  );

  const renderCompleted = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-green-800">Order Complete!</h3>
      <p className="text-gray-600">
        Your {documentType} has been generated and sent to your email
      </p>
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Check your email for the document</span>
        </div>
      </div>
      <Button
        onClick={onClose}
        className="w-full"
        variant="primary"
      >
        Close
      </Button>
    </div>
  );

  const renderFailed = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-red-800">Something Went Wrong</h3>
      <p className="text-gray-600">
        {error || 'We encountered an error processing your order'}
      </p>
      <div className="space-y-2">
        <Button
          onClick={() => setCurrentStep('instructions')}
          className="w-full"
          variant="secondary"
        >
          Try Again
        </Button>
        <Button
          onClick={onClose}
          className="w-full"
          variant="outline"
        >
          Close
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'validation':
        return renderValidation();
      case 'processing':
        return renderProcessing();
      case 'completed':
        return renderCompleted();
      case 'failed':
        return renderFailed();
      default:
        return renderInstructions();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentStep === 'instructions' ? 'Payment Instructions' : 
                   currentStep === 'validation' ? 'Validate Payment' :
                   currentStep === 'processing' ? 'Processing' :
                   currentStep === 'completed' ? 'Order Complete' : 'Error'}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {renderContent()}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};