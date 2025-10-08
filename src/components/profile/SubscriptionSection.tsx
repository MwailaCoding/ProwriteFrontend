import React from 'react';
import { UserProfile } from '../../types';
import { CreditCard, Check, X, Crown, Star, Zap, Shield, Users, ArrowRight } from 'lucide-react';

interface SubscriptionSectionProps {
  profile: UserProfile;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ profile }) => {
  const subscription = profile.subscription || {
    plan: 'free',
    status: 'active',
    startDate: profile.createdAt || new Date().toISOString(),
    endDate: undefined,
    autoRenew: false,
    features: ['Basic resume templates', 'Limited AI enhancements', 'Standard support'],
    usage: {
      resumesThisMonth: 0,
      coverLettersThisMonth: 0,
      aiEnhancementsThisMonth: 0,
      storageUsed: 0,
      maxStorage: 100 // MB
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 resume templates',
        'Basic AI enhancements',
        'Standard support',
        '100MB storage',
        'PDF download'
      ],
      limitations: [
        'Limited templates',
        'Basic AI features',
        'Standard support only'
      ],
      current: subscription.plan === 'free',
      popular: false
    },
    {
      name: 'Premium',
      price: 9.99,
      period: 'month',
      description: 'Most popular for professionals',
      features: [
        'Unlimited resume templates',
        'Advanced AI enhancements',
        'Priority support',
        '1GB storage',
        'PDF download',
        'Cover letter templates',
        'ATS optimization',
        'Custom branding'
      ],
      limitations: [],
      current: subscription.plan === 'premium',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 29.99,
      period: 'month',
      description: 'For teams and organizations',
      features: [
        'Everything in Premium',
        'Team collaboration',
        'Admin dashboard',
        'Custom templates',
        'API access',
        'White-label options',
        'Dedicated support',
        '10GB storage'
      ],
      limitations: [],
      current: subscription.plan === 'enterprise',
      popular: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'trial':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      case 'expired':
        return <X className="w-4 h-4" />;
      case 'trial':
        return <Star className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStoragePercentage = () => {
    return (subscription.usage.storageUsed / subscription.usage.maxStorage) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 capitalize">{subscription.plan} Plan</h4>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                    {getStatusIcon(subscription.status)}
                    <span className="ml-1 capitalize">{subscription.status}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${plans.find(p => p.name.toLowerCase() === subscription.plan)?.price || 0}
                <span className="text-sm font-normal text-gray-500">
                  /{plans.find(p => p.name.toLowerCase() === subscription.plan)?.period || 'month'}
                </span>
              </div>
              {subscription.endDate && (
                <div className="text-sm text-gray-500">
                  Expires {formatDate(subscription.endDate)}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h5>
              <ul className="space-y-2">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Usage This Month</h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Resumes Created</span>
                    <span className="font-medium">{subscription.usage.resumesThisMonth}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cover Letters</span>
                    <span className="font-medium">{subscription.usage.coverLettersThisMonth}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AI Enhancements</span>
                    <span className="font-medium">{subscription.usage.aiEnhancementsThisMonth}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Storage Used</span>
                    <span className="font-medium">
                      {subscription.usage.storageUsed}MB / {subscription.usage.maxStorage}MB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
          <p className="text-sm text-gray-600">Choose the plan that best fits your needs</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-lg border-2 p-6 ${
                  plan.current
                    ? 'border-blue-500 bg-blue-50'
                    : plan.popular
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    {plan.name === 'Free' && <CreditCard className="w-8 h-8 text-gray-600" />}
                    {plan.name === 'Premium' && <Crown className="w-8 h-8 text-purple-600" />}
                    {plan.name === 'Enterprise' && <Users className="w-8 h-8 text-indigo-600" />}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">{plan.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Limitations</h5>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <X className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    plan.current
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Billing Information</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Subscription Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium capitalize">{subscription.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium capitalize">{subscription.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium">{formatDate(subscription.startDate)}</span>
                </div>
                {subscription.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-medium">{formatDate(subscription.endDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto Renewal</span>
                  <span className="font-medium">{subscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h5>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100">
                  <Shield className="w-4 h-4 mr-2" />
                  View Billing History
                </button>
                {subscription.plan !== 'free' && (
                  <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">
                    <X className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

