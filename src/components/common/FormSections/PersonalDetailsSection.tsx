import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Card } from '../Card';
import { 
  FileUpload, 
  LocationField, 
  SocialMediaLinks,
  DateRangeField
} from '../AdvancedFormComponents';
import { PersonalInfo } from '../../types';

interface PersonalDetailsSectionProps {
  personalInfo: PersonalInfo;
  onUpdate: (updates: Partial<PersonalInfo>) => void;
  errors: Record<string, string>;
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
  personalInfo,
  onUpdate,
  errors
}) => {
  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onUpdate({ photo: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = () => {
    onUpdate({ photo: '' });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Personal Details</h3>
          <p className="text-gray-600">Tell us about yourself and how to contact you</p>
        </div>

        {/* Photo Upload */}
        <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Photo (Optional)
            </label>
            <FileUpload
              onUpload={handlePhotoUpload}
              currentFile={personalInfo.photo}
              onRemove={handlePhotoRemove}
              accept="image/*"
              maxSize={5}
            />
          </div>

          <div className="flex-1 space-y-4">
            {/* Professional Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Summary *
              </label>
              <div className="relative">
                <textarea
                  value={personalInfo.summary || ''}
                  onChange={(e) => onUpdate({ summary: e.target.value })}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write a compelling professional summary that highlights your key strengths and career objectives..."
                  rows={4}
                  required
                />
                <button
                  type="button"
                  onClick={() => onUpdate({ 
                    summary: 'Results-driven software developer with 5+ years of experience in web development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams to achieve business objectives.' 
                  })}
                  className="absolute right-2 top-2 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded border"
                  title="AI-Enhanced Summary"
                >
                  ✨
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Keep it concise (2-3 sentences) and focus on your value proposition
              </p>
            </div>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => onUpdate({ firstName: e.target.value })}
                    className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your first name"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => onUpdate({ firstName: 'John' })}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="AI Suggestion"
                  >
                    ✨
                  </button>
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => onUpdate({ lastName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                  required
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => onUpdate({ email: e.target.value })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => onUpdate({ phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <textarea
                value={personalInfo.address}
                onChange={(e) => onUpdate({ address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full address"
              />
            </div>

            <LocationField
              city={personalInfo.city}
              country={personalInfo.country}
              onCityChange={(city) => onUpdate({ city })}
              onCountryChange={(country) => onUpdate({ country })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  value={personalInfo.zipCode}
                  onChange={(e) => onUpdate({ zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter zip code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Additional Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place of Birth
                </label>
                <input
                  type="text"
                  value={personalInfo.placeOfBirth}
                  onChange={(e) => onUpdate({ placeOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driving License
                </label>
                <input
                  type="text"
                  value={personalInfo.drivingLicense}
                  onChange={(e) => onUpdate({ drivingLicense: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Class A, B, C"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={personalInfo.gender}
                  onChange={(e) => onUpdate({ gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={personalInfo.nationality}
                  onChange={(e) => onUpdate({ nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., American, Kenyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status
              </label>
              <select
                value={personalInfo.maritalStatus}
                onChange={(e) => onUpdate({ maritalStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="In a relationship">In a relationship</option>
              </select>
            </div>

            {/* Social Media Links */}
            <SocialMediaLinks
              linkedin={personalInfo.linkedin}
              website={personalInfo.website}
              onLinkedinChange={(linkedin) => onUpdate({ linkedin })}
              onWebsiteChange={(website) => onUpdate({ website })}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Personal Details</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use a professional photo (business attire, neutral background)</li>
            <li>• Ensure your email address is professional and active</li>
            <li>• Include your current location for local job opportunities</li>
            <li>• Add your LinkedIn profile to showcase your professional network</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
