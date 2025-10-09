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
  Loader
} from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formSubmissionService, FormSubmissionData, SubmissionStatus } from '../../services/formSubmissionService';
import { toast } from 'react-hot-toast';

interface FormPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  documentType: 'Francisca Resume' | 'Cover Letter';
  onSuccess?: (submissionId: number) => void;
}

export const FormPaymentModal: React.FC<FormPaymentModalProps> = ({
  isOpen,
  onClose,
  formData,
  documentType,
  onSuccess
}) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'payment' | 'processing' | 'completed' | 'failed'>('payment');
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const amount = formSubmissionService.getPricing(documentType);

  // Auto-format phone number as user types
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = value;
    
    if (cleaned.length === 9 && cleaned.startsWith('7')) {
      formatted = `254${cleaned}`;
    } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
      formatted = `254${cleaned.slice(1)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
      formatted = cleaned;
    } else if (cleaned.length <= 9) {
      formatted = cleaned;
    }
    
    setPhone(formatted);
  };

  const validateForm = (): boolean => {
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    
    if (!formSubmissionService.validatePhoneNumber(phone)) {
      toast.error('Please enter a valid Kenyan phone number');
      return false;
    }
    
    return true;
  };

  const initiatePayment = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const submissionData: FormSubmissionData = {
        form_data: formData,
        document_type: documentType,
        phone_number: phone
      };
      
      const response = await formSubmissionService.submitFormWithPayment(submissionData);
      
      if (response.success && response.submission_id) {
        setSubmissionId(response.submission_id);
        setCheckoutRequestId(response.checkout_request_id || '');
        setCurrentStep('processing');
        toast.success('Payment initiated! Check your phone for M-Pesa prompt');
        
        // Start polling for status updates
        startStatusPolling(response.submission_id);
      } else {
        setCurrentStep('failed');
        toast.error(response.error || 'Failed to initiate payment. Please try again.');
      }
    } catch (error: any) {
      setCurrentStep('failed');
      toast.error('Payment initiation failed. Please try again.');
      console.error('Payment initiation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusPolling = (submissionId: number) => {
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const status = await formSubmissionService.checkSubmissionStatus(submissionId);
        setSubmissionStatus(status);
        
        if (status.status === 'completed' || status.status === 'email_sent') {
          setCurrentStep('completed');
          clearInterval(interval);
          setPollingInterval(null);
          toast.success('Your document has been generated and sent to your email!');
          
          if (onSuccess) {
            onSuccess(submissionId);
          }
        } else if (status.status === 'paid') {
          // Payment completed, PDF generation in progress
          toast.info('Payment successful! Generating your document...');
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
    
    // Stop polling after 3 minutes
    setTimeout(() => {
      if (pollingInterval === interval) {
        clearInterval(interval);
        setPollingInterval(null);
        if (currentStep === 'processing') {
          toast.info('Processing is taking longer than expected. Please check your email or try again.');
        }
      }
    }, 180000);
  };

  const handleClose = () => {
    if (currentStep === 'processing') {
      if (window.confirm('Document generation is in progress. Are you sure you want to close?')) {
        // Clear polling interval
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        onClose();
      }
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setPhone('');
    setCurrentStep('payment');
    setSubmissionId(null);
    setCheckoutRequestId('');
    setSubmissionStatus(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const downloadPDF = async () => {
    if (!submissionId) return;
    
    try {
      const response = await formSubmissionService.getDownloadUrl(submissionId);
      if (response.success && response.download_url) {
        // Open download URL in new tab
        window.open(response.download_url, '_blank');
      } else {
        toast.error('Download not available yet. Please check your email.');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed. Please check your email.');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Complete Your Order
        </h3>
        <p className="text-gray-600">
          Pay with M-Pesa to generate your {formSubmissionService.formatDocumentType(documentType)}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="0712345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Smartphone className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter your M-Pesa registered phone number
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Document:</span>
            <span className="font-medium">{formSubmissionService.formatDocumentType(documentType)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Amount:</span>
            <span className="text-lg font-bold text-green-600">
              KES {amount.toLocaleString()}
            </span>
          </div>
        </div>

        <Button
          onClick={initiatePayment}
          disabled={isLoading || !phone.trim()}
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
              Pay KES {amount.toLocaleString()}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderProcessingStatus = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h3 className="text-lg font-semibold">Processing Your Order</h3>
      <p className="text-gray-600">
        {submissionStatus?.status === 'paid' 
          ? 'Payment successful! Generating your document...'
          : 'Please complete payment on your phone'
        }
      </p>
      
      {submissionStatus?.status === 'paid' && (
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <p className="font-medium text-blue-800">What's happening:</p>
          <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
            <li>Generating your {formSubmissionService.formatDocumentType(documentType)}</li>
            <li>Preparing email delivery</li>
            <li>Almost ready!</li>
          </ul>
        </div>
      )}
      
      {submissionStatus?.status === 'pending_payment' && (
        <div className="bg-yellow-50 rounded-lg p-4 text-sm">
          <p className="font-medium text-yellow-800">Next steps:</p>
          <ol className="list-decimal list-inside text-yellow-700 mt-2 space-y-1">
            <li>Check your phone for M-Pesa message</li>
            <li>Enter your M-Pesa PIN when prompted</li>
            <li>Wait for confirmation</li>
          </ol>
        </div>
      )}
    </div>
  );

  const renderCompletedStatus = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-green-800">Order Complete!</h3>
      <p className="text-gray-600">
        Your {formSubmissionService.formatDocumentType(documentType)} has been generated and sent to your email
      </p>
      
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-green-700">
          <Mail className="w-5 h-5" />
          <span className="text-sm font-medium">Check your email for the document</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Button
          onClick={downloadPDF}
          className="w-full"
          variant="primary"
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF
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

  const renderFailedStatus = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-red-800">Something Went Wrong</h3>
      <p className="text-gray-600">
        We encountered an error processing your order
      </p>
      <div className="space-y-2">
        <Button
          onClick={resetForm}
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
      case 'processing':
        return renderProcessingStatus();
      case 'completed':
        return renderCompletedStatus();
      case 'failed':
        return renderFailedStatus();
      default:
        return renderPaymentForm();
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
                  {currentStep === 'payment' ? 'Complete Payment' : 
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

