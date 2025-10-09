import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Copy,
  Loader,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import api from '../../config/api';
import PDFDownloadModal from './PDFDownloadModal';

interface ManualPaymentModalProps {
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

interface ValidationResult {
  success: boolean;
  message?: string;
  error?: string;
  error_code?: string;
  fallback?: string;
  submission_id?: number;
  status?: string;
  validation_method?: string;
  auto_download?: boolean;
  download_url?: string;
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
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
  const [retryCount, setRetryCount] = useState(0);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const [maxRetries] = useState(10);
  const maxPollingTime = 60000; // 60 seconds timeout
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [pdfReady, setPdfReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'downloaded' | 'failed'>('idle');
  const [showPDFDownloadModal, setShowPDFDownloadModal] = useState(false);

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
      const errorMessage = error.response?.data?.error || error.message || 'Failed to initiate payment';
      setError(errorMessage);
      setCurrentStep('failed');
      toast.error(errorMessage);
      console.error('Payment initiation error:', error);
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
      console.log('🚀 ULTRA-FAST MANUAL VALIDATION - Making API call to:', `${backendURL}/payments/manual/validate`);
      console.log('🚀 ULTRA-FAST MANUAL VALIDATION - Transaction code:', transactionCode.trim().toUpperCase());
      console.log('🚀 ULTRA-FAST MANUAL VALIDATION - Reference:', submissionData.reference);
      console.log('🚀 ULTRA-FAST MANUAL VALIDATION - Timestamp:', new Date().toISOString());
      
      const response = await fetch(`${backendURL}/payments/manual/validate`, {
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

      const data: ValidationResult = await response.json();
      
      if (data.success) {
        console.log('🚀 ULTRA-FAST MANUAL VALIDATION - SUCCESS!', data);
        setCurrentStep('processing');
        toast.success('🚀 Payment validated! PDF is being generated...');
        
        // IMMEDIATE TRANSITION TO PDF DOWNLOAD MODAL - No more slow polling!
        console.log('🚀 IMMEDIATE TRANSITION - Opening PDF Download Modal in 3 seconds...');
        
        setTimeout(() => {
          console.log('🚀 Opening PDF Download Modal...');
          setCurrentStep('completed');
          setPdfReady(true);
          setDownloadUrl(`https://prowrite.pythonanywhere.com/api/downloads/resume_${submissionData.reference}.pdf`);
          setShowPDFDownloadModal(true);
          toast.success('✅ Your document is ready!');
        }, 3000); // 3 seconds for PDF generation
      } else {
        setError(data.error || 'Validation failed');
        
        if (data.fallback === 'admin_confirmation') {
          toast.info('Payment will be confirmed by admin shortly');
          setCurrentStep('processing');
          // Start polling for admin confirmation
          pollForCompletion();
        } else {
          toast.error(data.error || 'Validation failed');
        }
      }
    } catch (error: any) {
      setError('Validation failed');
      toast.error('Validation failed');
      console.error('Validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pollForCompletion = async () => {
    if (!submissionData) return;

    // Set polling start time
    setPollingStartTime(Date.now());

    const poll = async () => {
      // Check for timeout
      if (pollingStartTime && Date.now() - pollingStartTime > maxPollingTime) {
        console.log('⏰ Polling timeout reached, stopping...');
        toast.error('Processing is taking longer than expected. Please check your email or contact support.');
        setCurrentStep('failed');
        return;
      }
      try {
        // Use absolute URL to ensure it goes to the backend
        const backendURL = 'https://prowrite.pythonanywhere.com/api';
        const response = await fetch(`${backendURL}/payments/manual/status/${submissionData.reference}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log('📊 Polling response:', data);
          console.log('📊 Status:', data.status);
          console.log('📊 PDF Ready:', data.pdf_ready);
          console.log('📊 Download URL:', data.download_url);
          
          // Check for completion with multiple possible status values
          if (data.status === 'completed' || data.status === 'processed' || data.pdf_ready || data.download_url) {
            setCurrentStep('completed');
            setPdfReady(true);
            toast.success('Document generated and sent to your email!');
            
            console.log('🎯 PDF completed - Download URL:', downloadUrl);
            console.log('🎯 PDF completed - PDF Ready:', data.pdf_ready);
            console.log('🎯 PDF completed - Download URL from response:', data.download_url);
            
            // Auto-download if available - improved logic
            if (data.pdf_ready) {
              // Try multiple possible download URL patterns
              const possibleUrls = [
                `https://prowrite.pythonanywhere.com/api/downloads/resume_${submissionData.reference}.pdf`,
                `https://prowrite.pythonanywhere.com/api/payments/download/${submissionData.reference}`,
                `https://prowrite.pythonanywhere.com/api/resumes/download/${submissionData.reference}`,
                `https://prowrite.pythonanywhere.com/static/resumes/resume_${submissionData.reference}.pdf`
              ];
              
              console.log('📥 Auto-download triggered - trying URLs:', possibleUrls);
              setDownloadUrl(possibleUrls[0]); // Use first URL as primary
              setTimeout(() => {
                handleAutoDownload();
              }, 1000);
            } else if (data.download_url) {
              console.log('📥 Auto-download triggered from response data');
              setDownloadUrl(data.download_url);
              setTimeout(() => {
                handleAutoDownload();
              }, 1000);
            } else if (downloadUrl) {
              console.log('📥 Auto-download triggered from stored URL');
              setTimeout(() => {
                handleAutoDownload();
              }, 1000);
            } else {
              console.log('⚠️ Auto-download not triggered - missing data');
              console.log('   downloadUrl:', downloadUrl);
              console.log('   data.pdf_ready:', data.pdf_ready);
              console.log('   data.download_url:', data.download_url);
            }
            
            if (onSuccess) {
              onSuccess(data.submission_id);
            }
          } else if (data.status === 'processing' || data.status === 'generating' || data.status === 'paid') {
            // Ultra-fast polling for processing status
            console.log('🔄 Still processing, polling again in 1 second...');
            setTimeout(poll, 1000); // Poll every 1 second
          } else if (data.status === 'pending_admin_confirmation') {
            // Admin confirmation pending
            console.log('⏳ Waiting for admin confirmation...');
            setTimeout(poll, 3000);
          } else {
            // Unknown status - log it and continue polling
            console.log('❓ Unknown status:', data.status, '- continuing to poll...');
            setTimeout(poll, 2000);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        setRetryCount(prev => prev + 1);
        // Retry faster on error
        setTimeout(poll, 2000);
        
        if (retryCount >= maxRetries) {
          toast.error('Unable to verify payment status. Please check your email or contact support.');
        } else {
          setTimeout(poll, 3000);
        }
      }
    };
    
    poll();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleAutoDownload = async () => {
    if (!downloadUrl) {
      console.log('❌ No download URL available');
      toast.error('❌ Download URL not available');
      return;
    }
    
    setDownloading(true);
    setDownloadStatus('downloading');
    
    try {
      console.log('📥 DOWNLOADING PDF FILE:', downloadUrl);
      toast.success('📥 DOWNLOADING PDF FILE NOW...', { duration: 3000 });
      
      // Try multiple download URL patterns
      const possibleUrls = [
        downloadUrl,
        `https://prowrite.pythonanywhere.com/api/downloads/resume_${submissionData?.reference}.pdf`,
        `https://prowrite.pythonanywhere.com/api/payments/download/${submissionData?.reference}`,
        `https://prowrite.pythonanywhere.com/api/resumes/download/${submissionData?.reference}`,
        `https://prowrite.pythonanywhere.com/static/resumes/resume_${submissionData?.reference}.pdf`
      ];
      
      let downloadSuccess = false;
      
      for (const url of possibleUrls) {
        try {
          console.log('📥 Trying download URL:', url);
          
          // FORCE DOWNLOAD - NOT OPEN IN TAB
          const link = document.createElement('a');
          link.href = url;
          link.download = `resume_${submissionData?.reference || 'document'}.pdf`;
          link.style.display = 'none';
          
          // Add to DOM, click, and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log('📥 PDF FILE DOWNLOAD INITIATED from:', url);
          downloadSuccess = true;
          break;
          
        } catch (urlError) {
          console.log('❌ Download failed for URL:', url, urlError);
          continue;
        }
      }
      
      if (downloadSuccess) {
        setDownloadStatus('downloaded');
        toast.success('✅ PDF FILE DOWNLOADED! Check your Downloads folder!', { 
          duration: 5000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }
        });
      } else {
        throw new Error('All download URLs failed');
      }
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      setDownloadStatus('failed');
      toast.error('❌ Download failed. Please try again.', {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '16px'
        }
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleManualDownload = () => {
    if (downloadUrl) {
      handleAutoDownload();
    } else {
      toast.error('Download not available yet');
    }
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
    setRetryCount(0);
    setDownloadUrl('');
    setPdfReady(false);
    setDownloading(false);
  };

  const retryPayment = () => {
    if (retryCount < maxRetries) {
      setCurrentStep('instructions');
      setRetryCount(prev => prev + 1);
      setError('');
    } else {
      toast.error('Maximum retry attempts reached. Please contact support.');
    }
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

      {retryCount > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Retry attempt: {retryCount}/{maxRetries}
        </p>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
      <h3 className="text-xl font-semibold">Generating Your Document</h3>
      <p className="text-gray-600 text-lg">
        Payment confirmed! Your {documentType} is being created...
      </p>
      
      {/* Progress Indicator */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
        <p className="text-blue-800 font-medium">This will take about 3 seconds...</p>
        <p className="text-blue-600 text-sm mt-2">Your download interface will appear automatically</p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-medium">✨ What happens next:</p>
        <ul className="text-green-700 text-sm mt-2 space-y-1">
          <li>• PDF preview will open automatically</li>
          <li>• Download buttons for PDF and DOCX</li>
          <li>• Share link generation</li>
          <li>• Collaboration features</li>
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
      
      {/* Download Status Indicators */}
      {downloadStatus === 'downloading' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-blue-700">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">📥 Downloading PDF to your device...</span>
          </div>
        </div>
      )}
      
      {downloadStatus === 'downloaded' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">✅ PDF downloaded to your device storage!</span>
          </div>
          <p className="text-xs text-green-600 mt-1">Check your Downloads folder</p>
        </div>
      )}
      
      {downloadStatus === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">❌ Download failed - try manual download</span>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-blue-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Check your email for the document</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {downloadUrl && (
          <Button
            onClick={handleManualDownload}
            disabled={downloading}
            className="w-full"
            variant="primary"
          >
            {downloading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Downloading to Device...
              </>
            ) : downloadStatus === 'downloaded' ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Download Again
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5 mr-2" />
                Download PDF to Device
              </>
            )}
          </Button>
        )}
        
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
          onClick={retryPayment}
          className="w-full"
          variant="secondary"
          disabled={retryCount >= maxRetries}
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
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
      
      {/* PDF Download Modal */}
      {showPDFDownloadModal && submissionData && (
        <PDFDownloadModal
          isOpen={showPDFDownloadModal}
          onClose={() => setShowPDFDownloadModal(false)}
          reference={submissionData.reference}
          documentType={documentType}
        />
      )}
    </AnimatePresence>
  );
};
