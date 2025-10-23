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
import PaymentStatusMessages from './PaymentStatusMessages';
import { toast } from 'react-hot-toast';

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (paymentId: string) => void;
  amount: number;
  documentType: string;
  formData?: any;
}

interface PaymentData {
  checkout_request_id: string;
  merchant_request_id: string;
  phone_number: string;
}

interface SubmissionData {
  reference: string;
  payment_id: string;
}

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  documentType,
  formData
}) => {
  const [currentStep, setCurrentStep] = useState<'phone' | 'stk-push' | 'processing' | 'completed' | 'failed'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [pollingAttempt, setPollingAttempt] = useState<number>(0);
  const [paymentCancelled, setPaymentCancelled] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('phone');
      setPhoneNumber('');
      setIsLoading(false);
      setError(null);
      setPaymentData(null);
      setSubmissionData(null);
      setStatusMessage('');
      setPollingAttempt(0);
      setPaymentCancelled(false);
      setStartTime(null);
    }
  }, [isOpen]);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^254[0-9]{9}$/;
    return phoneRegex.test(cleanPhone);
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.startsWith('0')) {
      return '254' + cleanPhone.substring(1);
    }
    if (cleanPhone.startsWith('254')) {
      return cleanPhone;
    }
    return '254' + cleanPhone;
  };

  const initiateSTKPush = async (phone: string) => {
    try {
    setIsLoading(true);
      setError(null);
    
      const response = await fetch('https://prowrite.pythonanywhere.com/api/payments/mpesa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phone_number: phone,
          amount: amount,
          document_type: documentType,
          form_data: formData
        })
      });

      if (!response.ok) {
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
        setPaymentData({
          checkout_request_id: data.checkout_request_id,
          merchant_request_id: data.merchant_request_id,
          phone_number: phone
        });
        setCurrentStep('stk-push');
        toast.success('STK Push sent! Check your phone for M-Pesa prompt.');
      } else {
        let errorMessage = data.error || 'Failed to initiate STK push';
        
        // M-Pesa specific error codes
        if (data.error && data.error.includes('1037')) {
          errorMessage = 'No response from user. Please check your phone and respond to the STK push.';
        } else if (data.error && data.error.includes('1032')) {
          errorMessage = 'Payment was cancelled. Please try again if you want to proceed.';
        } else if (data.error && data.error.includes('2001')) {
          errorMessage = 'Wrong PIN entered. Please try again with the correct PIN.';
        } else if (data.error && data.error.includes('2002')) {
          errorMessage = 'Insufficient funds. Please top up your M-Pesa account and try again.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('STK Push initiation error:', error);
      let errorMessage = 'Failed to initiate STK push';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Rate limited')) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
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

  const pollForCompletion = async () => {
    if (!paymentData?.checkout_request_id) return;

    let pollCount = 0;
    const maxPolls = 3;
    const pollInterval = 10000;
    let isPolling = true;
    setStartTime(Date.now());

    const poll = async (): Promise<void> => {
      if (!isPolling) return;
      
      pollCount++;
      setPollingAttempt(pollCount);
      
      // Update status message based on poll attempt
      if (pollCount === 1) {
        setStatusMessage('Checking payment status...');
      } else if (pollCount === 2) {
        setStatusMessage('Still waiting for confirmation...');
      } else if (pollCount === 3) {
        setStatusMessage('Final check...');
      }
      
      if (pollCount > maxPolls) {
        isPolling = false;
        setStatusMessage('Payment verification timed out. Please check your M-Pesa messages.');
        setCurrentStep('failed');
        setError('Payment status check timed out. Please check your payment manually.');
        toast.error('Payment status check timed out. Please check your payment manually.');
        return;
      }

      try {
        const backendURL = 'https://prowrite.pythonanywhere.com/api';
        const response = await fetch(`${backendURL}/payments/mpesa/status/${paymentData.checkout_request_id}`);
        
        if (!response.ok) {
          if (response.status === 429) {
            setStatusMessage('Rate limit exceeded. Please wait a moment...');
            isPolling = false;
            setCurrentStep('failed');
            setError('Rate limit exceeded. Please wait 5-10 minutes before trying again.');
            toast.error('Rate limit exceeded. Please wait 5-10 minutes before trying again.');
            return;
          } else if (response.status === 400) {
            try {
              const data = await response.json();
              if (data.error && data.error.includes('Rate limited')) {
                setStatusMessage('Rate limit exceeded. Please wait a moment...');
                isPolling = false;
                setCurrentStep('failed');
                setError('Rate limit exceeded. Please wait 5-10 minutes before trying again.');
                toast.error('Rate limit exceeded. Please wait 5-10 minutes before trying again.');
                return;
              }
            } catch (e) {
              // Continue with error handling
            }
          }
          // Suppress console logs for user-facing errors
          setStatusMessage('Unable to check payment status. Please try again.');
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          if (data.status === 'completed') {
            isPolling = false;
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
            if (pollCount < maxPolls && isPolling) {
              console.log(`Payment still pending, polling again in ${pollInterval/1000} seconds...`);
              setTimeout(poll, pollInterval);
            } else {
              isPolling = false;
              setCurrentStep('failed');
              setError('Payment is taking longer than expected. Please check your payment manually.');
              toast.error('Payment is taking longer than expected. Please check your payment manually.');
            }
          } else if (data.status === 'failed') {
            isPolling = false;
            let errorMessage = data.error || 'Payment failed';
            
            if (data.error && data.error.includes('1032')) {
              errorMessage = 'Payment was cancelled by user. Returning to payment screen...';
              setPaymentCancelled(true);
              setStatusMessage('Payment cancelled. Returning to payment screen...');
              toast.error('Payment was cancelled. You can try again.');
              // Auto-return to phone input after 3 seconds
              setTimeout(() => {
                setCurrentStep('phone');
                setPaymentCancelled(false);
                setStatusMessage('');
                setPollingAttempt(0);
              }, 3000);
              return;
            } else if (data.error && data.error.includes('1037')) {
              errorMessage = 'No response from user. Returning to payment screen...';
              setPaymentCancelled(true);
              setStatusMessage('No response from user. Returning to payment screen...');
              toast.error('No response from user. Please check your phone and try again.');
              // Auto-return to phone input after 3 seconds
              setTimeout(() => {
                setCurrentStep('phone');
                setPaymentCancelled(false);
                setStatusMessage('');
                setPollingAttempt(0);
              }, 3000);
              return;
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
          isPolling = false;
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
        
        if (error.message.includes('timeout') || error.message.includes('network')) {
          if (pollCount === 1) {
            console.log('Network error, retrying with longer delay...');
            setTimeout(poll, pollInterval * 2);
            return;
          }
        }
        
        isPolling = false;
        setCurrentStep('failed');
        setError('Failed to check payment status');
        toast.error('Failed to check payment status');
      }
    };
    
    console.log('Starting payment status polling...');
    setTimeout(poll, 5000);
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

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!validatePhoneNumber(formattedPhone)) {
      setError('Please enter a valid Kenyan phone number (e.g., 254712345678)');
      return;
    }
    
    setCurrentStep('processing');
    toast.success('Payment initiated! Checking status...');
    initiateSTKPush(formattedPhone);
  };

  const renderPhoneInput = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">M-Pesa Payment</h3>
        <p className="text-gray-600">Enter your phone number to receive STK Push</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Amount:</span>
          <span className="text-lg font-bold text-gray-900">KES {amount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Document:</span>
          <span className="text-sm text-gray-600">{documentType}</span>
        </div>
      </div>

      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
        </label>
        <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="254712345678"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
          <p className="text-xs text-gray-500 mt-1">
            Enter your phone number (e.g., 254712345678)
        </p>
      </div>

      <Button
          type="submit"
        disabled={isLoading}
        className="w-full"
        variant="primary"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
              Initiating Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
              Pay with M-Pesa
          </>
        )}
      </Button>
      </form>
    </div>
  );

  const renderSTKPush = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      
      <h3 className="text-lg font-semibold">STK Push Sent!</h3>
        <p className="text-gray-600">
        Check your phone for M-Pesa prompt and enter your PIN
      </p>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">What to do next:</h4>
        <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
          <li>Check your phone for M-Pesa prompt</li>
          <li>Enter your M-Pesa PIN when prompted</li>
          <li>Wait for payment confirmation</li>
          <li>Your document will be generated automatically</li>
        </ol>
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

      <Button
        onClick={() => {
          setCurrentStep('processing');
          pollForCompletion();
        }}
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

  const renderProcessing = () => {
    const elapsedTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    return (
      <div className="space-y-4">
        <PaymentStatusMessages
          status="processing"
          message={statusMessage || "Processing Your Order"}
          pollingAttempt={pollingAttempt}
          maxPolls={3}
          elapsedTime={elapsedTime}
          checkoutRequestId={paymentData?.checkout_request_id}
          onCancel={() => {
            setCurrentStep('phone');
            setStatusMessage('');
            setPollingAttempt(0);
            setStartTime(null);
          }}
          onCopyReference={(text) => copyToClipboard(text)}
        />

        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <p className="font-medium text-gray-800 mb-2">What's happening:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Checking payment status with M-Pesa</li>
            <li>Waiting for payment confirmation</li>
            <li>Will generate your {documentType} once confirmed</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderProcessingWithDownload = () => (
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
              
              window.open(url, '_blank');
              
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

  const renderFailed = () => {
    // Extract error code from error message if available
    const errorCode = error?.includes('1032') ? '1032' : 
                     error?.includes('1037') ? '1037' : 
                     error?.includes('2001') ? '2001' : 
                     error?.includes('2002') ? '2002' : undefined;
    
    const errorCategory = errorCode ? 
      (['1032', '1037'].includes(errorCode) ? 'user_action_required' :
       ['2001', '2002'].includes(errorCode) ? 'payment_issue' : 'system_error') : 
      'system_error';

    return (
      <div className="space-y-4">
        <PaymentStatusMessages
          status="failed"
          message="Something Went Wrong"
          errorCode={errorCode}
          errorCategory={errorCategory}
          userMessage={error}
          checkoutRequestId={paymentData?.checkout_request_id}
          onRetry={() => setCurrentStep('phone')}
          onCopyReference={(text) => copyToClipboard(text)}
        />

        <div className="space-y-2">
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
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'phone':
        return renderPhoneInput();
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

export default MpesaPaymentModal;