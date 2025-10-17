/**
 * Email Composer Modal Component
 * Rich text email editor for sending notifications
 */

import React, { useState } from 'react';
import { XMarkIcon, EnvelopeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import type { EmailComposerModalProps, NotificationForm } from '../../types/admin';

const EmailComposerModal: React.FC<EmailComposerModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend 
}) => {
  const [formData, setFormData] = useState<NotificationForm>({
    recipient_type: 'individual',
    recipient_email: '',
    subject: '',
    body: '',
    body_html: '',
    scheduled_at: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.body.trim()) {
      return;
    }

    if (formData.recipient_type === 'individual' && !formData.recipient_email?.trim()) {
      return;
    }

    try {
      setLoading(true);
      await onSend(formData);
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      recipient_type: 'individual',
      recipient_email: '',
      subject: '',
      body: '',
      body_html: '',
      scheduled_at: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Send Notification
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Recipient Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, recipient_type: 'individual' }))}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
                      formData.recipient_type === 'individual'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Individual
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, recipient_type: 'all' }))}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
                      formData.recipient_type === 'all'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    All Users
                  </button>
                </div>
              </div>

              {/* Individual Email */}
              {formData.recipient_type === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.recipient_email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipient_email: e.target.value }))}
                    placeholder="user@example.com"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter your message here..."
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Schedule (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to send immediately
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.subject.trim() || !formData.body.trim() || (formData.recipient_type === 'individual' && !formData.recipient_email?.trim())}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposerModal;
