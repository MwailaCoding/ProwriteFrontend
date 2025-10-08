/**
 * Advanced Notification Preferences Component
 * Granular controls for notification settings and categories
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  Smartphone,
  Shield,
  Settings,
  Clock,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Users,
  FileText,
  Brain,
  CreditCard,
  TrendingUp,
  Trophy,
  Wrench
} from 'lucide-react';
import { 
  notificationService, 
  NotificationPreferences, 
  NotificationType 
} from '../../services/notificationService';

interface NotificationPreferencesProps {
  userId: number;
  onSave?: (preferences: NotificationPreferences) => void;
  className?: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
  types: NotificationType[];
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userId,
  onSave,
  className = ''
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    marketing_enabled: true,
    security_enabled: true,
    updates_enabled: true,
    reminders_enabled: true,
    timezone: 'UTC'
  });

  const [categories, setCategories] = useState<NotificationCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
    loadCategories();
  }, [userId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = () => {
    const defaultCategories: NotificationCategory[] = [
      {
        id: 'system',
        name: 'System',
        description: 'System notifications and updates',
        icon: <Settings className="w-5 h-5" />,
        color: '#3B82F6',
        enabled: true,
        types: [NotificationType.SYSTEM, NotificationType.MAINTENANCE]
      },
      {
        id: 'payments',
        name: 'Payments',
        description: 'Payment and billing notifications',
        icon: <CreditCard className="w-5 h-5" />,
        color: '#10B981',
        enabled: true,
        types: [NotificationType.PAYMENT]
      },
      {
        id: 'ai',
        name: 'AI Features',
        description: 'AI enhancement and analysis notifications',
        icon: <Brain className="w-5 h-5" />,
        color: '#8B5CF6',
        enabled: true,
        types: [NotificationType.AI_ENHANCEMENT]
      },
      {
        id: 'collaboration',
        name: 'Collaboration',
        description: 'Team collaboration and sharing notifications',
        icon: <Users className="w-5 h-5" />,
        color: '#F59E0B',
        enabled: true,
        types: [NotificationType.COLLABORATION]
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Security alerts and account notifications',
        icon: <Shield className="w-5 h-5" />,
        color: '#EF4444',
        enabled: true,
        types: [NotificationType.SECURITY]
      },
      {
        id: 'templates',
        name: 'Templates',
        description: 'Template updates and new releases',
        icon: <FileText className="w-5 h-5" />,
        color: '#06B6D4',
        enabled: true,
        types: [NotificationType.TEMPLATE]
      },
      {
        id: 'resumes',
        name: 'Resumes',
        description: 'Resume generation and optimization notifications',
        icon: <FileText className="w-5 h-5" />,
        color: '#84CC16',
        enabled: true,
        types: [NotificationType.RESUME, NotificationType.COVER_LETTER]
      },
      {
        id: 'market',
        name: 'Market Insights',
        description: 'Job market insights and trends',
        icon: <TrendingUp className="w-5 h-5" />,
        color: '#F97316',
        enabled: true,
        types: [NotificationType.MARKET_INSIGHTS]
      },
      {
        id: 'achievements',
        name: 'Achievements',
        description: 'Achievement and milestone notifications',
        icon: <Trophy className="w-5 h-5" />,
        color: '#EAB308',
        enabled: true,
        types: [NotificationType.ACHIEVEMENT, NotificationType.WELCOME]
      }
    ];
    setCategories(defaultCategories);
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await notificationService.updatePreferences(preferences);
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (onSave) {
          onSave(preferences);
        }
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadPreferences();
    loadCategories();
  };

  const getIconForType = (type: string) => {
    const iconMap = {
      email: <Mail className="w-5 h-5" />,
      push: <Smartphone className="w-5 h-5" />,
      in_app: <Bell className="w-5 h-5" />,
      marketing: <Zap className="w-5 h-5" />,
      security: <Shield className="w-5 h-5" />,
      updates: <RefreshCw className="w-5 h-5" />,
      reminders: <Clock className="w-5 h-5" />
    };
    return iconMap[type as keyof typeof iconMap] || <Bell className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Loading notification preferences...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
          <p className="text-gray-600 mt-1">Customize how you receive notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(preferences).map(([key, value]) => {
            if (key === 'timezone' || key === 'quiet_hours_start' || key === 'quiet_hours_end') return null;
            
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getIconForType(key)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {key === 'email_enabled' && 'Receive notifications via email'}
                      {key === 'push_enabled' && 'Receive push notifications in your browser'}
                      {key === 'in_app_enabled' && 'Receive in-app notifications'}
                      {key === 'marketing_enabled' && 'Receive promotional emails and updates'}
                      {key === 'security_enabled' && 'Get notified about security-related events'}
                      {key === 'updates_enabled' && 'Receive product updates and new features'}
                      {key === 'reminders_enabled' && 'Get reminders for important actions'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => handlePreferenceChange(key as keyof NotificationPreferences, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notification Categories</h3>
          <p className="text-sm text-gray-600 mt-1">Choose which types of notifications you want to receive</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  category.enabled 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                onClick={() => handleCategoryToggle(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <div style={{ color: category.color }}>
                      {category.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    category.enabled 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {category.enabled && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quiet Hours</h3>
          <p className="text-sm text-gray-600 mt-1">Set times when you don't want to receive notifications</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_start || ''}
                onChange={(e) => handlePreferenceChange('quiet_hours_start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_end || ''}
                onChange={(e) => handlePreferenceChange('quiet_hours_end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Timezone</h3>
          <p className="text-sm text-gray-600 mt-1">Set your timezone for accurate notification timing</p>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Test Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">Send test notifications to verify your settings</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {['welcome', 'payment', 'ai', 'template', 'collaboration', 'security'].map((type) => (
              <button
                key={type}
                onClick={() => notificationService.testNotification(type)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Test {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;

