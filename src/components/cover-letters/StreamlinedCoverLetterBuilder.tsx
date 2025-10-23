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
  Download,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Save,
  FileText,
  X
} from 'lucide-react';
import { AIParagraphChat } from './AIParagraphChat';
import { CoverLetterPDFPreview } from './CoverLetterPDFPreview';
import { coverLetterService } from '../../services/coverLetterService';

interface StreamlinedCoverLetterBuilderProps {
  onSuccess: (coverLetterId: number) => void;
  onClose: () => void;
}

interface FormData {
  // Step 1: Contact Information
  personalName: string;
  personalAddress: string;
  personalEmail: string;
  personalPhone: string;
  linkedinProfile: string;
  
  // Employer Information
  employerName: string;
  companyName: string;
  employerAddress: string;
  
  // Step 2: Job Details
  jobTitle: string;
  jobBoard: string;
  
  // Step 3: Paragraphs
  introduction: string;
  experience: string;
  companyFit: string;
  closing: string;
  
  // Step 4: Payment & Download
  hasPaid: boolean;
  paymentId: string | null;
}

const initialFormData: FormData = {
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
  hasPaid: false,
  paymentId: null
};

const steps = [
  { id: 1, title: 'Contact Information', icon: User, description: 'Your details and employer information' },
  { id: 2, title: 'Job Details', icon: Briefcase, description: 'Position and application source' },
  { id: 3, title: 'Write Paragraphs', icon: MessageSquare, description: 'Craft your cover letter with AI assistance' },
  { id: 4, title: 'Preview & Download', icon: Eye, description: 'Review and download your cover letter' }
];

