import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Crown,
  Check,
  Star,
  Calendar,
  Download,
  Receipt,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { paymentService } from '../../services/paymentService';
import { Payment } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const BillingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise'>('premium');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: paymentHistory, loading } = useApi<Payment[]>(
    () => paymentService.getPaymentHistory()
  );

  const { execute: initiatePayment, loading: processing } = useApiMutation(
    (data: any) => paymentService.initiatePayment(data),
    {
      onSuccess: () => {
        setShowPaymentModal(false);
        // Refresh payment history
      }
    }
  );

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: 1500,
      period: 'month',
      description: 'Perfect for job seekers and professionals',
      features: [
        'Unlimited Resume Templates',
        'Advanced AI Enhancement',
        'ATS Score Analyzer',
        'Cover Letter Generator',
        'Market Insights Dashboard',
        'Priority Email Support',
        'Multiple Export Formats',
        'Resume Analytics'
      ],
      popular: true,
      color: 'sunset'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 5000,
      period: 'month',
      description: 'For teams and organizations',
      features: [
        'Everything in Premium',
        'Custom Template Creation',
        'Team Management Dashboard',
        'Advanced Analytics & Reporting',
        'API Access',
        'White-label Solutions',
        'Dedicated Account Manager',
        'Custom Integrations',
        'Bulk Resume Processing'
      ],
      popular: false,
      color: 'coral'
    }
  ];

  const handleUpgrade = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan || !phoneNumber) return;

    await initiatePayment({
      amount: plan.price,
      item_type: 'premium',
      item_id: planId === 'premium' ? 1 : 2,
      phone: phoneNumber
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription and view payment history
          </p>
        </div>
      </motion.div>

      {/* Current Plan Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-sunset-100 rounded-lg">
                <Crown className="h-6 w-6 text-sunset-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Plan: Free</h3>
                <p className="text-gray-600">You're currently on the free plan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">KES 0</p>
              <p className="text-sm text-gray-600">per month</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Upgrade Plans */}
      <motion.div variants={itemVariants}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h2>
          <p className="text-gray-600">Unlock powerful features to accelerate your career</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-sunset-gradient text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'ring-2 ring-sunset-500 shadow-xl' : ''}`}>
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-${plan.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {plan.id === 'premium' ? (
                      <Star className={`h-8 w-8 text-${plan.color}-600`} />
                    ) : (
                      <Crown className={`h-8 w-8 text-${plan.color}-600`} />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      KES {plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    setSelectedPlan(plan.id as any);
                    setShowPaymentModal(true);
                  }}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-sunset-gradient hover:shadow-lg'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  Upgrade to {plan.name}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Payment History */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 text-gray-600 mr-2" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : paymentHistory && paymentHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">M-Pesa Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.payment_id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {payment.payment_type === 'premium' ? 'Premium Subscription' : 'Template Purchase'}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {paymentService.formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                          {payment.mpesa_code}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                <p className="text-gray-500">Your payment transactions will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-sunset-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-sunset-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">M-Pesa Payment</h3>
              <p className="text-gray-600">
                Upgrade to {plans.find(p => p.id === selectedPlan)?.name} plan
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-sunset-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Amount:</span>
                  <span className="text-xl font-bold text-sunset-600">
                    KES {plans.find(p => p.id === selectedPlan)?.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by M-Pesa</span>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpgrade(selectedPlan)}
                  loading={processing}
                  disabled={!phoneNumber}
                  className="flex-1 bg-sunset-gradient"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};