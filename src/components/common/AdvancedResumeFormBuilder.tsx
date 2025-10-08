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
  Target,
  FileText,
  Sparkles,
  BarChart3,
  Download,
  Share2
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { PersonalDetailsSection } from './FormSections/PersonalDetailsSection';
import { WorkExperienceSection } from './FormSections/WorkExperienceSection';
import { EducationSection } from './FormSections/EducationSection';
import { SkillsAndAdditionalSection } from './FormSections/SkillsAndAdditionalSection';
import { ResumeFormData } from '../../types';

interface AdvancedResumeFormBuilderProps {
  initialData?: ResumeFormData;
  onSave: (data: ResumeFormData) => void;
  onPreview: () => void;
  onNextStep: () => void;
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

const totalSteps = 8;

// Step configurations
const stepConfigs = [
  {
    id: 'profession',
    title: 'Profession & Template',
    description: 'Select your profession and template',
    icon: Target,
    color: 'blue'
  },
  {
    id: 'ai-generation',
    title: 'AI Content Generation',
    description: 'Let AI build your resume or generate content',
    icon: Sparkles,
    color: 'purple'
  },
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Your contact details and professional summary',
    icon: User,
    color: 'green'
  },
  {
    id: 'experience',
    title: 'Professional Experience',
    description: 'Your work history and achievements',
    icon: Briefcase,
    color: 'orange'
  },
  {
    id: 'education',
    title: 'Education & Qualifications',
    description: 'Academic background and certifications',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    id: 'skills',
    title: 'Skills & Additional Info',
    description: 'Skills, languages, projects, and awards',
    icon: Star,
    color: 'pink'
  },
  {
    id: 'ai-analysis',
    title: 'AI Analysis & Optimization',
    description: 'Job analysis and ATS optimization',
    icon: BarChart3,
    color: 'red'
  },
  {
    id: 'review',
    title: 'Review & Export',
    description: 'Final review and PDF generation',
    icon: Download,
    color: 'emerald'
  }
];

