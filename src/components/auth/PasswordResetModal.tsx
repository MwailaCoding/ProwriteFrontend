/**
 * Password Reset Modal Component
 * Handles password reset requests and confirmation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import authService from '../../services/authService';
import { Button } from '../common/Button';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResetRequestForm {
  email: string;
}

interface ResetConfirmForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'request' | 'confirm' | 'success'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Request form
  const requestForm = useForm<ResetRequestForm>({
    defaultValues: { email: '' }
  });

  // Confirm form
  const confirmForm = useForm<ResetConfirmForm>({
    defaultValues: { 
      token: '', 
      newPassword: '', 
      confirmPassword: '' 
    }
  });

  const handleRequestReset = async (data: ResetRequestForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.requestPasswordReset(data);
      setStep('confirm');
      
      // Check if we got a token in the response (when email isn't working)
      if (response.token) {
        setSuccessMessage(`Reset token generated! Copy this token: ${response.token}`);
      } else {
        setSuccessMessage('Password reset instructions sent to your email!');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (data: ResetConfirmForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await authService.confirmPasswordReset({
        token: data.token,
        newPassword: data.newPassword
      });
      
      setStep('success');
      setSuccessMessage('Password reset successfully! You can now login with your new password.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setError(null);
    setSuccessMessage('');
    requestForm.reset();
    confirmForm.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'request' && 'Reset Password'}
              {step === 'confirm' && 'Enter Reset Code'}
              {step === 'success' && 'Success!'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-green-700 text-sm">{successMessage}</p>
            </motion.div>
          )}

          {/* Request Step */}
          {step === 'request' && (
            <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...requestForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                {requestForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {requestForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </form>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <form onSubmit={confirmForm.handleSubmit(handleConfirmReset)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Code
                </label>
                <input
                  {...confirmForm.register('token', {
                    required: 'Reset code is required'
                  })}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the code from your email"
                />
                {confirmForm.formState.errors.token && (
                  <p className="mt-1 text-sm text-red-600">
                    {confirmForm.formState.errors.token.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...confirmForm.register('newPassword', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                {confirmForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {confirmForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...confirmForm.register('confirmPassword', {
                      required: 'Please confirm your password'
                    })}
                    type="password"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
                {confirmForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {confirmForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                Your password has been reset successfully! You can now login with your new password.
              </p>
              <Button
                onClick={handleClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}

          {/* Footer */}
          {step !== 'success' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('request')}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Back to email request
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PasswordResetModal;

