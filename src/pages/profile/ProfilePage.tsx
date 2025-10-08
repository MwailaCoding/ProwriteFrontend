import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/authSlice';
import { profileService } from '../../services/profileService';
import { UserProfile, UserPreferences, SecuritySettings } from '../../types';
import { toast } from 'react-hot-toast';

// Components
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { PersonalInfoSection } from '../../components/profile/PersonalInfoSection';
import { AccountSettingsSection } from '../../components/profile/AccountSettingsSection';
import { SecuritySection } from '../../components/profile/SecuritySection';
import { PreferencesSection } from '../../components/profile/PreferencesSection';
import { ActivitySection } from '../../components/profile/ActivitySection';
import { SubscriptionSection } from '../../components/profile/SubscriptionSection';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (data: Partial<UserProfile>) => {
    try {
      setSaving(true);
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
      dispatch(updateUser(updatedProfile));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (preferences: Partial<UserPreferences>) => {
    try {
      setSaving(true);
      const updatedProfile = await profileService.updatePreferences(preferences);
      setProfile(updatedProfile);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSecurityUpdate = async (security: Partial<SecuritySettings>) => {
    try {
      setSaving(true);
      const updatedProfile = await profileService.updateSecurity(security);
      setProfile(updatedProfile);
      toast.success('Security settings updated successfully');
    } catch (error) {
      console.error('Failed to update security settings:', error);
      toast.error('Failed to update security settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setSaving(true);
      const response = await profileService.uploadAvatar(file);
      if (response.success) {
        const updatedProfile = { ...profile!, avatar: response.avatarUrl };
        setProfile(updatedProfile);
        dispatch(updateUser(updatedProfile));
        toast.success('Avatar updated successfully');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'account', label: 'Account Settings', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '🎨' },
    { id: 'activity', label: 'Activity', icon: '📊' },
    { id: 'subscription', label: 'Subscription', icon: '💳' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <ProfileHeader 
          profile={profile} 
          onAvatarUpload={handleAvatarUpload}
          saving={saving}
        />

        {/* Navigation Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'personal' && (
            <PersonalInfoSection
              profile={profile}
              onUpdate={handleProfileUpdate}
              saving={saving}
            />
          )}

          {activeTab === 'account' && (
            <AccountSettingsSection
              profile={profile}
              onUpdate={handleProfileUpdate}
              saving={saving}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySection
              profile={profile}
              onUpdate={handleSecurityUpdate}
              saving={saving}
            />
          )}

          {activeTab === 'preferences' && (
            <PreferencesSection
              profile={profile}
              onUpdate={handlePreferencesUpdate}
              saving={saving}
            />
          )}

          {activeTab === 'activity' && (
            <ActivitySection profile={profile} />
          )}

          {activeTab === 'subscription' && (
            <SubscriptionSection profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

