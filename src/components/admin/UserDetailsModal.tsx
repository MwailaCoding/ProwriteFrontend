/**
 * User Details Modal Component
 * Full user information display with edit capabilities
 */

import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { UserDetailsModalProps, UserUpdateForm } from '../../types/admin';

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserUpdateForm>({
    firstName: user.firstName,
    lastName: user.lastName,
    isPremium: user.isPremium,
    is_admin: user.is_admin,
    isActive: user.isActive
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(user.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    try {
      setLoading(true);
      await onUpdate(user.id, { isActive: false });
    } catch (error) {
      console.error('Failed to suspend user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async () => {
    try {
      setLoading(true);
      await onUpdate(user.id, { isActive: true });
    } catch (error) {
      console.error('Failed to activate user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToPremium = async () => {
    try {
      setLoading(true);
      await onUpdate(user.id, { isPremium: true });
    } catch (error) {
      console.error('Failed to promote user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoteFromPremium = async () => {
    try {
      setLoading(true);
      await onUpdate(user.id, { isPremium: false });
    } catch (error) {
      console.error('Failed to demote user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      isPremium: user.isPremium,
      is_admin: user.is_admin,
      isActive: user.isActive
    });
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{user.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{user.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPremium || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Premium User
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_admin || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_admin: e.target.checked }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Admin User
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active Account
                  </label>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documents Generated
                  </label>
                  <p className="text-sm text-gray-900">{user.documentCount || 0}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payments Made
                  </label>
                  <p className="text-sm text-gray-900">{user.paymentCount || 0}</p>
                </div>
              </div>

              {/* Profile Info */}
              {(user.bio || user.location || user.website) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Information</h4>
                  <div className="space-y-2">
                    {user.bio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <p className="text-sm text-gray-900">{user.bio}</p>
                      </div>
                    )}
                    {user.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <p className="text-sm text-gray-900">{user.location}</p>
                      </div>
                    )}
                    {user.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-500">
                          {user.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            {isEditing ? (
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit User
                  </button>
                </div>

                {/* User Management Actions */}
                <div className="border-t border-gray-200 pt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">User Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {user.isActive ? (
                      <button
                        onClick={handleSuspendUser}
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-2 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {loading ? 'Suspending...' : 'Suspend User'}
                      </button>
                    ) : (
                      <button
                        onClick={handleActivateUser}
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-2 bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {loading ? 'Activating...' : 'Activate User'}
                      </button>
                    )}
                    
                    {user.isPremium ? (
                      <button
                        onClick={handleDemoteFromPremium}
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-2 bg-yellow-600 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                      >
                        {loading ? 'Demoting...' : 'Remove Premium'}
                      </button>
                    ) : (
                      <button
                        onClick={handlePromoteToPremium}
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-2 bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        {loading ? 'Promoting...' : 'Make Premium'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