export const StreamlinedCoverLetterBuilder: React.FC<StreamlinedCoverLetterBuilderProps> = ({ 
  onSuccess, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeChatParagraph, setActiveChatParagraph] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('streamlinedCoverLetterDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Auto-save draft whenever form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('streamlinedCoverLetterDraft', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData]);

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

  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const draftData = {
        id: Date.now().toString(),
        title: `Cover Letter - ${formData.jobTitle || 'Untitled'} at ${formData.companyName || 'Company'}`,
        createdAt: new Date().toISOString(),
        formData: formData,
        currentStep: currentStep
      };

      // Save to localStorage
      localStorage.setItem('streamlinedCoverLetterDraft', JSON.stringify(formData));
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    updateFormData({ hasPaid: true, paymentId });
    setShowPaymentModal(false);
    // Automatically trigger download after payment
    downloadPDF();
  };

  const downloadPDF = async () => {
    if (!formData.hasPaid) {
      setShowPaymentModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await coverLetterService.downloadPaidPDF({
        ...formData,
        content: `${formData.introduction}\n\n${formData.experience}\n\n${formData.companyFit}\n\n${formData.closing}`
      });

      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover_letter_${formData.companyName}_${formData.jobTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading cover letter:', error);
      alert('Error downloading cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openAIChat = (paragraphType: string) => {
    setActiveChatParagraph(paragraphType);
  };

  const closeAIChat = () => {
    setActiveChatParagraph(null);
  };

  const handleParagraphUpdate = (paragraphType: keyof FormData, content: string) => {
    updateFormData({ [paragraphType]: content });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.personalName && formData.personalEmail && formData.companyName);
      case 2:
        return !!(formData.jobTitle && formData.jobBoard);
      case 3:
        return !!(formData.introduction && formData.experience && formData.companyFit && formData.closing);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
              <p className="text-gray-600">Enter your details and the employer's information.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  Your Information
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalName}
                    onChange={(e) => updateFormData({ personalName: e.target.value })}
                    placeholder="e.g., Jane Doe"
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
                    placeholder="e.g., jane.doe@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.personalPhone}
                    onChange={(e) => updateFormData({ personalPhone: e.target.value })}
                    placeholder="e.g., (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinProfile}
                    onChange={(e) => updateFormData({ linkedinProfile: e.target.value })}
                    placeholder="e.g., https://linkedin.com/in/janedoe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Employer Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-blue-500" />
                  Employer Information
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateFormData({ companyName: e.target.value })}
                    placeholder="e.g., Tech Corp Inc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hiring Manager Name
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => updateFormData({ employerName: e.target.value })}
                    placeholder="e.g., John Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address
                  </label>
                  <textarea
                    value={formData.employerAddress}
                    onChange={(e) => updateFormData({ employerAddress: e.target.value })}
                    placeholder="Enter company address..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
              </div>
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
                  Where did you find this job? *
                </label>
                <input
                  type="text"
                  value={formData.jobBoard}
                  onChange={(e) => updateFormData({ jobBoard: e.target.value })}
                  placeholder="e.g., LinkedIn, Indeed, Company Website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
              <p className="text-gray-600">Craft each paragraph with AI assistance. Click the AI Assistant button to get help writing each section.</p>
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
                    onClick={() => openAIChat(paragraph.id)}
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
                    onChange={(e) => handleParagraphUpdate(paragraph.id as keyof FormData, e.target.value)}
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
              {/* Preview */}
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
                    <CoverLetterPDFPreview
                      personalName={formData.personalName}
                      personalAddress={formData.personalAddress}
                      personalEmail={formData.personalEmail}
                      personalPhone={formData.personalPhone}
                      linkedinProfile={formData.linkedinProfile}
                      employerName={formData.employerName}
                      companyName={formData.companyName}
                      employerAddress={formData.employerAddress}
                      jobTitle={formData.jobTitle}
                      jobBoard={formData.jobBoard}
                      introduction={formData.introduction}
                      experience={formData.experience}
                      companyFit={formData.companyFit}
                      closing={formData.closing}
                    />
                  </div>
                )}
              </div>
              
              {/* Download Section */}
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
                onClick={onClose}
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

      {/* AI Chat Modal */}
      {activeChatParagraph && (
        <AIParagraphChat
          paragraphType={activeChatParagraph}
          currentContent={formData[activeChatParagraph as keyof FormData] as string}
          onContentUpdate={(content) => handleParagraphUpdate(activeChatParagraph as keyof FormData, content)}
          jobTitle={formData.jobTitle}
          companyName={formData.companyName}
          onClose={closeAIChat}
        />
      )}

      {/* Payment Modal */}
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        formData={formData}
        documentType="Cover Letter"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

                    placeholder="Enter company address..."

                    rows={3}

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"

                  />

                </div>

              </div>

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

                  Where did you find this job? *

                </label>

                <input

                  type="text"

                  value={formData.jobBoard}

                  onChange={(e) => updateFormData({ jobBoard: e.target.value })}

                  placeholder="e.g., LinkedIn, Indeed, Company Website"

                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                  required

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

              <p className="text-gray-600">Craft each paragraph with AI assistance. Click the AI Assistant button to get help writing each section.</p>

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

                    onClick={() => openAIChat(paragraph.id)}

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

                    onChange={(e) => handleParagraphUpdate(paragraph.id as keyof FormData, e.target.value)}

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

              {/* Preview */}

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

                    <CoverLetterPDFPreview

                      personalName={formData.personalName}

                      personalAddress={formData.personalAddress}

                      personalEmail={formData.personalEmail}

                      personalPhone={formData.personalPhone}

                      linkedinProfile={formData.linkedinProfile}

                      employerName={formData.employerName}

                      companyName={formData.companyName}

                      employerAddress={formData.employerAddress}

                      jobTitle={formData.jobTitle}

                      jobBoard={formData.jobBoard}

                      introduction={formData.introduction}

                      experience={formData.experience}

                      companyFit={formData.companyFit}

                      closing={formData.closing}

                    />

                  </div>

                )}

              </div>

              

              {/* Download Section */}

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

                onClick={onClose}

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



      {/* AI Chat Modal */}

      {activeChatParagraph && (

        <AIParagraphChat

          paragraphType={activeChatParagraph}

          currentContent={formData[activeChatParagraph as keyof FormData] as string}

          onContentUpdate={(content) => handleParagraphUpdate(activeChatParagraph as keyof FormData, content)}

          jobTitle={formData.jobTitle}

          companyName={formData.companyName}

          onClose={closeAIChat}

        />

      )}



      {/* Payment Modal */}

      <MpesaPaymentModal

        isOpen={showPaymentModal}

        onClose={() => setShowPaymentModal(false)}

        formData={formData}

        documentType="Cover Letter"

        onSuccess={handlePaymentSuccess}

      />

    </div>

  );

};


