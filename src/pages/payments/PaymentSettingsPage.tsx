import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  CreditCard,
  Settings,
  Shield,
  History,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { paymentService } from '../../services/paymentService';
import { PaymentHistoryItem } from '../../types';
import { toast } from 'react-hot-toast';

interface PaymentSettings {
  defaultPhone: string;
  notifications: boolean;
  autoConfirm: boolean;
}

export const PaymentSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    defaultPhone: '',
    notifications: true,
    autoConfirm: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recentPayments, setRecentPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSettings();
    loadRecentPayments();
  }, []);

  const loadUserSettings = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const savedSettings = localStorage.getItem('paymentSettings');
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Set default phone from user data if available
        setSettings(prev => ({
          ...prev,
          defaultPhone: user.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  };

  const loadRecentPayments = async () => {
    try {
      setLoading(true);
      const payments = await paymentService.getPaymentHistory();
      setRecentPayments(payments.slice(0, 5)); // Show last 5 payments
    } catch (error) {
      console.error('Error loading recent payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Save to localStorage
      localStorage.setItem('paymentSettings', JSON.stringify(settings));
      
      // Here you would typically save to backend
      // await paymentService.updatePaymentSettings(settings);
      
      toast.success('Payment settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    loadUserSettings(); // Reset to saved values
    setIsEditing(false);
  };

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
    
    setSettings(prev => ({ ...prev, defaultPhone: formatted }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your M-Pesa payment preferences and settings
            </p>
          </div>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Payment Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Default Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={settings.defaultPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="0712345678"
                      disabled={!isEditing}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This number will be used as default for M-Pesa payments
                  </p>
                </div>

                {/* Notifications */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Receive payment notifications
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Get notified about payment status and confirmations
                  </p>
                </div>

                {/* Auto Confirm */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoConfirm}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoConfirm: e.target.checked }))}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Auto-confirm successful payments
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically grant access when payment is confirmed
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="primary"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Settings
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveSettings}
                        variant="primary"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Payment Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Secure M-Pesa Integration
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>All payments are processed through M-Pesa's secure network</li>
                        <li>Your phone number is only used for payment processing</li>
                        <li>No payment information is stored on our servers</li>
                        <li>All transactions are encrypted and secure</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.payment_id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getPaymentStatusIcon(payment.status)}
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {payment.payment_type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(payment.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-900">
                          {paymentService.formatCurrency(payment.amount, payment.currency)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your payment history will appear here
                  </p>
                </div>
              )}
              
              {recentPayments.length > 0 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/payments/history'}
                  >
                    View Full Payment History
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
















