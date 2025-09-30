import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { PaymentButton } from './PaymentButton';
import { PaymentLockOverlay } from './PaymentButton';
import { paymentService } from '../../services/paymentService';
import { MpesaPaymentResponse } from '../../types';
import { toast } from 'react-hot-toast';

interface PaymentIntegrationProps {
  itemType: 'resume' | 'cover_letter' | 'premium';
  itemId: number;
  itemName: string;
  amount: number;
  userId: number;
  onDownload?: () => void;
  className?: string;
}

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  itemType,
  itemId,
  itemName,
  amount,
  userId,
  onDownload,
  className = ''
}) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    checkPaymentStatus();
  }, [itemId, userId]);

  const checkPaymentStatus = async () => {
    try {
      setIsChecking(true);
      
      // Check if user has premium access
      if (itemType === 'premium') {
        // For premium, check if user already has access
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setIsPremium(user.isPremium || false);
        setHasAccess(user.isPremium || false);
        setIsChecking(false);
        return;
      }

      // For resumes and cover letters, check if user has already paid
      const response = await paymentService.verifyPayment(itemId);
      
      if (response.verified) {
        setHasAccess(true);
        toast.success('You have access to this content');
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setHasAccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: MpesaPaymentResponse) => {
    try {
      // Verify the payment was successful
      const verification = await paymentService.verifyMpesaPayment(paymentData.checkout_request_id);
      
      if (verification.status === 'completed') {
        setHasAccess(true);
        toast.success('Payment successful! You now have access to this content.');
        
        // If there's a download callback, trigger it
        if (onDownload) {
          onDownload();
        }
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    }
  };

  const handleDownload = () => {
    if (hasAccess && onDownload) {
      onDownload();
    } else {
      toast.error('Payment required to download this content');
    }
  };

  if (isChecking) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Checking access...</span>
      </div>
    );
  }

  // If user has access, show download button
  if (hasAccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Button
          onClick={handleDownload}
          variant="primary"
          size="lg"
          className="w-full"
        >
          <Download className="w-5 h-5 mr-2" />
          Download {itemType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Button>
        <div className="mt-2 text-center">
          <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
          <span className="text-sm text-green-600">Access granted</span>
        </div>
      </motion.div>
    );
  }

  // If user doesn't have access, show payment button
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <PaymentButton
        itemType={itemType}
        itemId={itemId}
        itemName={itemName}
        amount={amount}
        onPaymentSuccess={handlePaymentSuccess}
        variant="primary"
        size="lg"
        className="w-full"
        showPrice={true}
      />
      <div className="mt-2 text-center">
        <Lock className="w-4 h-4 text-gray-500 inline mr-1" />
        <span className="text-sm text-gray-600">Payment required to access</span>
      </div>
    </motion.div>
  );
};

// Specialized components for different content types
export const ResumePaymentIntegration: React.FC<{
  resumeId: number;
  resumeName: string;
  amount: number;
  userId: number;
  onDownload?: () => void;
  className?: string;
}> = ({ resumeId, resumeName, amount, userId, onDownload, className }) => (
  <PaymentIntegration
    itemType="resume"
    itemId={resumeId}
    itemName={resumeName}
    amount={amount}
    userId={userId}
    onDownload={onDownload}
    className={className}
  />
);

export const CoverLetterPaymentIntegration: React.FC<{
  coverLetterId: number;
  coverLetterName: string;
  amount: number;
  userId: number;
  onDownload?: () => void;
  className?: string;
}> = ({ coverLetterId, coverLetterName, amount, userId, onDownload, className }) => (
  <PaymentIntegration
    itemType="cover_letter"
    itemId={coverLetterId}
    itemName={coverLetterName}
    amount={amount}
    userId={userId}
    onDownload={onDownload}
    className={className}
  />
);

export const PremiumUpgradeIntegration: React.FC<{
  userId: number;
  amount: number;
  onUpgrade?: () => void;
  className?: string;
}> = ({ userId, amount, onUpgrade, className }) => (
  <PaymentIntegration
    itemType="premium"
    itemId={userId}
    itemName="Premium Subscription"
    amount={amount}
    userId={userId}
    onDownload={onUpgrade}
    className={className}
  />
);

// Component for displaying payment status in content lists
export const PaymentStatusBadge: React.FC<{
  itemType: 'resume' | 'cover_letter' | 'premium';
  amount: number;
  hasAccess: boolean;
  onPaymentClick: () => void;
}> = ({ itemType, amount, hasAccess, onPaymentClick }) => {
  if (hasAccess) {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Access Granted
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <Lock className="w-3 h-3 mr-1" />
      KES {amount.toLocaleString()}
    </div>
  );
};
















