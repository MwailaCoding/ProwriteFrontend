import api from '../config/api';
import { UserProfile, UserPreferences, SecuritySettings, ActivityItem } from '../types';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  dateOfBirth?: string;
  gender?: string;
  timezone?: string;
  language?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UploadAvatarResponse {
  success: boolean;
  avatarUrl: string;
  message?: string;
}

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.put('/profile', data);
    return response.data;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile> {
    const response = await api.put('/profile/preferences', preferences);
    return response.data;
  }

  async updateSecurity(security: Partial<SecuritySettings>): Promise<UserProfile> {
    const response = await api.put('/profile/security', security);
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/profile/change-password', data);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteAvatar(): Promise<{ success: boolean; message: string }> {
    const response = await api.delete('/profile/avatar');
    return response.data;
  }

  async getActivity(): Promise<ActivityItem[]> {
    const response = await api.get('/profile/activity');
    return response.data;
  }

  async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    const response = await api.post('/profile/2fa/enable');
    return response.data;
  }

  async disableTwoFactor(verificationCode: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/profile/2fa/disable', { verificationCode });
    return response.data;
  }

  async verifyTwoFactor(verificationCode: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/profile/2fa/verify', { verificationCode });
    return response.data;
  }

  async getTrustedDevices(): Promise<any[]> {
    const response = await api.get('/profile/trusted-devices');
    return response.data;
  }

  async revokeTrustedDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/profile/trusted-devices/${deviceId}`);
    return response.data;
  }

  async exportData(): Promise<Blob> {
    const response = await api.get('/profile/export', {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete('/profile/account', {
      data: { password }
    });
    return response.data;
  }
}

export const profileService = new ProfileService();
