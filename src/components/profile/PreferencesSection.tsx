import React, { useState } from 'react';
import { UserProfile, UserPreferences } from '../../types';
import { Save, Palette, Bell, Eye, FileText, Brain } from 'lucide-react';

interface PreferencesSectionProps {
  profile: UserProfile;
  onUpdate: (preferences: Partial<UserPreferences>) => void;
  saving: boolean;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  profile,
  onUpdate,
  saving
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      marketing: false,
      security: true,
      updates: true,
      reminders: true
    },
    privacy: {
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false,
      showLocation: false,
      allowSearch: false,
      dataSharing: false
    },
    resume: {
      defaultTemplate: 1,
      autoSave: true,
      showTips: true,
      enableATS: true,
      defaultLanguage: 'en'
    },
    ai: {
      enhancementLevel: 'standard',
      tone: 'professional',
      autoEnhance: false,
      enableSuggestions: true
    }
  });

  React.useEffect(() => {
    if (profile.preferences) {
      setPreferences(profile.preferences);
    }
  }, [profile.preferences]);

  const handlePreferenceChange = (category: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await onUpdate(preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const themes = [
    { value: 'light', label: 'Light', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes in low light' },
    { value: 'system', label: 'System', description: 'Follow your system preference' }
  ];

  const enhancementLevels = [
    { value: 'basic', label: 'Basic', description: 'Simple improvements and corrections' },
    { value: 'standard', label: 'Standard', description: 'Balanced enhancements and suggestions' },
    { value: 'advanced', label: 'Advanced', description: 'Comprehensive AI-powered improvements' }
  ];

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'creative', label: 'Creative', description: 'Engaging and innovative' },
    { value: 'casual', label: 'Casual', description: 'Friendly and approachable' },
    { value: 'formal', label: 'Formal', description: 'Strict and traditional' }
  ];

  return (
    <div className="space-y-6">
      {/* Theme Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Palette className="w-5 h-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <label
                    key={theme.value}
                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer ${
                      preferences.theme === theme.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={preferences.theme === theme.value}
                      onChange={(e) => handlePreferenceChange('theme', 'theme', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{theme.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{theme.description}</div>
                    </div>
                    {preferences.theme === theme.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {key === 'email' && 'Receive notifications via email'}
                    {key === 'push' && 'Receive push notifications in your browser'}
                    {key === 'marketing' && 'Receive promotional emails and updates'}
                    {key === 'security' && 'Get notified about security-related events'}
                    {key === 'updates' && 'Receive product updates and new features'}
                    {key === 'reminders' && 'Get reminders for important actions'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handlePreferenceChange('notifications', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Privacy</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Visibility
              </label>
              <select
                value={preferences.privacy.profileVisibility}
                onChange={(e) => handlePreferenceChange('privacy', 'profileVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public - Anyone can see your profile</option>
                <option value="private">Private - Only you can see your profile</option>
                <option value="connections">Connections - Only your connections can see your profile</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Information Sharing</h4>
              {Object.entries(preferences.privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {key === 'showEmail' && 'Display your email address on your profile'}
                      {key === 'showPhone' && 'Display your phone number on your profile'}
                      {key === 'showLocation' && 'Display your location on your profile'}
                      {key === 'allowSearch' && 'Allow your profile to appear in search results'}
                      {key === 'dataSharing' && 'Share anonymized data to improve our services'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handlePreferenceChange('privacy', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Resume Settings</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language
                </label>
                <select
                  value={preferences.resume.defaultLanguage}
                  onChange={(e) => handlePreferenceChange('resume', 'defaultLanguage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Template
                </label>
                <select
                  value={preferences.resume.defaultTemplate}
                  onChange={(e) => handlePreferenceChange('resume', 'defaultTemplate', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Professional</option>
                  <option value={2}>Creative</option>
                  <option value={3}>Minimal</option>
                  <option value={4}>Executive</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.resume).filter(([key]) => !['defaultTemplate', 'defaultLanguage'].includes(key)).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {key === 'autoSave' && 'Automatically save your work as you type'}
                      {key === 'showTips' && 'Show helpful tips and suggestions'}
                      {key === 'enableATS' && 'Enable ATS optimization features'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handlePreferenceChange('resume', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">AI Settings</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enhancement Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {enhancementLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer ${
                      preferences.ai.enhancementLevel === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="enhancementLevel"
                      value={level.value}
                      checked={preferences.ai.enhancementLevel === level.value}
                      onChange={(e) => handlePreferenceChange('ai', 'enhancementLevel', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{level.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                    </div>
                    {preferences.ai.enhancementLevel === level.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Writing Tone
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tones.map((tone) => (
                  <label
                    key={tone.value}
                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer ${
                      preferences.ai.tone === tone.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tone"
                      value={tone.value}
                      checked={preferences.ai.tone === tone.value}
                      onChange={(e) => handlePreferenceChange('ai', 'tone', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{tone.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{tone.description}</div>
                    </div>
                    {preferences.ai.tone === tone.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.ai).filter(([key]) => !['enhancementLevel', 'tone'].includes(key)).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {key === 'autoEnhance' && 'Automatically enhance content as you type'}
                      {key === 'enableSuggestions' && 'Show AI-powered suggestions and recommendations'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handlePreferenceChange('ai', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

