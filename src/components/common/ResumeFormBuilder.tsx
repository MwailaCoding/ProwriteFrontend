import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Save,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Star,
  AlertCircle,
  Brain,
  Settings
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { PersonalDetailsSection } from './FormSections/PersonalDetailsSection';
import { WorkExperienceSection } from './FormSections/WorkExperienceSection';
import { EducationSection } from './FormSections/EducationSection';
import { SkillsAndAdditionalSection } from './FormSections/SkillsAndAdditionalSection';
import { AdvancedResumeFormBuilder } from './AdvancedResumeFormBuilder';
import { ResumeFormData } from '../../types';


interface ResumeFormBuilderProps {
  initialData?: ResumeFormData;
  onSave: (data: ResumeFormData) => void;
  onPreview: () => void;
  onNextStep: () => void;
  useAdvancedMode?: boolean;
}

// Default form data structure
const initialFormData: ResumeFormData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    country: '',
    dateOfBirth: '',
    placeOfBirth: '',
    drivingLicense: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    linkedin: '',
    website: '',
    photo: ''
  },
  resumeObjective: '',
  workExperience: [],
  education: [],
  skills: [],
  interests: '',
  references: [],
  certifications: [],
  languages: [],
  projects: [],
  awards: [],
  resumeTitle: 'My Professional Resume',
  language: 'English',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const totalSteps = 5;

export const ResumeFormBuilder: React.FC<ResumeFormBuilderProps> = ({
  initialData,
  onSave,
  onPreview,
  onNextStep,
  useAdvancedMode = true
}) => {
  // If advanced mode is enabled, use the new advanced form builder
  if (useAdvancedMode) {
    return (
      <AdvancedResumeFormBuilder
        initialData={initialData}
        onSave={onSave}
        onPreview={onPreview}
        onNextStep={onNextStep}
      />
    );
  }

  // Original form builder implementation
  return <OriginalResumeFormBuilder
    initialData={initialData}
    onSave={onSave}
    onPreview={onPreview}
    onNextStep={onNextStep}
  />;
};

