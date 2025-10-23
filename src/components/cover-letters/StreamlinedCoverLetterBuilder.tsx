import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import MpesaPaymentModal from '../payments/MpesaPaymentModal';
import { 
  User, 
  Building, 
  Briefcase, 
  Eye,
  FileText,
  Download,
  Save,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FormData {
  personalName: string;
  personalAddress: string;
  personalEmail: string;
  personalPhone: string;
  linkedinProfile: string;
  employerName: string;
  companyName: string;
  employerAddress: string;
  jobTitle: string;
  jobBoard: string;
  introduction: string;
  experience: string;
  companyFit: string;
  closing: string;
  hasPaid: boolean;
}

const StreamlinedCoverLetterBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    personalName: '',
    personalAddress: '',
    personalEmail: '',
    personalPhone: '',
    linkedinProfile: '',
    employerName: '',
    companyName: '',
    employerAddress: '',
    jobTitle: '',
    jobBoard: '',
    introduction: '',
    experience: '',
    companyFit: '',
    closing: '',
    hasPaid: false
  });

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Your contact details', icon: User },
    { id: 2, title: 'Job Details', description: 'Position information', icon: Briefcase },
    { id: 3, title: 'Write Cover Letter', description: 'Craft your content', icon: FileText },
    { id: 4, title: 'Preview & Download', description: 'Review and download', icon: Download }
  ];

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.personalName && formData.personalEmail && formData.personalPhone);
      case 2:
        return !!(formData.jobTitle && formData.companyName);
      case 3:
        return !!(formData.introduction && formData.experience && formData.companyFit && formData.closing);
      default:
        return true;
    }
  };

  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // Save draft logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const downloadPDF = async () => {
    if (!formData.hasPaid) {
      setShowPaymentModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      // PDF generation logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    updateFormData({ hasPaid: true });
    setShowPaymentModal(false);
    toast.success('Payment successful! You can now download your cover letter.');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-600">Tell us about yourself.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.personalName}
                  onChange={(e) => updateFormData({ personalName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => updateFormData({ personalEmail: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.personalPhone}
                  onChange={(e) => updateFormData({ personalPhone: e.target.value })}
                  placeholder="254712345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedinProfile}
                  onChange={(e) => updateFormData({ linkedinProfile: e.target.value })}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.personalAddress}
                onChange={(e) => updateFormData({ personalAddress: e.target.value })}
                placeholder="Enter your address..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Details</h3>
              <p className="text-gray-600">Tell us about the position you're applying for.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => updateFormData({ jobTitle: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData({ companyName: e.target.value })}
                  placeholder="e.g., Tech Company Ltd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where did you find this job?
                </label>
                <input
                  type="text"
                  value={formData.jobBoard}
                  onChange={(e) => updateFormData({ jobBoard: e.target.value })}
                  placeholder="e.g., LinkedIn, Indeed, Company Website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Write Your Cover Letter</h3>
              <p className="text-gray-600">Craft each paragraph with AI assistance.</p>
            </div>

            {[
              { id: 'introduction', title: 'Opening Paragraph', description: 'Express interest and position yourself', placeholder: 'I am writing to express my interest in the [Job Title] position at [Company Name]...' },
              { id: 'experience', title: 'Experience Paragraph', description: 'Highlight your relevant experience', placeholder: 'In my previous role as [Your Role] at [Company], I [achievement]...' },
              { id: 'companyFit', title: 'Company Fit Paragraph', description: 'Show company knowledge and cultural fit', placeholder: 'What excites me most about [Company Name] is...' },
              { id: 'closing', title: 'Closing Paragraph', description: 'Call to action and professional closing', placeholder: 'I would welcome the opportunity to discuss how my background...' }
            ].map((paragraph, index) => (
              <Card key={paragraph.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{paragraph.title}</h4>
                      <p className="text-sm text-gray-500">{paragraph.description}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => toast.info('AI Assistant coming soon!')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Assistant
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Write your {paragraph.title.toLowerCase()}:
                  </label>
                  <textarea
                    value={formData[paragraph.id as keyof FormData] as string || ''}
                    onChange={(e) => updateFormData({ [paragraph.id]: e.target.value } as Partial<FormData>)}
                    placeholder={paragraph.placeholder}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {(formData[paragraph.id as keyof FormData] as string || '').length} characters
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview & Download</h3>
              <p className="text-gray-600">Review your cover letter and download it as a PDF.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Cover Letter Preview</h4>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    size="sm"
                  >
                    {showPreview ? <FileText className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
                
                {showPreview && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6 bg-white">
                      <div className="text-right text-sm text-gray-500 mb-4">
                        {new Date().toLocaleDateString()}
                      </div>
                      
                      <div className="mb-4">
                        <div className="font-semibold">{formData.personalName}</div>
                        <div className="text-sm text-gray-600">{formData.personalAddress}</div>
                        <div className="text-sm text-gray-600">{formData.personalEmail} • {formData.personalPhone}</div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="font-semibold">{formData.employerName || 'Hiring Manager'}</div>
                        <div className="text-sm text-gray-600">{formData.companyName}</div>
                        <div className="text-sm text-gray-600">{formData.employerAddress}</div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="font-semibold">Re: {formData.jobTitle} Position</div>
                      </div>
                      
                      <div className="space-y-4 text-sm leading-relaxed">
                        <p>{formData.introduction}</p>
                        <p>{formData.experience}</p>
                        <p>{formData.companyFit}</p>
                        <p>{formData.closing}</p>
                      </div>
                      
                      <div className="mt-6">
                        <div>Sincerely,</div>
                        <div className="mt-4">{formData.personalName}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="lg:w-80">
                <Card className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Download Your Cover Letter</h4>
                  
                  {formData.hasPaid ? (
                    <div className="space-y-4">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Payment Complete</span>
                      </div>
                      <Button
                        onClick={downloadPDF}
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download PDF
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">KES 300</div>
                        <div className="text-sm text-gray-500">One-time payment</div>
                      </div>
                      <Button
                        onClick={downloadPDF}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Pay & Download PDF
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Preview is free. Payment required for PDF download.
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Cover Letter
              </h1>
              <p className="text-gray-600">
                Build a professional cover letter in 4 simple steps with AI assistance.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={saveDraft}
                disabled={isSavingDraft}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {isSavingDraft ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Draft</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
              >
                Cancel
              </Button>
              
              {currentStep < steps.length && (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Modal */}
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={300}
        formData={formData}
        documentType="Cover Letter"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default StreamlinedCoverLetterBuilder;