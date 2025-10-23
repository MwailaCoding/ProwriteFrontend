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
  documentType: 'Prowrite Template Resume' | 'Cover Letter';
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
  const [currentStep, setCurrentStep] = useState<'phone' | 'stk-push' | 'processing' | 'completed' | 'failed'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [error, setError] = useState('');

  const amount = documentType === 'Prowrite Template Resume' ? 500 : 300;

  const initiateSTKPush = async () => {
    // Validate phone number and email
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    
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
      const response = await fetch(`${backendURL}/payments/mpesa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber.trim(),
          amount: amount,
          document_type: documentType,
          form_data: formData,
          user_email: userEmail.trim(),
          user_id: 1 // Default user ID
        })
      });

      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setPaymentData(data);
        setCurrentStep('stk-push');
        toast.success('STK Push sent to your phone! Please check your phone and enter your M-Pesa PIN.');
      } else {
        // Handle specific M-Pesa errors with detailed messages
        let errorMessage = data.error || 'Failed to initiate STK push';
        
        // M-Pesa specific error codes
        if (data.error && data.error.includes('No response from user')) {
          errorMessage = 'Please respond to the STK push on your phone. Check your phone and enter your M-Pesa PIN.';
        } else if (data.error && data.error.includes('1037')) {
          errorMessage = 'STK push was sent but you didn\'t respond. Please try again and enter your M-Pesa PIN when prompted.';
        } else if (data.error && data.error.includes('1032')) {
          errorMessage = 'Payment was cancelled. Please try again if you want to proceed.';
        } else if (data.error && data.error.includes('1031')) {
          errorMessage = 'Unable to lock subscriber. Please try again later.';
        } else if (data.error && data.error.includes('1033')) {
          errorMessage = 'Transaction failed. Please check your M-Pesa balance and try again.';
        } else if (data.error && data.error.includes('2001')) {
          errorMessage = 'Wrong PIN entered. Please try again with the correct PIN.';
        } else if (data.error && data.error.includes('2002')) {
          errorMessage = 'Insufficient funds. Please top up your M-Pesa account and try again.';
        } else if (data.error && data.error.includes('2003')) {
          errorMessage = 'Less than minimum transaction value. Please check the amount.';
        } else if (data.error && data.error.includes('2004')) {
          errorMessage = 'More than maximum transaction value. Please check the amount.';
        } else if (data.error && data.error.includes('2005')) {
          errorMessage = 'Would exceed daily transfer limit. Please try again tomorrow.';
        } else if (data.error && data.error.includes('2006')) {
          errorMessage = 'Would exceed minimum balance. Please check your account balance.';
        } else if (data.error && data.error.includes('Network error')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else if (data.error && data.error.includes('Rate limited')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        }
        setError(errorMessage);
        setCurrentStep('failed');
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('STK Push initiation error:', error);
      
      let errorMessage = 'Failed to initiate STK push';
      
      // Handle different types of errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Authentication failed')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('Access denied')) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('Server error')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Service temporarily unavailable')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setCurrentStep('failed');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    if (!paymentData?.checkout_request_id) {
      toast.error('No payment session found');
      return;
    }

        setCurrentStep('processing');
    toast.success('Payment initiated! Checking status...');
          pollForCompletion();
  };

  const pollForCompletion = async () => {
    if (!paymentData?.checkout_request_id) return;

    let pollCount = 0;
    const maxPolls = 10; // Maximum 10 polls (30 seconds)
    const pollInterval = 3000; // 3 seconds between polls

    const poll = async () => {
      pollCount++;
      
      // Stop polling after max attempts
      if (pollCount > maxPolls) {
        setCurrentStep('failed');
        setError('Payment status check timed out. Please check your payment manually.');
        toast.error('Payment status check timed out. Please check your payment manually.');
        return;
      }

      try {
        // Use absolute URL to ensure it goes to the backend
        const backendURL = 'https://prowrite.pythonanywhere.com/api';
        const response = await fetch(`${backendURL}/payments/mpesa/status/${paymentData.checkout_request_id}`);
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - wait longer before next poll
            console.log('Rate limited, waiting longer...');
            setTimeout(poll, pollInterval * 2);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          if (data.status === 'completed') {
            setCurrentStep('completed');
            setSubmissionData({
              reference: data.payment_id || paymentData.checkout_request_id,
              payment_id: data.payment_id
            });
            toast.success('✅ Payment completed! Document ready for download!');
            if (onSuccess) {
              onSuccess(data.payment_id);
            }
          } else if (data.status === 'pending') {
            // Continue polling with rate limiting
            setTimeout(poll, pollInterval);
          } else if (data.status === 'failed') {
            // Handle specific failure reasons
            let errorMessage = data.error || 'Payment failed';
            
            // M-Pesa specific failure codes
            if (data.error && data.error.includes('1032')) {
              errorMessage = 'Payment was cancelled by user. Please try again if you want to proceed.';
            } else if (data.error && data.error.includes('1037')) {
              errorMessage = 'No response from user. Please check your phone and respond to the STK push.';
            } else if (data.error && data.error.includes('2002')) {
              errorMessage = 'Insufficient funds. Please top up your M-Pesa account and try again.';
            } else if (data.error && data.error.includes('2001')) {
              errorMessage = 'Wrong PIN entered. Please try again with the correct PIN.';
            }
            
            setCurrentStep('failed');
            setError(errorMessage);
            toast.error(errorMessage);
          }
        } else {
          // Handle API response errors
          let errorMessage = data.error || 'Payment status check failed';
          
          if (data.error && data.error.includes('Rate limited')) {
            errorMessage = 'Too many status checks. Please wait a moment before trying again.';
          } else if (data.error && data.error.includes('Payment not found')) {
            errorMessage = 'Payment record not found. Please try initiating a new payment.';
          }
          
          setCurrentStep('failed');
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (error: any) {
        console.error('Polling error:', error);
        
        // If it's a network error, try again with longer delay
        if (error.message.includes('timeout') || error.message.includes('network')) {
          console.log('Network error, retrying with longer delay...');
          setTimeout(poll, pollInterval * 2);
          return;
        }
        
        setCurrentStep('failed');
        setError('Failed to check payment status');
        toast.error('Failed to check payment status');
      }
    };
    
    // Start polling after a short delay
    setTimeout(poll, 3000);
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
    setPhoneNumber('');
    setUserEmail('');
    setCurrentStep('phone');
    setPaymentData(null);
    setError('');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const renderPhoneInput = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          M-Pesa STK Push Payment
        </h3>
        <p className="text-gray-600">
          Enter your phone number to receive a payment prompt
        </p>
      </div>

      {/* Phone Number Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📱 Phone Number *
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="254XXXXXXXXX (e.g., 254712345678)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-600 mt-1">
          Use format: 254XXXXXXXXX (e.g., 254712345678)
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

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="text-lg font-bold text-green-600">
            KES {amount.toLocaleString()}
          </span>
        </div>
      </div>

      <Button
        onClick={initiateSTKPush}
        disabled={isLoading || !phoneNumber.trim() || !userEmail.trim()}
        className="w-full"
        variant="primary"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Sending STK Push...
          </>
        ) : (
          <>
            <Smartphone className="w-5 h-5 mr-2" />
            Send STK Push
          </>
        )}
      </Button>
    </div>
  );

  const renderSTKPush = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          STK Push Sent!
        </h3>
        <p className="text-gray-600">
          Check your phone for the M-Pesa payment prompt and enter your PIN
        </p>
      </div>

      {paymentData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Checkout ID:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">{paymentData.checkout_request_id}</span>
              <button
                onClick={() => copyToClipboard(paymentData.checkout_request_id)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">What to do next:</h4>
        <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
          <li>Check your phone for M-Pesa prompt</li>
          <li>Enter your M-Pesa PIN when prompted</li>
          <li>Wait for payment confirmation</li>
          <li>Your document will be generated automatically</li>
        </ol>
      </div>

      <Button
        onClick={startPolling}
        disabled={isLoading}
        className="w-full"
        variant="primary"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Checking Status...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Check Payment Status
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
      
      {/* SIMPLE DOWNLOAD BUTTON - ALWAYS VISIBLE */}
      {submissionData && submissionData.reference && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mt-4">
          <h3 className="text-green-800 font-bold text-center mb-4 text-xl">
            ✅ YOUR PDF IS READY!
          </h3>
          <p className="text-green-700 text-center mb-4">
            Reference: <strong>{submissionData.reference}</strong>
          </p>
          
          <button
            onClick={() => {
              const url = `https://prowrite.pythonanywhere.com/api/downloads/resume_${submissionData.reference}.pdf`;
              console.log('🚀 Downloading PDF:', url);
              
              // Open in new tab
              window.open(url, '_blank');
              
              // Also download
              const link = document.createElement('a');
              link.href = url;
              link.download = `resume_${submissionData.reference}.pdf`;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              toast.success('🚀 PDF downloaded! Check your downloads folder!');
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            📥 DOWNLOAD YOUR PDF NOW
          </button>
          
          <p className="text-green-600 text-sm mt-3 text-center">
            This button works immediately - no waiting!
          </p>
        </div>
      )}
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
      case 'stk-push':
        return renderSTKPush();
      case 'processing':
        return renderProcessing();
      case 'completed':
        return renderCompleted();
      case 'failed':
        return renderFailed();
      default:
        return renderPhoneInput();
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
                  {currentStep === 'phone' ? 'M-Pesa Payment' : 
                   currentStep === 'stk-push' ? 'STK Push Sent' :
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