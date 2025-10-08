import React, { useState, useEffect } from 'react';
import { UserProfile, SecuritySettings, TrustedDevice } from '../../types';
import { Save, Shield, Smartphone, Monitor, Tablet, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { toast } from 'react-hot-toast';

interface SecuritySectionProps {
  profile: UserProfile;
  onUpdate: (security: Partial<SecuritySettings>) => void;
  saving: boolean;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  profile,
  onUpdate,
  saving
}) => {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordLastChanged: undefined,
    trustedDevices: []
  });
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile.security) {
      setSecuritySettings(profile.security);
    }
    loadTrustedDevices();
  }, [profile]);

  const loadTrustedDevices = async () => {
    try {
      const devices = await profileService.getTrustedDevices();
      setTrustedDevices(devices);
    } catch (error) {
      console.error('Failed to load trusted devices:', error);
    }
  };

  const handleSettingChange = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await onUpdate(securitySettings);
      toast.success('Security settings updated successfully');
    } catch (error) {
      console.error('Failed to update security settings:', error);
      toast.error('Failed to update security settings');
    }
  };

  const handleEnable2FA = async () => {
    try {
      setIsLoading(true);
      const response = await profileService.enableTwoFactor();
      setQrCode(response.qrCode);
      setShow2FASetup(true);
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      toast.error('Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setIsLoading(true);
      await profileService.verifyTwoFactor(verificationCode);
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
      setShow2FASetup(false);
      setVerificationCode('');
      toast.success('2FA enabled successfully');
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
      toast.error('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsLoading(true);
      await profileService.disableTwoFactor(verificationCode);
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }));
      setVerificationCode('');
      toast.success('2FA disabled successfully');
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await profileService.revokeTrustedDevice(deviceId);
      setTrustedDevices(prev => prev.filter(device => device.id !== deviceId));
      toast.success('Device revoked successfully');
    } catch (error) {
      console.error('Failed to revoke device:', error);
      toast.error('Failed to revoke device');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'desktop':
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
            </div>
            <div className="flex items-center">
              {securitySettings.twoFactorEnabled ? (
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Enabled
                </span>
              ) : (
                <span className="flex items-center text-sm text-gray-500">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Disabled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {securitySettings.twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">
                    Two-factor authentication is enabled on your account.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter verification code to disable 2FA"
                />
                <button
                  onClick={handleDisable2FA}
                  disabled={isLoading || !verificationCode}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {isLoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Two-factor authentication is not enabled. We recommend enabling it for better security.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleEnable2FA}
                disabled={isLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isLoading ? 'Setting up...' : 'Enable 2FA'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Security Preferences</h3>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Login Alerts</h4>
                <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.loginAlerts}
                  onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={480}>8 hours</option>
                <option value={0}>Never (not recommended)</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Trusted Devices</h3>
          <p className="text-sm text-gray-600">Manage devices that can access your account without 2FA</p>
        </div>

        <div className="p-6">
          {trustedDevices.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No trusted devices</p>
          ) : (
            <div className="space-y-3">
              {trustedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-gray-400 mr-3">
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs text-gray-500">
                        Last used: {formatDate(device.lastUsed)}
                        {device.location && ` • ${device.location}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeDevice(device.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Two-Factor Authentication</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app:
                </p>
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 6-digit code from your app"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleVerify2FA}
                  disabled={isLoading || !verificationCode}
                  className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  onClick={() => {
                    setShow2FASetup(false);
                    setVerificationCode('');
                  }}
                  className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

