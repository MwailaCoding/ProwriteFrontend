import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Download, Crown } from 'lucide-react';
import { Button } from '../common/Button';
import { MpesaPaymentModal } from './MpesaPaymentModal';
import { MpesaPaymentResponse } from '../../types';

interface PaymentButtonProps {
  itemType: 'resume' | 'cover_letter' | 'premium';
  itemId: number;
  itemName: string;
  amount: number;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onPaymentSuccess?: (paymentData: MpesaPaymentResponse) => void;
  showPrice?: boolean;
  disabled?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  itemType,
  itemId,
  itemName,
  amount,
  variant = 'primary',
  size = 'md',
  className = '',
  onPaymentSuccess,
  showPrice = true,
  disabled = false
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePaymentClick = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentData: MpesaPaymentResponse) => {
    setIsPaymentModalOpen(false);
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentData);
    }
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
  };

  const getButtonText = () => {
    switch (itemType) {
      case 'resume':
        return showPrice ? `Download Resume - KES ${amount.toLocaleString()}` : 'Download Resume';
      case 'cover_letter':
        return showPrice ? `Download Cover Letter - KES ${amount.toLocaleString()}` : 'Download Cover Letter';
      case 'premium':
        return showPrice ? `Upgrade to Premium - KES ${amount.toLocaleString()}/month` : 'Upgrade to Premium';
      default:
        return 'Pay Now';
    }
  };

  const getButtonIcon = () => {
    switch (itemType) {
      case 'resume':
        return <Download className="w-4 h-4" />;
      case 'cover_letter':
        return <Download className="w-4 h-4" />;
      case 'premium':
        return <Crown className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getButtonVariant = () => {
    if (disabled) return 'outline';
    if (itemType === 'premium') return 'primary';
    return variant;
  };

  return (
    <>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <Button
          onClick={handlePaymentClick}
          variant={getButtonVariant()}
          size={size}
          className={`relative overflow-hidden ${className}`}
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            {getButtonIcon()}
            <span>{getButtonText()}</span>
          </div>
          
          {/* Hover effect for premium items */}
          {itemType === 'premium' && isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-20"
            />
          )}
        </Button>
      </motion.div>

      {/* Payment Modal */}
      <MpesaPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModal}
        itemType={itemType}
        itemId={itemId}
        itemName={itemName}
        amount={amount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

// Specialized payment button components for common use cases
export const ResumePaymentButton: React.FC<Omit<PaymentButtonProps, 'itemType'> & { resumeId: number; resumeName: string }> = (props) => (
  <PaymentButton
    {...props}
    itemType="resume"
    itemId={props.resumeId}
    itemName={props.resumeName}
    amount={props.amount}
  />
);

export const CoverLetterPaymentButton: React.FC<Omit<PaymentButtonProps, 'itemType'> & { coverLetterId: number; coverLetterName: string }> = (props) => (
  <PaymentButton
    {...props}
    itemType="cover_letter"
    itemId={props.coverLetterId}
    itemName={props.coverLetterName}
    amount={props.amount}
  />
);

export const PremiumUpgradeButton: React.FC<Omit<PaymentButtonProps, 'itemType'> & { userId: number }> = (props) => (
  <PaymentButton
    {...props}
    itemType="premium"
    itemId={props.userId}
    itemName="Premium Subscription"
    amount={props.amount}
    variant="primary"
    showPrice={true}
  />
);

// Lock overlay component for items that require payment
export const PaymentLockOverlay: React.FC<{
  itemType: 'resume' | 'cover_letter' | 'premium';
  amount: number;
  onUnlock: () => void;
  className?: string;
}> = ({ itemType, amount, onUnlock, className = '' }) => (
  <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center ${className}`}>
    <div className="text-center text-white p-4">
      <Lock className="w-12 h-12 mx-auto mb-3 text-white" />
      <h3 className="text-lg font-semibold mb-2">Payment Required</h3>
      <p className="text-sm mb-3 opacity-90">
        {itemType === 'resume' && 'Download this resume'}
        {itemType === 'cover_letter' && 'Download this cover letter'}
        {itemType === 'premium' && 'Access premium features'}
      </p>
      <div className="text-2xl font-bold text-yellow-400 mb-3">
        KES {amount.toLocaleString()}
      </div>
      <Button
        onClick={onUnlock}
        variant="primary"
        size="sm"
        className="bg-white text-black hover:bg-gray-100"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Pay with M-Pesa
      </Button>
    </div>
  </div>
);