// Original form builder component (renamed)
const OriginalResumeFormBuilder: React.FC<ResumeFormBuilderProps> = ({
  initialData,
  onSave,
  onPreview,
  onNextStep
}) => {
  // Ensure onNextStep is a function
  const safeOnNextStep = onNextStep || (() => {
    console.warn('onNextStep was not provided, using fallback');
    // Don't throw error, just log warning
  });
  console.log('ResumeFormBuilder: Component rendering...');
  console.log('ResumeFormBuilder props:', { initialData, onSave, onPreview, onNextStep });
  console.log('onNextStep type:', typeof onNextStep);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ResumeFormData>(() => {
    const savedData = localStorage.getItem('resumeFormData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Failed to parse saved form data", e);
        return initialData || initialFormData;
      }
    }
    return initialData || initialFormData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const saveToLocalStorage = useCallback((data: ResumeFormData) => {
    try {
      localStorage.setItem('resumeFormData', JSON.stringify(data));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  // Debounced save function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage(formData);
      onSave(formData);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, saveToLocalStorage, onSave]);

  // Form validation
  const validateCurrentStep = useCallback(() => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Personal Details
        if (!formData.personalInfo.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.personalInfo.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData.personalInfo.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;

      case 1: // Work Experience
        if (formData.workExperience.length === 0) {
          newErrors.workExperience = 'At least one work experience is required';
        } else {
          formData.workExperience.forEach((exp, index) => {
            if (!exp.jobTitle.trim()) {
              newErrors[`workExperience.${index}.jobTitle`] = 'Job title is required';
            }
            if (!exp.employer.trim()) {
              newErrors[`workExperience.${index}.employer`] = 'Employer is required';
            }
            if (!exp.description.trim()) {
              newErrors[`workExperience.${index}.description`] = 'Job description is required';
            }
          });
        }
        break;

      case 2: // Education
        if (formData.education.length === 0) {
          newErrors.education = 'At least one education entry is required';
        } else {
          formData.education.forEach((edu, index) => {
            if (!edu.degree.trim()) {
              newErrors[`education.${index}.degree`] = 'Degree is required';
            }
            if (!edu.fieldOfStudy.trim()) {
              newErrors[`education.${index}.fieldOfStudy`] = 'Field of study is required';
            }
            if (!edu.institution.trim()) {
              newErrors[`education.${index}.institution`] = 'Institution is required';
            }
          });
        }
        break;

      case 3: // Skills & Additional
        if (formData.skills.length === 0) {
          newErrors.skills = 'At least one skill is required';
        } else {
          formData.skills.forEach((skill, index) => {
            if (!skill.name.trim()) {
              newErrors[`skills.${index}.name`] = 'Skill name is required';
            }
          });
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<ResumeFormData>) => {
    setFormData(prev => {
      // Handle nested updates for personalInfo
      if (updates.personalInfo) {
        return {
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            ...updates.personalInfo
          },
          updatedAt: new Date().toISOString()
        };
      }
      
      // Handle nested updates for workExperience
      if (updates.workExperience) {
        return {
          ...prev,
          workExperience: updates.workExperience,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Handle nested updates for education
      if (updates.education) {
        return {
          ...prev,
          education: updates.education,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Handle nested updates for skills
      if (updates.skills) {
        return {
          ...prev,
          skills: updates.skills,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Handle nested updates for languages
      if (updates.languages) {
        return {
          ...prev,
          languages: updates.languages,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Handle nested updates for projects
      if (updates.projects) {
        return {
          ...prev,
          projects: updates.projects,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Handle nested updates for awards
      if (updates.awards) {
        return {
          ...prev,
          awards: updates.awards,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Handle nested updates for certifications
      if (updates.certifications) {
        return {
          ...prev,
          certifications: updates.certifications,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Handle other direct updates
      return {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        console.log('Form completed, calling onNextStep...');
        safeOnNextStep();
      }
    }
  }, [currentStep, validateCurrentStep, safeOnNextStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Manual save function
  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage and notify parent component
      saveToLocalStorage(formData);
      onSave(formData);
    } catch (error) {
      console.error('Failed to save form data:', error);
      // Fallback to localStorage
      saveToLocalStorage(formData);
      onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  // Step titles and icons
  const steps = [
    { title: 'Personal Details', icon: User, description: 'Basic information and contact details' },
    { title: 'Work Experience', icon: Briefcase, description: 'Professional background and achievements' },
    { title: 'Education', icon: GraduationCap, description: 'Academic qualifications and training' },
    { title: 'Skills & Additional', icon: Star, description: 'Skills, languages, and other information' },
    { title: 'AI Optimization', icon: Brain, description: 'AI-powered resume optimization and insights' }
  ];

  // Render current step content
  const renderStepContent = () => {
    try {
      switch (currentStep) {
      case 0:
        return (
          <PersonalDetailsSection
            personalInfo={formData.personalInfo}
            onUpdate={(updates) => updateFormData({ personalInfo: updates })}
            errors={errors}
          />
        );
      case 1:
        return (
          <WorkExperienceSection
            workExperience={formData.workExperience}
            onUpdate={(updates) => updateFormData({ workExperience: updates })}
            errors={errors}
          />
        );
      case 2:
        return (
          <EducationSection
            education={formData.education}
            onUpdate={(updates) => updateFormData({ education: updates })}
            errors={errors}
          />
        );
      case 3:
        return (
          <SkillsAndAdditionalSection
            skills={formData.skills}
            languages={formData.languages}
            interests={formData.interests}
            projects={formData.projects}
            awards={formData.awards}
            certifications={formData.certifications}
            onUpdate={(updates) => updateFormData(updates)}
            errors={errors}
          />
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">AI-Powered Resume Optimization</h3>
              <p className="text-gray-600">Get AI insights to optimize your resume for better results</p>
            </div>
            
            {/* AI Dashboard will be imported and used here */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="h-12 w-12 text-blue-600 mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-12 w-12" />
              </div>
              <h4 className="text-lg font-semibold text-blue-800 mb-2">AI Optimization Features</h4>
              <p className="text-blue-700 mb-4">
                • ATS Compatibility Tracking<br/>
                • Market Insights & Trends<br/>
                • Content Enhancement Suggestions<br/>
                • Industry-Specific Keywords
              </p>
              <p className="text-sm text-blue-600">
                AI features will be available in the next update
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
    } catch (error) {
      console.error('Error rendering step content:', error);
      return (
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">An error occurred while loading this step.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700"
          >
            Reload Page
          </Button>
        </div>
      );
    }
  };

  // Progress calculation
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <Card className="mb-4 sm:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Resume Builder</h2>
            <div className="flex items-center space-x-2">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={handleManualSave}
                loading={isSaving}
                variant="outline"
                size="sm"
                icon={<Save className="h-4 w-4" />}
              >
                Save
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center space-y-2 ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isActive
                        ? 'border-blue-600 bg-blue-50'
                        : isCompleted
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium ${isActive ? 'text-blue-600' : ''}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Form Content */}
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
      <Card className="mt-6">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {currentStep > 0 && (
                <Button
                  onClick={prevStep}
                  variant="outline"
                  icon={<ChevronLeft className="h-5 w-5" />}
                >
                  Previous Step
                </Button>
              )}
              
              {currentStep < totalSteps - 1 && (
                <Button
                  onClick={onPreview}
                  variant="outline"
                  icon={<Eye className="h-5 w-5" />}
                >
                  Preview
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please fix the errors above</span>
                </div>
              )}
              
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700"
                iconRight={currentStep === totalSteps - 1 ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              >
                {currentStep === totalSteps - 1 ? 'Complete & Select Template' : 'Next Step'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Resume Title Input */}
      <Card className="mt-6">
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Title
            </label>
            <input
              type="text"
              value={formData.resumeTitle}
              onChange={(e) => updateFormData({ resumeTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a title for your resume"
            />
            <p className="text-sm text-gray-500 mt-1">
              This will help you identify your resume later
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