export const AdvancedResumeFormBuilder: React.FC<AdvancedResumeFormBuilderProps> = ({
  initialData,
  onSave,
  onPreview,
  onNextStep
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ResumeFormData>(initialData || initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProfession, setSelectedProfession] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [atsScore, setAtsScore] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('resumeFormData');
    if (savedData && !initialData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, [initialData]);

  useEffect(() => {
    localStorage.setItem('resumeFormData', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<ResumeFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const validateCurrentStep = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Profession & Template
        if (!selectedProfession) newErrors.profession = 'Please select your profession';
        if (!selectedTemplate) newErrors.template = 'Please select a template';
        break;
      case 2: // Personal Information
        if (!formData.personalInfo.firstName) newErrors.firstName = 'First name is required';
        if (!formData.personalInfo.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.personalInfo.email) newErrors.email = 'Email is required';
        break;
      case 3: // Professional Experience
        if (formData.workExperience.length === 0) {
          newErrors.workExperience = 'At least one work experience is required';
        }
        break;
      case 4: // Education
        if (formData.education.length === 0) {
          newErrors.education = 'At least one education entry is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, selectedProfession, selectedTemplate]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onNextStep();
      }
    }
  }, [currentStep, validateCurrentStep, onNextStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSave = useCallback(() => {
    if (validateCurrentStep()) {
      onSave(formData);
    }
  }, [formData, validateCurrentStep, onSave]);

  const calculateProgress = useCallback(() => {
    let completedFields = 0;
    let totalFields = 0;

    // Personal Info
    totalFields += 3;
    if (formData.personalInfo.firstName) completedFields++;
    if (formData.personalInfo.lastName) completedFields++;
    if (formData.personalInfo.email) completedFields++;

    // Work Experience
    totalFields += 1;
    if (formData.workExperience.length > 0) completedFields++;

    // Education
    totalFields += 1;
    if (formData.education.length > 0) completedFields++;

    // Skills
    totalFields += 1;
    if (formData.skills.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }, [formData]);

  const progress = calculateProgress();

  // AI Functions
  const handleAIBuildResume = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI building resume based on profession
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample data based on profession
      const sampleData = generateSampleDataForProfession(selectedProfession);
      updateFormData(sampleData);
      
      // Move to next step
      setCurrentStep(2);
    } catch (error) {
      console.error('Error building resume with AI:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIGenerateContent = async (section: string) => {
    setIsGenerating(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate content based on section and profession
      const content = generateAIContent(section, selectedProfession);
      
      switch (section) {
        case 'summary':
          updateFormData({ resumeObjective: content });
          break;
        case 'skills':
          const skills = generateSkillsForProfession(selectedProfession);
          updateFormData({ skills });
          break;
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeJobDescription = async () => {
    if (!jobDescription) return;
    
    setIsGenerating(true);
    try {
      // Simulate job analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate ATS score and suggestions
      const score = Math.floor(Math.random() * 30) + 70; // 70-100
      setAtsScore(score);
      
      // Generate optimization suggestions
      const suggestions = generateOptimizationSuggestions(jobDescription, formData);
      console.log('Optimization suggestions:', suggestions);
    } catch (error) {
      console.error('Error analyzing job description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions for AI content generation
  const generateSampleDataForProfession = (profession: string) => {
    const samples: Record<string, Partial<ResumeFormData>> = {
      'software-developer': {
        resumeObjective: 'Results-driven software developer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams.',
        workExperience: [{
          id: 'exp_1',
          jobTitle: 'Senior Software Developer',
          employer: 'Tech Corp',
          city: 'San Francisco',
          country: 'USA',
          startDate: '2020-01-01',
          endDate: '',
          current: true,
          description: 'Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%.',
          achievements: ['Increased system performance by 40%', 'Led team of 5 developers'],
          skills: ['React', 'Node.js', 'AWS', 'Docker']
        }],
        skills: [
          { id: 'skill_1', name: 'JavaScript', level: 'advanced', category: 'Technical', yearsOfExperience: 5 },
          { id: 'skill_2', name: 'React', level: 'advanced', category: 'Technical', yearsOfExperience: 4 },
          { id: 'skill_3', name: 'Node.js', level: 'intermediate', category: 'Technical', yearsOfExperience: 3 }
        ]
      },
      'marketing-manager': {
        resumeObjective: 'Strategic marketing professional with 6+ years of experience in digital marketing, brand management, and campaign optimization. Expert in data-driven decision making and team leadership.',
        workExperience: [{
          id: 'exp_1',
          jobTitle: 'Marketing Manager',
          employer: 'Brand Agency',
          city: 'New York',
          country: 'USA',
          startDate: '2019-03-01',
          endDate: '',
          current: true,
          description: 'Developed and executed comprehensive marketing strategies resulting in 150% increase in brand awareness and 80% growth in lead generation.',
          achievements: ['Increased ROI by 120%', 'Managed $2M marketing budget'],
          skills: ['Digital Marketing', 'Analytics', 'Team Leadership']
        }],
        skills: [
          { id: 'skill_1', name: 'Digital Marketing', level: 'advanced', category: 'Technical', yearsOfExperience: 6 },
          { id: 'skill_2', name: 'Analytics', level: 'advanced', category: 'Technical', yearsOfExperience: 5 },
          { id: 'skill_3', name: 'Team Leadership', level: 'intermediate', category: 'Soft Skills', yearsOfExperience: 4 }
        ]
      }
    };
    
    return samples[profession] || {};
  };

  const generateAIContent = (section: string, profession: string) => {
    const contentMap: Record<string, Record<string, string>> = {
      'summary': {
        'software-developer': 'Innovative software developer with expertise in modern web technologies and cloud architecture. Passionate about creating efficient, scalable solutions that drive business growth.',
        'marketing-manager': 'Results-oriented marketing professional with a proven track record of developing and executing successful campaigns that drive brand growth and customer engagement.',
        'default': 'Experienced professional with a strong background in delivering high-quality results and driving organizational success.'
      },
      'skills': {
        'software-developer': 'JavaScript, React, Node.js, Python, AWS, Docker, Git, Agile Methodologies',
        'marketing-manager': 'Digital Marketing, Google Analytics, Social Media Management, Content Strategy, SEO/SEM',
        'default': 'Project Management, Communication, Problem Solving, Team Collaboration'
      }
    };
    
    return contentMap[section]?.[profession] || contentMap[section]?.['default'] || '';
  };

  const generateSkillsForProfession = (profession: string) => {
    const skillMap: Record<string, any[]> = {
      'software-developer': [
        { id: 'skill_1', name: 'JavaScript', level: 'advanced', category: 'Technical', yearsOfExperience: 5 },
        { id: 'skill_2', name: 'React', level: 'advanced', category: 'Technical', yearsOfExperience: 4 },
        { id: 'skill_3', name: 'Node.js', level: 'intermediate', category: 'Technical', yearsOfExperience: 3 },
        { id: 'skill_4', name: 'AWS', level: 'intermediate', category: 'Technical', yearsOfExperience: 2 },
        { id: 'skill_5', name: 'Git', level: 'advanced', category: 'Tools', yearsOfExperience: 5 }
      ],
      'marketing-manager': [
        { id: 'skill_1', name: 'Digital Marketing', level: 'advanced', category: 'Technical', yearsOfExperience: 6 },
        { id: 'skill_2', name: 'Google Analytics', level: 'advanced', category: 'Tools', yearsOfExperience: 5 },
        { id: 'skill_3', name: 'Social Media Management', level: 'intermediate', category: 'Technical', yearsOfExperience: 4 },
        { id: 'skill_4', name: 'Content Strategy', level: 'intermediate', category: 'Technical', yearsOfExperience: 3 },
        { id: 'skill_5', name: 'Team Leadership', level: 'intermediate', category: 'Soft Skills', yearsOfExperience: 4 }
      ]
    };
    
    return skillMap[profession] || [];
  };

  const generateOptimizationSuggestions = (jobDescription: string, resumeData: ResumeFormData) => {
    return [
      'Include more relevant keywords from the job description',
      'Quantify your achievements with specific numbers',
      'Highlight skills that match the job requirements',
      'Optimize your professional summary for the role'
    ];
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Profession & Template Selection
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Profession & Template</h3>
              <p className="text-gray-600">Select your profession for better AI suggestions and choose a template</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profession Selection */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Profession</h4>
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.profession ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Profession</option>
                  <option value="software-developer">Software Developer</option>
                  <option value="marketing-manager">Marketing Manager</option>
                  <option value="data-scientist">Data Scientist</option>
                  <option value="product-manager">Product Manager</option>
                  <option value="designer">Designer</option>
                  <option value="sales-manager">Sales Manager</option>
                  <option value="hr-specialist">HR Specialist</option>
                  <option value="financial-analyst">Financial Analyst</option>
                </select>
                {errors.profession && (
                  <p className="text-red-500 text-sm mt-1">{errors.profession}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Select your profession for better AI suggestions, so that we'll fill your resume.
                </p>
              </Card>

              {/* Template Selection */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h4>
                <div className="space-y-3">
                  {['Professional', 'Creative', 'Modern', 'Classic'].map((template) => (
                    <div
                      key={template}
                      onClick={() => setSelectedTemplate(template.toLowerCase())}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.toLowerCase()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{template} Template</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">Style Preserved</span>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.template && (
                  <p className="text-red-500 text-sm mt-1">{errors.template}</p>
                )}
              </Card>
            </div>
          </div>
        );

      case 1: // AI Content Generation
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Content Generation</h3>
              <p className="text-gray-600">Let AI help you build a professional resume tailored to your profession</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Let AI Build Your Resume</h4>
                  <p className="text-gray-600 mb-4">AI will generate a complete resume based on your profession</p>
                  <Button
                    onClick={handleAIBuildResume}
                    loading={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    icon={<Sparkles className="h-5 w-5" />}
                  >
                    {isGenerating ? 'Building Resume...' : 'Let AI Build Your Resume'}
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Generate Content with AI</h4>
                  <p className="text-gray-600 mb-4">Generate specific sections with AI assistance</p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleAIGenerateContent('summary')}
                      loading={isGenerating}
                      variant="outline"
                      className="w-full"
                    >
                      Generate Professional Summary
                    </Button>
                    <Button
                      onClick={() => handleAIGenerateContent('skills')}
                      loading={isGenerating}
                      variant="outline"
                      className="w-full"
                    >
                      Generate Skills
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Analyze Job Description</h4>
                <p className="text-gray-600 mb-4">Paste a job description to get tailored suggestions</p>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                />
                <Button
                  onClick={handleAnalyzeJobDescription}
                  loading={isGenerating}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white"
                  icon={<Target className="h-5 w-5" />}
                >
                  {isGenerating ? 'Analyzing...' : 'Analyze Job Description'}
                </Button>
              </div>
            </Card>
          </div>
        );

      case 2: // Personal Information
        return (
          <PersonalDetailsSection
            personalInfo={formData.personalInfo}
            onUpdate={(updates) => updateFormData({ personalInfo: updates })}
            errors={errors}
          />
        );

      case 3: // Professional Experience
        return (
          <WorkExperienceSection
            workExperience={formData.workExperience}
            onUpdate={(updates) => updateFormData({ workExperience: updates })}
            errors={errors}
          />
        );

      case 4: // Education
        return (
          <EducationSection
            education={formData.education}
            onUpdate={(updates) => updateFormData({ education: updates })}
            errors={errors}
          />
        );

      case 5: // Skills & Additional
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

      case 6: // AI Analysis & Optimization
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis & Optimization</h3>
              <p className="text-gray-600">Get insights and optimize your resume for better results</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">ATS Score</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{atsScore}%</div>
                  <p className="text-gray-600">Applicant Tracking System Compatibility</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${atsScore}%` }}
                    ></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Optimization Suggestions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Include more relevant keywords</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Quantify your achievements</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Optimize professional summary</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Collaboration & Sharing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  icon={<Share2 className="h-5 w-5" />}
                >
                  Share for Feedback
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  icon={<Eye className="h-5 w-5" />}
                >
                  Preview Resume
                </Button>
              </div>
            </Card>
          </div>
        );

      case 7: // Review & Export
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Review & Export</h3>
              <p className="text-gray-600">Review your resume and generate the final PDF</p>
            </div>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Resume Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{formData.workExperience.length}</div>
                  <div className="text-sm text-gray-600">Work Experiences</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{formData.education.length}</div>
                  <div className="text-sm text-gray-600">Education Entries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{formData.skills.length}</div>
                  <div className="text-sm text-gray-600">Skills</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{progress}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h4>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    icon={<Download className="h-5 w-5" />}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    icon={<Share2 className="h-5 w-5" />}
                  >
                    Share Resume
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Final Actions</h4>
                <div className="space-y-3">
                  <Button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white"
                    icon={<Save className="h-5 w-5" />}
                  >
                    Save Resume
                  </Button>
                  <Button
                    onClick={onPreview}
                    variant="outline"
                    className="w-full"
                    icon={<Eye className="h-5 w-5" />}
                  >
                    Preview Resume
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-600">Create your professional resume with preserved styling</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={onPreview}
              variant="outline"
              icon={<Eye className="h-5 w-5" />}
            >
              Preview
            </Button>
            <Button
              onClick={handleSave}
              icon={<Save className="h-5 w-5" />}
            >
              Save Draft
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {stepConfigs.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? `border-${step.color}-500 bg-${step.color}-500 text-white`
                    : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${
                    isActive ? `text-${step.color}-600` : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < stepConfigs.length - 1 && (
                  <div className={`hidden md:block w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {formData.resumeTitle}
            </span>
            <span className="text-sm text-gray-500">
              {progress}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">8 total fields</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Style Preserved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
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
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentStep === 0}
          icon={<ChevronLeft className="h-5 w-5" />}
        >
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          {stepConfigs.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep 
                  ? 'bg-blue-500' 
                  : index < currentStep 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStep === totalSteps - 1 && !validateCurrentStep()}
          icon={<ChevronRight className="h-5 w-5" />}
        >
          {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};












