import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { MpesaPaymentModal } from '../payments/MpesaPaymentModal';
import { 
  FileText, 
  User, 
  Building, 
  Briefcase, 
  Mail, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Download,
  Eye,
  Edit3,
  Sparkles,
  Upload,
  Plus,
  X,
  Star,
  Heart,
  Target,
  Award,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Globe,
  Code,
  BookOpen,
  Lightbulb,
  Wand2,
  RefreshCw,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { coverLetterService } from '../../services/coverLetterService';
import { resumeService, ParsedResume } from '../../services/resumeService';
import { useApi, useApiMutation } from '../../hooks/useApi';
import api from '../../config/api';
import { CoverLetterTemplate, CoverLetterTemplateWithPlaceholders } from './CoverLetterTemplate';
import { FileUpload } from '../common/FileUpload';
import { ResumePreview } from './ResumePreview';
import { AIContentGenerator } from './AIContentGenerator';

interface CoverLetterBuilderProps {
  onSuccess: (coverLetterId: number) => void;
  onClose: () => void;
}

interface FormData {
  // Step 1: Resume Selection
  selectedResumeId: number | null;
  selectedParsedResumeId: number | null;
  uploadedFile: File | null;
  isBlankCoverLetter: boolean;
  
  // Step 2: Job Details
  jobTitle: string;
  jobDescription: string;
  jobBoard: string;
  jobLocation: string;
  salaryRange: string;
  employmentType: string;
  experienceLevel: string;
  
  // Step 3: Employer Details
  employerName: string;
  employerEmail: string;
  employerAddress: string;
  companyName: string;
  companyWebsite: string;
  companySize: string;
  companyIndustry: string;
  companyValues: string[];
  companyMission: string;
  
  // Step 4: Personal Details
  personalName: string;
  personalEmail: string;
  personalPhone: string;
  personalAddress: string;
  linkedinProfile: string;
  portfolioWebsite: string;
  githubProfile: string;
  personalSummary: string;
  
  // Step 5: Skills & Competencies
  technicalSkills: string[];
  softSkills: string[];
  industryKnowledge: string[];
  certifications: string[];
  languages: string[];
  tools: string[];
  
  // Step 6: Experience & Achievements
  keyAchievements: string[];
  relevantExperience: string;
  quantifiableResults: string[];
  leadershipExperience: string;
  projectHighlights: string[];
  
  // Paragraph Personalization
  personalExperienceParagraph: string;
  personalMotivationParagraph: string;
  additionalPersonalParagraph: string;
  
  // Step 7: Motivation & Fit
  whyThisCompany: string;
  whyThisRole: string;
  careerGoals: string;
  uniqueValue: string;
  culturalFit: string;
  
  // Step 8: Cover Letter Content
  coverLetterContent: string;
  
  // Step 9: AI Enhancement
  templateId: number | null;
  tone: string;
  industry: string;
  aiOptimization: boolean;
  keywordDensity: number;
  atsOptimization: boolean;
  personalizationLevel: 'basic' | 'moderate' | 'high';
  
  // Advanced Formatting
  fontSize: 'small' | 'medium' | 'large';
  lineSpacing: 'single' | '1.5' | 'double';
  marginSize: 'narrow' | 'standard' | 'wide';
  fontFamily: 'arial' | 'times' | 'calibri' | 'georgia';
  
  // Content Sections
  introduction: string;
  experience: string;
  companyFit: string;
  closing: string;
  
  // Paragraph Enhancement States
  paragraphEnhancements: {
    introduction: { isEnhanced: false, enhancedContent: '', aiSuggestions: [] },
    experience: { isEnhanced: false, enhancedContent: '', aiSuggestions: [] },
    companyFit: { isEnhanced: false, enhancedContent: '', aiSuggestions: [] },
    closing: { isEnhanced: false, enhancedContent: '', aiSuggestions: [] }
  }
}

const initialFormData: FormData = {
  selectedResumeId: null,
  selectedParsedResumeId: null,
  uploadedFile: null,
  isBlankCoverLetter: false,
  
  // Job Details
  jobTitle: '',
  jobDescription: '',
  jobBoard: '',
  jobLocation: '',
  salaryRange: '',
  employmentType: 'Full-time',
  experienceLevel: 'Mid-level',
  
  // Employer Details
  employerName: '',
  employerEmail: '',
  employerAddress: '',
  companyName: '',
  companyWebsite: '',
  companySize: '',
  companyIndustry: '',
  companyValues: [],
  companyMission: '',
  
  // Personal Details
  personalName: '',
  personalEmail: '',
  personalPhone: '',
  personalAddress: '',
  linkedinProfile: '',
  portfolioWebsite: '',
  githubProfile: '',
  personalSummary: '',
  
  // Skills & Competencies
  technicalSkills: [],
  softSkills: [],
  industryKnowledge: [],
  certifications: [],
  languages: [],
  tools: [],
  
  // Experience & Achievements
  keyAchievements: [],
  relevantExperience: '',
  quantifiableResults: [],
  leadershipExperience: '',
  projectHighlights: [],
  
  // Paragraph Personalization
  personalExperienceParagraph: '',
  personalMotivationParagraph: '',
  additionalPersonalParagraph: '',
  
  // Motivation & Fit
  whyThisCompany: '',
  whyThisRole: '',
  careerGoals: '',
  uniqueValue: '',
  culturalFit: '',
  
  // Cover Letter Content
  coverLetterContent: '',
  
  // AI Enhancement
  templateId: null,
  tone: 'Professional',
  industry: 'Technology',
  aiOptimization: true,
  keywordDensity: 2,
  atsOptimization: true,
  personalizationLevel: 'moderate',
  
  // Advanced Formatting
  fontSize: 'medium',
  lineSpacing: '1.5',
  marginSize: 'standard',
  fontFamily: 'arial',
  
  // Content Sections
  introduction: '',
  experience: '',
  companyFit: '',
  closing: '',
  
  // Paragraph Enhancement States
  paragraphEnhancements: {
    introduction: { isEnhanced: false, enhancedContent: '', aiSuggestions: [] },
    experience: { isEnhanced: false, enhancedContent: '', aiSuggestions: [] },
    companyFit: { isEnhanced: false, enhancedContent: '', aiSuggestions: [] },
    closing: { isEnhanced: false, enhancedContent: '', aiSuggestions: [] }
  }
};

const steps = [
  { id: 1, title: 'Select Resume', icon: FileText, description: 'Choose your resume to analyze' },
  { id: 2, title: 'Job Details', icon: Briefcase, description: 'Enter comprehensive job information' },
  { id: 3, title: 'Company Research', icon: Building, description: 'Research company and employer details' },
  { id: 4, title: 'Personal Profile', icon: User, description: 'Your comprehensive profile information' },
  { id: 5, title: 'Skills & Competencies', icon: Sparkles, description: 'Technical and soft skills' },
  { id: 6, title: 'Experience & Achievements', icon: Star, description: 'Key accomplishments and results' },
  { id: 7, title: 'Write Cover Letter', icon: Edit3, description: 'Craft your cover letter paragraphs with AI assistance' },
  { id: 8, title: 'AI Enhancement', icon: Brain, description: 'AI-powered optimization and generation' },
  { id: 9, title: 'Review & Download', icon: CheckCircle, description: 'Final review and download' }
];

export const CoverLetterBuilder: React.FC<CoverLetterBuilderProps> = ({ 
  onSuccess, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedParsedResume, setSelectedParsedResume] = useState<ParsedResume | null>(null);
  const [isEnhancingJobDescription, setIsEnhancingJobDescription] = useState(false);
  const [jobDescriptionEnhancement, setJobDescriptionEnhancement] = useState<string>('');
  const [enhancingParagraph, setEnhancingParagraph] = useState<string | null>(null);
  const [showTips, setShowTips] = useState<string | null>(null);
  const [showAIContentGenerator, setShowAIContentGenerator] = useState(false);
  const [currentParagraphType, setCurrentParagraphType] = useState<'introduction' | 'experience' | 'companyFit' | 'closing' | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  // API hooks
  const { data: resumes, loading: resumesLoading } = useApi(resumeService.getUserResumes);
  const { data: parsedResumes, loading: parsedResumesLoading, execute: refetchParsedResumes } = useApi(resumeService.getParsedResumes);
  const { data: templates, loading: templatesLoading } = useApi(coverLetterService.getTemplates);
  
  const generateCoverLetterMutation = useApiMutation(coverLetterService.generateCoverLetter);
  const createCoverLetterMutation = useApiMutation(coverLetterService.createCoverLetter);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Helper function to handle comma-separated input fields
  const handleCommaSeparatedInput = (value: string, field: keyof FormData) => {
    // Only process if the value ends with a comma or contains multiple items
    if (value.endsWith(',') || value.includes(',')) {
      const items = value.split(',').map(item => item.trim()).filter(item => item);
      updateFormData({ [field]: items });
    } else {
      // For single items, keep as is until comma is added
      updateFormData({ [field]: value ? [value] : [] });
    }
  };

  // Helper function to handle comma-separated input on blur (when user finishes typing)
  const handleCommaSeparatedBlur = (value: string, field: keyof FormData) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    updateFormData({ [field]: items });
  };

  const handleFileUpload = async (file: File) => {
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      const response = await resumeService.uploadResume(file);
      if (response.success) {
        setUploadSuccess(true);
        updateFormData({ 
          uploadedFile: file,
          selectedParsedResumeId: response.parsed_resume_id 
        });
        await refetchParsedResumes();
      } else {
        setUploadError(response.message || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadError('Error uploading resume. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveUploadedFile = () => {
    setFormData(prev => ({ 
      ...prev, 
      uploadedFile: null, 
      selectedParsedResumeId: null 
    }));
    setUploadSuccess(false);
    setUploadError(null);
  };

  const handleParsedResumeSelect = (parsedResume: ParsedResume) => {
    setSelectedParsedResume(parsedResume);
    updateFormData({ 
      selectedParsedResumeId: parsedResume.id,
      selectedResumeId: null, // Clear regular resume selection
      isBlankCoverLetter: false // Clear blank cover letter flag
    });
  };

  const handleRegularResumeSelect = (resumeId: number) => {
    setSelectedParsedResume(null);
    updateFormData({ 
      selectedResumeId: resumeId,
      selectedParsedResumeId: null, // Clear parsed resume selection
      isBlankCoverLetter: false // Clear blank cover letter flag
    });
  };

  const handleBlankCoverLetterSelect = () => {
    setSelectedParsedResume(null);
    updateFormData({ 
      selectedResumeId: null,
      selectedParsedResumeId: null,
      uploadedFile: null
    });
    // Set a flag to indicate this is a blank cover letter
    updateFormData({ 
      isBlankCoverLetter: true 
    });
  };

  const handleEnhanceJobDescription = async () => {
    if (!formData.jobDescription.trim()) return;
    
    setIsEnhancingJobDescription(true);
    setJobDescriptionEnhancement('');
    
    try {
      // Use the existing API service instead of fetch
      const response = await coverLetterService.enhanceJobDescription({
        job_description: formData.jobDescription,
        job_title: formData.jobTitle || 'Software Engineer',
        industry: formData.industry || 'Technology'
      });
      
      if (response.success) {
        setJobDescriptionEnhancement(response.enhanced_description);
      } else {
        // Fallback: Use local enhancement if the API fails
        const enhanced = await enhanceJobDescriptionLocally(formData.jobDescription);
        setJobDescriptionEnhancement(enhanced);
      }
    } catch (error) {
      console.error('Error enhancing job description:', error);
      // Fallback: Use local enhancement
      const enhanced = await enhanceJobDescriptionLocally(formData.jobDescription);
      setJobDescriptionEnhancement(enhanced);
    } finally {
      setIsEnhancingJobDescription(false);
    }
  };

  const enhanceJobDescriptionLocally = async (description: string): Promise<string> => {
    // Simple local enhancement logic
    const enhanced = description
      .replace(/\b(you will|you'll)\b/gi, 'the candidate will')
      .replace(/\b(you are|you're)\b/gi, 'the candidate is')
      .replace(/\b(you have|you've)\b/gi, 'the candidate has')
      .replace(/\b(you can|you'll be able to)\b/gi, 'the candidate can')
      .replace(/\b(we are|we're)\b/gi, 'the company is')
      .replace(/\b(our|ours)\b/gi, 'the company\'s')
      .replace(/\b(team|teams)\b/gi, 'cross-functional teams')
      .replace(/\b(develop|developing|development)\b/gi, 'design, develop, and maintain')
      .replace(/\b(innovative|innovation)\b/gi, 'cutting-edge and innovative')
      .replace(/\b(scalable|secure|efficient)\b/gi, 'scalable, secure, and efficient');
    
    return enhanced;
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

  // Simple approach: Just use the form data directly - no complex generation
  const generatePersonalizedCoverLetter = () => {
    return {
      introduction: formData.introduction || '',
      experience: formData.experience || '',
      companyFit: formData.companyFit || '',
      closing: formData.closing || ''
    };
  };

  const generateCoverLetter = async () => {
    if (!formData.selectedResumeId && !formData.selectedParsedResumeId && !formData.isBlankCoverLetter) {
      alert('Please select a resume or choose to create a blank cover letter first');
      return;
    }

    // Show payment modal instead of directly generating
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (submissionId: number) => {
    setSubmissionId(submissionId);
    setShowPaymentModal(false);
    // You can add additional success handling here
  };

  const saveCoverLetter = async () => {
    try {
      const response = await createCoverLetterMutation.mutateAsync({
        title: `Cover Letter - ${formData.jobTitle} at ${formData.companyName}`,
        content: formData.coverLetterContent,
        job_title: formData.jobTitle,
        company_name: formData.companyName,
        employer_name: formData.employerName,
        employer_email: formData.employerEmail,
        employer_address: formData.employerAddress,
        personal_name: formData.personalName,
        personal_email: formData.personalEmail,
        personal_phone: formData.personalPhone,
        personal_address: formData.personalAddress,
        template_id: formData.templateId,
        tone: formData.tone,
        industry: formData.industry
      });

      if (response.success) {
        onSuccess(response.cover_letter_id);
      } else {
        alert('Failed to save cover letter: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving cover letter:', error);
      alert('Error saving cover letter. Please try again.');
    }
  };

  const downloadCoverLetter = async () => {
    try {
      const response = await coverLetterService.downloadCoverLetter({
        content: formData.coverLetterContent,
        job_title: formData.jobTitle,
        company_name: formData.companyName,
        employer_name: formData.employerName,
        employer_email: formData.employerEmail,
        employer_address: formData.employerAddress,
        personal_name: formData.personalName,
        personal_email: formData.personalEmail,
        personal_phone: formData.personalPhone,
        personal_address: formData.personalAddress
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
    }
  };

  // AI Enhancement Functions
  const enhanceParagraph = async (paragraphType: 'introduction' | 'experience' | 'companyFit' | 'closing', enhancementType: string) => {
    const paragraph = formData.paragraphEnhancements[paragraphType];
    if (!paragraph) return;

    setEnhancingParagraph(paragraphType);
    
    try {
      const response = await api.post('/francisca/ai/enhance-paragraph', {
        content: formData[paragraphType],
        enhancement_type: enhancementType,
        job_title: formData.jobTitle,
        company_name: formData.companyName,
        job_description: formData.jobDescription,
        tone: formData.tone,
        industry: formData.industry
      });

      const data = response.data;
      
      if (data.success) {
        updateFormData({
          paragraphEnhancements: {
            ...formData.paragraphEnhancements,
            [paragraphType]: {
              isEnhanced: true,
              enhancedContent: data.enhanced_content,
              aiSuggestions: data.suggestions || []
            }
          }
        });
      }
    } catch (error) {
      console.error('Error enhancing paragraph:', error);
    } finally {
      setEnhancingParagraph(null);
    }
  };

  const generateSuggestions = async (paragraphType: 'introduction' | 'experience' | 'companyFit' | 'closing') => {
    try {
      const response = await api.post('/francisca/ai/generate-suggestions', {
        paragraph_type: paragraphType,
        current_content: formData[paragraphType],
        job_title: formData.jobTitle,
        company_name: formData.companyName,
        job_description: formData.jobDescription
      });

      const data = response.data;
      
      if (data.success) {
        updateFormData({
          paragraphEnhancements: {
            ...formData.paragraphEnhancements,
            [paragraphType]: {
              ...formData.paragraphEnhancements[paragraphType],
              aiSuggestions: data.suggestions || []
            }
          }
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const useEnhancedContent = (paragraphType: 'introduction' | 'experience' | 'companyFit' | 'closing') => {
    const enhancement = formData.paragraphEnhancements[paragraphType];
    if (enhancement.isEnhanced) {
      updateFormData({
        [paragraphType]: enhancement.enhancedContent,
        paragraphEnhancements: {
          ...formData.paragraphEnhancements,
          [paragraphType]: {
            ...enhancement,
            isEnhanced: false,
            enhancedContent: ''
          }
        }
      });
    }
  };

  const dismissEnhancedContent = (paragraphType: 'introduction' | 'experience' | 'companyFit' | 'closing') => {
    updateFormData({
      paragraphEnhancements: {
        ...formData.paragraphEnhancements,
        [paragraphType]: {
          ...formData.paragraphEnhancements[paragraphType],
          isEnhanced: false,
          enhancedContent: ''
        }
      }
    });
  };

  const openAIContentGenerator = (paragraphType: 'introduction' | 'experience' | 'companyFit' | 'closing') => {
    setCurrentParagraphType(paragraphType);
    setShowAIContentGenerator(true);
  };

  const closeAIContentGenerator = () => {
    setShowAIContentGenerator(false);
    setCurrentParagraphType(null);
  };

  const handleParagraphUpdate = (paragraphType: 'introduction' | 'experience' | 'companyFit' | 'closing', content: string) => {
    updateFormData({ [paragraphType]: content });
  };

  const getUserDataForAI = () => ({
    name: formData.personalName,
    experience: formData.relevantExperience,
    skills: [...formData.technicalSkills, ...formData.softSkills],
    achievements: formData.keyAchievements,
    motivation: formData.personalMotivationParagraph
  });

  // Draft management functions
  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const draftData = {
        id: Date.now().toString(),
        title: `Draft - ${formData.jobTitle || 'Cover Letter'} at ${formData.companyName || 'Company'}`,
        createdAt: new Date().toISOString(),
        formData: formData,
        currentStep: currentStep
      };

      // Save to localStorage
      const existingDrafts = JSON.parse(localStorage.getItem('coverLetterDrafts') || '[]');
      existingDrafts.push(draftData);
      localStorage.setItem('coverLetterDrafts', JSON.stringify(existingDrafts));
      
      setDrafts(existingDrafts);
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const loadDraft = (draft: any) => {
    setIsLoadingDraft(true);
    try {
      setFormData(draft.formData);
      setCurrentStep(draft.currentStep);
      setShowDraftModal(false);
      alert('Draft loaded successfully!');
    } catch (error) {
      console.error('Error loading draft:', error);
      alert('Failed to load draft. Please try again.');
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const deleteDraft = (draftId: string) => {
    try {
      const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
      localStorage.setItem('coverLetterDrafts', JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      alert('Draft deleted successfully!');
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft. Please try again.');
    }
  };

  const loadDrafts = () => {
    try {
      const savedDrafts = JSON.parse(localStorage.getItem('coverLetterDrafts') || '[]');
      setDrafts(savedDrafts);
      setShowDraftModal(true);
    } catch (error) {
      console.error('Error loading drafts:', error);
      alert('Failed to load drafts. Please try again.');
    }
  };

  const renderStepContent = () => {
    console.log('Rendering step content for step:', currentStep);
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Select Your Resume</h3>
            <p className="text-gray-600">
              Choose a resume to analyze and extract relevant information for your cover letter.
            </p>
            
            {/* Resume Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-gray-900">Upload New Resume</h4>
              </div>
              <FileUpload
                onFileSelect={handleFileUpload}
                onFileRemove={handleRemoveUploadedFile}
                acceptedTypes={['.pdf', '.docx', '.doc', '.txt']}
                maxSize={16}
                loading={uploadLoading}
                selectedFile={formData.uploadedFile}
                error={uploadError}
                success={uploadSuccess}
                placeholder="Upload your resume file (PDF, DOCX, DOC, TXT)"
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Existing Resumes Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-500" />
                <h4 className="font-medium text-gray-900">Select from Existing Resumes</h4>
              </div>
              
              {/* Parsed Resumes */}
              {parsedResumes && parsedResumes.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700">Uploaded & Parsed Resumes</h5>
                  <div className="grid gap-3">
                    {parsedResumes.map((parsedResume: ParsedResume) => (
                      <Card
                        key={parsedResume.id}
                        className={`transition-all cursor-pointer ${
                          formData.selectedParsedResumeId === parsedResume.id
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleParsedResumeSelect(parsedResume)}
                      >
                        <div className="flex items-center space-x-4">
                          <FileText className="w-8 h-8 text-green-500" />
                          <div className="flex-1">
                            <h4 className="font-medium">{parsedResume.original_filename}</h4>
                            <p className="text-sm text-gray-500">
                              Parsed: {new Date(parsedResume.created_at).toLocaleDateString()}
                            </p>
                            {parsedResume.parsed_data.personal_info?.name && (
                              <p className="text-xs text-blue-600">
                                {parsedResume.parsed_data.personal_info.name}
                              </p>
                            )}
                          </div>
                          {formData.selectedParsedResumeId === parsedResume.id && (
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Resumes */}
              {resumesLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700">Created Resumes</h5>
                  <div className="grid gap-3">
                    {Array.isArray(resumes) ? resumes.map((resume: any, index: number) => (
                      <Card
                        key={resume.resume_id || `resume-${index}`}
                        className={`transition-all cursor-pointer ${
                          formData.selectedResumeId === resume.resume_id
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleRegularResumeSelect(resume.resume_id)}
                      >
                        <div className="flex items-center space-x-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <div className="flex-1">
                            <h4 className="font-medium">{resume.title || 'Untitled Resume'}</h4>
                            <p className="text-sm text-gray-500">
                              Created: {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                          {formData.selectedResumeId === resume.resume_id && (
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                      </Card>
                    )) : (
                      <div className="text-center py-4 text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No resumes found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Create Blank Cover Letter Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium text-gray-900">Create Blank Cover Letter</h4>
              </div>
              <p className="text-sm text-gray-600">
                Start from scratch without a resume. You'll fill in all the information manually.
              </p>
              <Card
                className={`transition-all cursor-pointer hover:shadow-md border-2 border-dashed ${
                  formData.isBlankCoverLetter
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-purple-300 hover:border-purple-400'
                }`}
                onClick={() => handleBlankCoverLetterSelect()}
              >
                <div className="flex items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    {formData.isBlankCoverLetter ? (
                      <CheckCircle className="w-12 h-12 text-purple-500 mx-auto" />
                    ) : (
                    <Plus className="w-12 h-12 text-purple-500 mx-auto" />
                    )}
                    <h5 className="font-medium text-gray-900">Start Blank Cover Letter</h5>
                    <p className="text-sm text-gray-500">
                      No resume required - create everything from scratch
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Selected Resume Preview */}
            {selectedParsedResume && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">Selected Resume Preview</h5>
                <ResumePreview parsedResume={selectedParsedResume} compact={true} />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                Comprehensive Job Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Provide detailed information about the position to create a targeted cover letter.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Job Information */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  Basic Information
                </h4>
                
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
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={formData.jobLocation}
                    onChange={(e) => updateFormData({ jobLocation: e.target.value })}
                    placeholder="e.g., San Francisco, CA (Remote)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => updateFormData({ employmentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => updateFormData({ experienceLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Entry-level">Entry-level (0-2 years)</option>
                    <option value="Mid-level">Mid-level (3-5 years)</option>
                    <option value="Senior-level">Senior-level (6-10 years)</option>
                    <option value="Executive">Executive (10+ years)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => updateFormData({ salaryRange: e.target.value })}
                    placeholder="e.g., $80,000 - $120,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Job Description */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                  Job Description
                </h4>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Job Description *
                  </label>
                  <Button
                    onClick={handleEnhanceJobDescription}
                    disabled={!formData.jobDescription.trim() || isEnhancingJobDescription}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-2 text-xs"
                  >
                    {isEnhancingJobDescription ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>{isEnhancingJobDescription ? 'Enhancing...' : 'AI Enhance'}</span>
                  </Button>
                </div>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => updateFormData({ jobDescription: e.target.value })}
                    placeholder="Paste the complete job description here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  required
                />
                {jobDescriptionEnhancement && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-blue-900">AI Enhanced Version</h5>
                      <Button
                        onClick={() => updateFormData({ jobDescription: jobDescriptionEnhancement })}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Use This Version
                      </Button>
                    </div>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {jobDescriptionEnhancement}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Board/Website *
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-500" />
                Company Research & Employer Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Research the company to create a personalized and targeted cover letter.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-blue-500" />
                  Company Information
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
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => updateFormData({ companyWebsite: e.target.value })}
                    placeholder="e.g., https://www.company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => updateFormData({ companySize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.companyIndustry}
                    onChange={(e) => updateFormData({ companyIndustry: e.target.value })}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Mission
                  </label>
                  <textarea
                    value={formData.companyMission}
                    onChange={(e) => updateFormData({ companyMission: e.target.value })}
                    placeholder="What is the company's mission statement?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Contact Information
                </h4>
              
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.employerEmail}
                  onChange={(e) => updateFormData({ employerEmail: e.target.value })}
                  placeholder="e.g., hiring@company.com"
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Values (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.companyValues.join(', ')}
                    onChange={(e) => handleCommaSeparatedInput(e.target.value, 'companyValues')}
                    onBlur={(e) => handleCommaSeparatedBlur(e.target.value, 'companyValues')}
                    placeholder="e.g., Innovation, Integrity, Collaboration"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Your contact details for the cover letter.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.personalName}
                  onChange={(e) => updateFormData({ personalName: e.target.value })}
                  placeholder="e.g., Jane Doe"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.personalAddress}
                  onChange={(e) => updateFormData({ personalAddress: e.target.value })}
                  placeholder="Enter your address..."
                  rows={3}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-y"
                />
              </div>
            </div>
          </div>
        );


      case 5:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                Skills & Competencies
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Technical and soft skills that make you a great fit for this role.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Technical Skills (comma-separated)
                </label>
                  <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
                  </Button>
                </div>
                <input
                  type="text"
                  value={formData.technicalSkills?.join(', ') || ''}
                  onChange={(e) => handleCommaSeparatedInput(e.target.value, 'technicalSkills')}
                  onBlur={(e) => handleCommaSeparatedBlur(e.target.value, 'technicalSkills')}
                  placeholder="e.g., JavaScript, React, Node.js, Python, SQL"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Soft Skills (comma-separated)
                </label>
                  <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
                  </Button>
                </div>
                <input
                  type="text"
                  value={formData.softSkills?.join(', ') || ''}
                  onChange={(e) => handleCommaSeparatedInput(e.target.value, 'softSkills')}
                  onBlur={(e) => handleCommaSeparatedBlur(e.target.value, 'softSkills')}
                  placeholder="e.g., Leadership, Communication, Problem-solving, Teamwork"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Industry Knowledge (comma-separated)
                </label>
                  <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
                  </Button>
              </div>
                <input
                  type="text"
                  value={formData.industryKnowledge?.join(', ') || ''}
                  onChange={(e) => handleCommaSeparatedInput(e.target.value, 'industryKnowledge')}
                  onBlur={(e) => handleCommaSeparatedBlur(e.target.value, 'industryKnowledge')}
                  placeholder="e.g., Agile methodologies, Cloud computing, Data analysis, UX/UI design"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
            </div>
            
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Certifications (comma-separated)
                  </label>
              <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
              </Button>
                </div>
                <input
                  type="text"
                  value={formData.certifications?.join(', ') || ''}
                  onChange={(e) => handleCommaSeparatedInput(e.target.value, 'certifications')}
                  onBlur={(e) => handleCommaSeparatedBlur(e.target.value, 'certifications')}
                  placeholder="e.g., AWS Certified Developer, PMP, Google Analytics Certified"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Star className="w-5 h-5 mr-2 text-blue-500" />
                Experience & Achievements
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Showcase your key accomplishments and relevant experience.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                  Key Achievements (one per line)
                </label>
                  <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
                  </Button>
                </div>
                <textarea
                  value={formData.keyAchievements.join('\n')}
                  onChange={(e) => updateFormData({ keyAchievements: e.target.value.split('\n').filter(a => a.trim()) })}
                  placeholder="• Led a team of 5 developers to deliver a critical project 40% ahead of schedule&#10;• Increased user engagement by 25% through innovative feature implementation&#10;• Reduced system response time by 60% through performance optimization"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                  Quantifiable Results (one per line)
                </label>
                  <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
                  </Button>
                </div>
                <textarea
                  value={formData.quantifiableResults.join('\n')}
                  onChange={(e) => updateFormData({ quantifiableResults: e.target.value.split('\n').filter(r => r.trim()) })}
                  placeholder="• Increased revenue by $2M through strategic partnerships&#10;• Reduced customer churn by 30% through improved onboarding&#10;• Managed a budget of $500K for marketing campaigns"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                  Relevant Experience
                </label>
                  <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
                  </Button>
                </div>
                <textarea
                  value={formData.relevantExperience}
                  onChange={(e) => updateFormData({ relevantExperience: e.target.value })}
                  placeholder="Describe your most relevant work experience that aligns with this position..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                  Leadership Experience
                </label>
                  <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
                  </Button>
              </div>
                <textarea
                  value={formData.leadershipExperience}
                  onChange={(e) => updateFormData({ leadershipExperience: e.target.value })}
                  placeholder="Describe any leadership roles, team management, or mentoring experience..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
            </div>
            
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                  Project Highlights (one per line)
                </label>
                  <Button
                    onClick={() => openAIContentGenerator('experience')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Help
                  </Button>
                </div>
                <textarea
                  value={formData.projectHighlights.join('\n')}
                  onChange={(e) => updateFormData({ projectHighlights: e.target.value.split('\n').filter(p => p.trim()) })}
                  placeholder="• E-commerce platform redesign that increased conversions by 40%&#10;• Mobile app development with 100K+ downloads&#10;• Data migration project handling 1M+ records"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
              
              {/* Paragraph Personalization Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Edit3 className="w-5 h-5 text-purple-500" />
                  <h4 className="text-lg font-semibold text-gray-900">Paragraph Personalization</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Write your own personalized paragraphs that will be used in your cover letter. This allows you to add unique content that reflects your personal voice and specific experiences.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Personal Experience Paragraph
                      </label>
                      <Button
                        onClick={() => openAIContentGenerator('experience')}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        AI Help
                      </Button>
                    </div>
                    <textarea
                      value={formData.personalExperienceParagraph || ''}
                      onChange={(e) => updateFormData({ personalExperienceParagraph: e.target.value })}
                      placeholder="Write a paragraph about your most relevant experience that you want to highlight in your cover letter. This will be used to enhance the experience section..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Personal Motivation Paragraph
                      </label>
                      <Button
                        onClick={() => openAIContentGenerator('companyFit')}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        AI Help
                      </Button>
                    </div>
                    <textarea
                      value={formData.personalMotivationParagraph || ''}
                      onChange={(e) => updateFormData({ personalMotivationParagraph: e.target.value })}
                      placeholder="Write a paragraph about why you're interested in this specific role and company. This will be used to enhance the company fit section..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Personal Paragraph
                      </label>
                      <Button
                        onClick={() => openAIContentGenerator('experience')}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        AI Help
                      </Button>
                    </div>
                    <textarea
                      value={formData.additionalPersonalParagraph || ''}
                      onChange={(e) => updateFormData({ additionalPersonalParagraph: e.target.value })}
                      placeholder="Write any additional personal content you'd like to include in your cover letter. This could be about your unique value proposition, career goals, or other relevant information..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                <Edit3 className="w-6 h-6 mr-3 text-blue-500" />
                Write Your Cover Letter
              </h2>
              <p className="text-gray-600">Write each paragraph yourself with AI guidance and assistance</p>
            </div>

            {[
              { id: 'introduction', title: 'Opening Paragraph', description: 'Express interest and position yourself', icon: Heart },
              { id: 'experience', title: 'Experience Paragraph', description: 'Highlight your relevant experience', icon: Star },
              { id: 'companyFit', title: 'Company Fit Paragraph', description: 'Show company knowledge and cultural fit', icon: Building },
              { id: 'closing', title: 'Closing Paragraph', description: 'Call to action and professional closing', icon: CheckCircle2 }
            ].map((paragraph, index) => (
              <Card key={paragraph.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <paragraph.icon className="w-5 h-5 mr-2 text-blue-500" />
                        {paragraph.title}
                      </h3>
                      <p className="text-sm text-gray-500">{paragraph.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => openAIContentGenerator(paragraph.id as any)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      AI Assistant
                    </Button>
                  </div>
                </div>

                {/* Content Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Write your {paragraph.title.toLowerCase()}:
                    </label>
                    <textarea
                      value={formData[paragraph.id as keyof FormData] as string || ''}
                      onChange={(e) => handleParagraphUpdate(paragraph.id as any, e.target.value)}
                      placeholder={`Write your ${paragraph.title.toLowerCase()} here... Use the AI Assistant for guidance and suggestions.`}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      {(formData[paragraph.id as keyof FormData] as string || '').length} characters
                        </div>
                    </div>
                  
                  {(formData[paragraph.id as keyof FormData] as string || '') && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {formData[paragraph.id as keyof FormData] as string || ''}
                      </p>
                  </div>
                )}
                </div>

                {/* Enhancement Options */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { value: 'professional', label: 'Make More Professional', icon: Award },
                    { value: 'quantify', label: 'Add Quantifiable Results', icon: TrendingUp },
                    { value: 'clarity', label: 'Improve Clarity & Impact', icon: Zap },
                    { value: 'ats', label: 'Optimize for ATS', icon: Target },
                    { value: 'tone', label: 'Adjust Tone', icon: Users },
                    { value: 'rewrite', label: 'Complete Rewrite', icon: RefreshCw }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      onClick={() => enhanceParagraph(paragraph.id as any, option.value)}
                      disabled={enhancingParagraph === paragraph.id}
                      className="flex items-center space-x-2"
                    >
                      <option.icon className="w-4 h-4" />
                      <span>{option.label}</span>
                      {enhancingParagraph === paragraph.id && (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      )}
                    </Button>
                  ))}
                </div>

                {/* Enhanced Content Display */}
                {formData.paragraphEnhancements[paragraph.id as keyof typeof formData.paragraphEnhancements]?.isEnhanced && 
                 formData.paragraphEnhancements[paragraph.id as keyof typeof formData.paragraphEnhancements].enhancedContent && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-purple-900">AI Enhanced Version:</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => useEnhancedContent(paragraph.id as any)}
                        >
                          Use This Version
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dismissEnhancedContent(paragraph.id as any)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-purple-800">
                      {formData.paragraphEnhancements[paragraph.id as keyof typeof formData.paragraphEnhancements].enhancedContent}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        );

      case 8:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-500" />
                AI Enhancement
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Preview your cover letter and apply AI-powered enhancements.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Template Preview */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Template Preview</h4>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg overflow-x-auto">
              <CoverLetterTemplateWithPlaceholders
                personalName={formData.personalName || '[Your Name]'}
                personalAddress={formData.personalAddress || '[Your Address]\n[City, Postal Code]'}
                personalPhone={formData.personalPhone || '[Phone Number]'}
                personalEmail={formData.personalEmail || '[Email Address]'}
                linkedinProfile={formData.linkedinProfile || '[LinkedIn Profile (optional)]'}
                date={new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                employerName={formData.employerName || '[Hiring Manager\'s Name]'}
                companyName={formData.companyName || '[Company Name]'}
                companyAddress={formData.employerAddress || '[Company Address]\n[City, Postal Code]'}
                jobTitle={formData.jobTitle || '[Job Title]'}
                jobBoard={formData.jobBoard || '[Job Board/Company Website]'}
                introduction="I am writing to express my interest in the [Job Title] position at [Company Name], as advertised on [Job Board/Company Website]. With my [your field/skills] and [relevant interest connected to the role], I am confident in my ability to make a strong contribution to your team."
                experience="In my most recent role as [Your Most Recent Role/Experience] at [Company/Organization Name], I [describe a key achievement, responsibility, or project that shows your skills and impact - use numbers if possible]. This experience strengthened my [specific skill required in the new role] and taught me the importance of [value or principle relevant to the company's mission]."
                companyFit="What excites me most about [Company Name] is [something specific about the company — culture, innovation, mission, impact, etc.]. My [list 2-3 key skills] align perfectly with your needs, and I am eager to contribute to [specific project/goal of the company]."
                closing="I welcome the opportunity to discuss my background, skills, and enthusiasm for this role. Thank you for considering my application. I look forward to contributing to [Company Name]'s continued success."
              />
                </div>
              </div>
              
              {/* AI Enhancement Options */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">AI Enhancement Options</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Tone & Style</h5>
                    <select
                      value={formData.tone}
                      onChange={(e) => updateFormData({ tone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Friendly">Friendly</option>
                      <option value="Confident">Confident</option>
                      <option value="Enthusiastic">Enthusiastic</option>
                    </select>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Industry Focus</h5>
                    <select
                      value={formData.industry}
                      onChange={(e) => updateFormData({ industry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Personalization Level</h5>
                    <select
                      value={formData.personalizationLevel}
                      onChange={(e) => updateFormData({ personalizationLevel: e.target.value as 'basic' | 'moderate' | 'high' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="basic">Basic</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">ATS Optimization</h5>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.atsOptimization}
                        onChange={(e) => updateFormData({ atsOptimization: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Enable ATS optimization</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Generate Button */}
              <div className="flex justify-center pt-6">
                <Button
                  onClick={generateCoverLetter}
                  disabled={isGenerating || (!formData.selectedResumeId && !formData.selectedParsedResumeId && !formData.isBlankCoverLetter)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg"
                >
                  {isGenerating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                  <span>
                    {isGenerating ? 'Generating Your Personalized Cover Letter...' : 'Pay & Generate Cover Letter (KES 300)'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Review & Download</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Review your generated cover letter and download it.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{previewMode ? 'Edit' : 'Preview'}</span>
              </Button>
              
              <Button
                onClick={downloadCoverLetter}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </Button>
            </div>
            
            {previewMode ? (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto">
                <CoverLetterTemplate
                  personalName={formData.personalName}
                  personalAddress={formData.personalAddress}
                  personalPhone={formData.personalPhone}
                  personalEmail={formData.personalEmail}
                  linkedinProfile={formData.linkedinProfile}
                  date={new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  employerName={formData.employerName}
                  companyName={formData.companyName}
                  companyAddress={formData.employerAddress}
                  jobTitle={formData.jobTitle}
                  jobBoard={formData.jobBoard}
                  introduction={formData.introduction || ''}
                  experience={formData.experience || ''}
                  companyFit={formData.companyFit || ''}
                  closing={formData.closing || ''}
                  fontSize={formData.fontSize}
                  lineSpacing={formData.lineSpacing}
                  marginSize={formData.marginSize}
                  fontFamily={formData.fontFamily}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Introduction Paragraph
                  </label>
                  <textarea
                    value={formData.introduction || ''}
                    onChange={(e) => updateFormData({ introduction: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-y"
                    placeholder="I am writing to express my interest in the [Job Title] position at [Company Name]..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Paragraph
                  </label>
                  <textarea
                    value={formData.experience || ''}
                    onChange={(e) => updateFormData({ experience: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-y"
                    placeholder="In my most recent role as [Your Most Recent Role/Experience] at [Company/Organization Name]..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Fit Paragraph
                  </label>
                  <textarea
                    value={formData.companyFit || ''}
                    onChange={(e) => updateFormData({ companyFit: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-y"
                    placeholder="What excites me most about [Company Name] is..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Paragraph
                  </label>
                  <textarea
                    value={formData.closing || ''}
                    onChange={(e) => updateFormData({ closing: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-y"
                    placeholder="I welcome the opportunity to discuss my background, skills, and enthusiasm for this role..."
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button
                onClick={saveCoverLetter}
                disabled={createCoverLetterMutation.isLoading}
                className="flex items-center space-x-2"
              >
                {createCoverLetterMutation.isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>Save Cover Letter</span>
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create Cover Letter
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Follow the steps below to create a professional cover letter with AI assistance.
          </p>
            </div>
            
            {/* Draft Management Buttons */}
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={loadDrafts}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Load Draft</span>
              </Button>
              
              <Button
                onClick={saveDraft}
                disabled={isSavingDraft}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {isSavingDraft ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Save Draft</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Steps - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          {/* Desktop Progress Steps */}
          <div className="hidden md:flex items-center justify-between">
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

          {/* Mobile Progress Steps */}
          <div className="md:hidden">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs ${
                    currentStep >= step.id
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-3 h-3" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">
                Step {currentStep} of {steps.length}
              </div>
              <h3 className="text-base font-medium text-gray-900">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </div>
          
          {/* Desktop Step Info */}
          <div className="hidden md:block mt-4">
            <h3 className="text-lg font-medium text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-4 sm:p-6">
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

          {/* Navigation - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t space-y-4 sm:space-y-0">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              
              {currentStep < steps.length && (
                <Button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !formData.selectedResumeId && !formData.selectedParsedResumeId && !formData.isBlankCoverLetter) ||
                    (currentStep === 2 && (!formData.jobTitle || !formData.jobDescription)) ||
                    (currentStep === 3 && !formData.companyName) ||
                    (currentStep === 4 && (!formData.personalName || !formData.personalEmail))
                  }
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              

            </div>
          </div>
        </Card>
      </div>

      {/* AI Content Generator Modal */}
      {showAIContentGenerator && currentParagraphType && (
        <AIContentGenerator
          paragraphType={currentParagraphType}
          currentContent={formData[currentParagraphType]}
          onContentUpdate={(content) => handleParagraphUpdate(currentParagraphType, content)}
          jobTitle={formData.jobTitle}
          companyName={formData.companyName}
          userData={getUserDataForAI()}
          onClose={closeAIContentGenerator}
        />
      )}

      {/* Draft Management Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Saved Drafts</h2>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {drafts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No saved drafts found.</p>
                  <p className="text-sm text-gray-400 mt-2">Save your progress to see drafts here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{draft.title}</h3>
                          <p className="text-sm text-gray-500">
                            Saved on {new Date(draft.createdAt).toLocaleDateString()} at {new Date(draft.createdAt).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Step {draft.currentStep} of {steps.length}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => loadDraft(draft)}
                            disabled={isLoadingDraft}
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            {isLoadingDraft ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                            <span>Load</span>
                          </Button>
                          <Button
                            onClick={() => deleteDraft(draft.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
