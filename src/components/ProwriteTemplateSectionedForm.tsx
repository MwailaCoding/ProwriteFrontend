import React, { useState, useEffect } from 'react';
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
  Share2,
  Settings,
  MessageCircle,
  Wand2,
  Plus,
  Trash2,
  X,
  Zap,
  Lightbulb,
  TrendingUp,
  Users,
  Upload
} from 'lucide-react';
import { Button } from './common/Button';
import { Card } from './common/Card';
import ProwriteTemplateFieldEnhancer from './prowrite-template/ProwriteTemplateFieldEnhancer';
import ProwriteTemplateChatbot from './prowrite-template/ProwriteTemplateChatbot';
import ProwriteTemplateSmartPromptGenerator from './prowrite-template/ProwriteTemplateSmartPromptGenerator';
import ProwriteTemplateATSAnalysis from './prowrite-template/ProwriteTemplateATSAnalysis';
import ProwriteTemplateJobDescriptionAnalyzer from './prowrite-template/ProwriteTemplateJobDescriptionAnalyzer';
import ProwriteTemplateCollaborationPanel from './prowrite-template/ProwriteTemplateCollaborationPanel';
import ProwriteTemplateExportIntegrationPanel from './prowrite-template/ProwriteTemplateExportIntegrationPanel';
import '../styles/prowriteTemplateTemplate.css';

interface FormData {
  [key: string]: any;
}

interface ArrayItem {
  [key: string]: any;
}

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

const ProwriteTemplateSectionedForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProfession, setSelectedProfession] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('prowrite-template');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [atsScore, setAtsScore] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [showATSAnalysis, setShowATSAnalysis] = useState(false);
  const [showJobDescriptionAnalyzer, setShowJobDescriptionAnalyzer] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [showExportIntegrationPanel, setShowExportIntegrationPanel] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Fetch the ProwriteTemplate template schema from API
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setSchemaLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/prowrite-template/schema`);
        const result = await response.json();
        
        if (result.success) {
          setSchema(result.schema);
        } else {
          setSchemaError(result.error || 'Failed to load schema');
        }
      } catch (error) {
        setSchemaError('Failed to connect to server');
        console.error('Error fetching schema:', error);
      } finally {
        setSchemaLoading(false);
      }
    };

    fetchSchema();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('prowrite-templateFormData');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('prowrite-templateFormData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleArrayItemChange = (fieldName: string, index: number, itemData: ArrayItem) => {
    setFormData(prev => {
      const currentArray = prev[fieldName] || [];
      const updatedArray = [...currentArray];
      updatedArray[index] = { ...updatedArray[index], ...itemData };
      return {
        ...prev,
        [fieldName]: updatedArray
      };
    });
  };

  const addArrayItem = (fieldName: string) => {
    setFormData(prev => {
      const currentArray = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: [...currentArray, {}]
      };
    });
  };

  const removeArrayItem = (fieldName: string, index: number) => {
    setFormData(prev => {
      const currentArray = prev[fieldName] || [];
      const updatedArray = currentArray.filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        [fieldName]: updatedArray
      };
    });
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Profession & Template
        // Profession is now optional, only template is required
        if (!selectedTemplate) newErrors.template = 'Please select a template';
        break;
      case 2: // Personal Information
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        break;
      case 3: // Professional Experience
        if (!formData.professionalExperience || formData.professionalExperience.length === 0) {
          newErrors.professionalExperience = 'At least one work experience is required';
        }
        break;
      case 4: // Education
        if (!formData.education || formData.education.length === 0) {
          newErrors.education = 'At least one education entry is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateProgress = () => {
    if (!schema) return 0;
    
    const totalFields = schema.fields.length;
    const filledFields = schema.fields.filter((field: any) => {
      const value = formData[field.name];
      if (field.type === 'array') {
        return value && value.length > 0;
      }
      return value && value.toString().trim() !== '';
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = calculateProgress();

  // AI Functions
  const handleAIBuildResume = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI building resume based on profession
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample data based on profession (or default if no profession selected)
      const profession = selectedProfession || 'default';
      const sampleData = generateSampleDataForProfession(profession);
      setFormData(prev => ({ ...prev, ...sampleData }));
      
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
      
      // Generate content based on section and profession (or default if no profession selected)
      const profession = selectedProfession || 'default';
      const content = generateAIContent(section, profession);
      
      switch (section) {
        case 'summary':
          handleInputChange('summary', content);
          break;
        case 'skills':
          const skills = generateSkillsForProfession(profession);
          handleInputChange('skills', skills);
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
    } catch (error) {
      console.error('Error analyzing job description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions for AI content generation
  const generateSampleDataForProfession = (profession: string) => {
    const samples: Record<string, Partial<FormData>> = {
      'software-developer': {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        summary: 'Results-driven software developer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies.',
        professionalExperience: [{
          position: 'Senior Software Developer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          startDate: '2020-01-01',
          endDate: '',
          current: true,
          responsibilities: 'Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%.'
        }],
        education: [{
          degree: 'Bachelor of Science in Computer Science',
          institution: 'Stanford University',
          location: 'Stanford, CA',
          graduationDate: '2018-05-01',
          gpa: '3.8'
        }],
        skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Git']
      },
      'marketing-manager': {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 987-6543',
        summary: 'Strategic marketing professional with 6+ years of experience in digital marketing, brand management, and campaign optimization.',
        professionalExperience: [{
          position: 'Marketing Manager',
          company: 'Brand Agency',
          location: 'New York, NY',
          startDate: '2019-03-01',
          endDate: '',
          current: true,
          responsibilities: 'Developed and executed comprehensive marketing strategies resulting in 150% increase in brand awareness and 80% growth in lead generation.'
        }],
        education: [{
          degree: 'Master of Business Administration',
          institution: 'Harvard Business School',
          location: 'Boston, MA',
          graduationDate: '2017-05-01',
          gpa: '3.9'
        }],
        skills: ['Digital Marketing', 'Analytics', 'Team Leadership', 'Content Strategy', 'SEO/SEM']
      },
      'default': {
        name: 'Alex Johnson',
        email: 'alex.johnson@email.com',
        phone: '+1 (555) 123-4567',
        summary: 'Experienced professional with a strong background in delivering high-quality results and driving organizational success. Committed to excellence and continuous improvement.',
        professionalExperience: [{
          position: 'Senior Professional',
          company: 'Leading Company',
          location: 'Major City, State',
          startDate: '2020-01-01',
          endDate: '',
          current: true,
          responsibilities: 'Led key initiatives resulting in significant improvements. Managed cross-functional teams and delivered projects on time and within budget.'
        }],
        education: [{
          degree: 'Bachelor of Science',
          institution: 'University Name',
          location: 'City, State',
          graduationDate: '2018-05-01',
          gpa: '3.7'
        }],
        skills: ['Project Management', 'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Leadership']
      }
    };
    
    return samples[profession] || samples['default'];
  };

  const generateAIContent = (section: string, profession: string) => {
    const contentMap: Record<string, Record<string, string>> = {
      'summary': {
        'software-developer': 'Innovative software developer with expertise in modern web technologies and cloud architecture. Passionate about creating efficient, scalable solutions that drive business growth.',
        'marketing-manager': 'Results-oriented marketing professional with a proven track record of developing and executing successful campaigns that drive brand growth and customer engagement.',
        'data-scientist': 'Data-driven professional with expertise in statistical analysis, machine learning, and data visualization. Passionate about transforming complex data into actionable insights.',
        'product-manager': 'Strategic product professional with experience in product development, market analysis, and cross-functional team leadership. Focused on delivering user-centric solutions.',
        'designer': 'Creative design professional with expertise in user experience, visual design, and design thinking. Passionate about creating intuitive and engaging user interfaces.',
        'sales-manager': 'Results-driven sales professional with a proven track record of exceeding targets and building strong client relationships. Expert in sales strategy and team leadership.',
        'hr-specialist': 'People-focused HR professional with expertise in talent acquisition, employee relations, and organizational development. Committed to creating positive workplace cultures.',
        'financial-analyst': 'Analytical finance professional with expertise in financial modeling, risk assessment, and investment analysis. Skilled at providing strategic financial insights.',
        'default': 'Experienced professional with a strong background in delivering high-quality results and driving organizational success. Committed to excellence and continuous improvement.'
      }
    };
    
    return contentMap[section]?.[profession] || contentMap[section]?.['default'] || '';
  };

  const generateSkillsForProfession = (profession: string) => {
    const skillMap: Record<string, string[]> = {
      'software-developer': ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Git', 'Python', 'SQL'],
      'marketing-manager': ['Digital Marketing', 'Google Analytics', 'Social Media Management', 'Content Strategy', 'SEO/SEM', 'Team Leadership'],
      'data-scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization', 'Pandas', 'TensorFlow'],
      'product-manager': ['Product Strategy', 'Agile Methodologies', 'User Research', 'Data Analysis', 'Project Management', 'Stakeholder Management'],
      'designer': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
      'sales-manager': ['Sales Strategy', 'CRM Management', 'Lead Generation', 'Negotiation', 'Team Leadership', 'Client Relations'],
      'hr-specialist': ['Talent Acquisition', 'Employee Relations', 'HRIS', 'Performance Management', 'Training & Development', 'Compliance'],
      'financial-analyst': ['Financial Modeling', 'Excel', 'SQL', 'Risk Analysis', 'Investment Analysis', 'Financial Reporting'],
      'default': ['Project Management', 'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Leadership']
    };
    
    return skillMap[profession] || skillMap['default'];
  };

  const handleChatbotAutoFill = (fieldData: Record<string, any>) => {
    const newFormData = { ...formData };
    
    // Auto-fill education data
    if (fieldData.education) {
      if (!newFormData.education) newFormData.education = [];
      if (newFormData.education.length === 0) newFormData.education.push({});
      
      const educationEntry = newFormData.education[0];
      if (fieldData.education.degree) educationEntry.degree = fieldData.education.degree;
      if (fieldData.education.institution) educationEntry.institution = fieldData.education.institution;
      if (fieldData.education.activities) educationEntry.activities = fieldData.education.activities;
    }
    
    // Auto-fill experience data
    if (fieldData.experience) {
      if (!newFormData.professionalExperience) newFormData.professionalExperience = [];
      if (newFormData.professionalExperience.length === 0) newFormData.professionalExperience.push({});
      
      const experienceEntry = newFormData.professionalExperience[0];
      if (fieldData.experience.position) experienceEntry.position = fieldData.experience.position;
      if (fieldData.experience.company) experienceEntry.company = fieldData.experience.company;
      if (fieldData.experience.responsibilities) experienceEntry.responsibilities = fieldData.experience.responsibilities;
    }
    
    setFormData(newFormData);
  };

  const generateResumeContent = (): string => {
    let content = '';
    
    if (formData.name) content += `Name: ${formData.name}\n`;
    if (formData.email) content += `Email: ${formData.email}\n`;
    if (formData.phone) content += `Phone: ${formData.phone}\n`;
    if (formData.address) content += `Address: ${formData.address}\n\n`;
    
    if (formData.summary) content += `Summary: ${formData.summary}\n\n`;
    
    if (formData.professionalExperience && formData.professionalExperience.length > 0) {
      content += 'Experience:\n';
      formData.professionalExperience.forEach((exp: any) => {
        if (exp.position) content += `${exp.position}`;
        if (exp.company) content += ` at ${exp.company}`;
        if (exp.location) content += ` (${exp.location})`;
        content += '\n';
        if (exp.responsibilities) content += `${exp.responsibilities}\n\n`;
      });
    }
    
    if (formData.education && formData.education.length > 0) {
      content += 'Education:\n';
      formData.education.forEach((edu: any) => {
        if (edu.degree) content += `${edu.degree}`;
        if (edu.institution) content += ` from ${edu.institution}`;
        if (edu.graduationDate) content += ` (${edu.graduationDate})`;
        content += '\n';
      });
    }
    
    return content;
  };

  // Render field based on type
  const renderField = (field: any) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.name} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.name === 'summary' && (
                <Button
                  onClick={() => {
                    setCurrentFieldForGeneration('summary');
                    setShowPromptGenerator(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  icon={<Wand2 className="h-4 w-4" />}
                >
                  AI Enhance
                </Button>
              )}
            </div>
            <div className="relative">
              <input
                type={field.type}
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder={field.placeholder}
                required={field.required}
              />
              {field.name === 'summary' && value && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <Button
                onClick={() => {
                  setCurrentFieldForGeneration(field.name);
                  setShowPromptGenerator(true);
                }}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                icon={<Wand2 className="h-4 w-4" />}
              >
                AI Enhance
              </Button>
            </div>
            <div className="relative">
              <textarea
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                rows={field.rows || 4}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none ${
                  error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder={field.placeholder}
                required={field.required}
              />
              {value && (
                <div className="absolute right-3 top-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'array':
        const arrayValue = value || [];
        return (
          <div key={field.name} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <Button
                onClick={() => addArrayItem(field.name)}
                variant="outline"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
              >
                Add {field.itemLabel || 'Item'}
              </Button>
            </div>
            
            <div className="space-y-4">
              {arrayValue.map((item: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      {field.itemLabel || 'Item'} #{index + 1}
                    </h4>
                    <Button
                      onClick={() => removeArrayItem(field.name, index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {field.fields?.map((subField: any) => (
                      <div key={subField.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {subField.label}
                        </label>
                        {subField.type === 'textarea' ? (
                          <textarea
                            value={item[subField.name] || ''}
                            onChange={(e) => handleArrayItemChange(field.name, index, { [subField.name]: e.target.value })}
                            rows={subField.rows || 3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={subField.placeholder}
                          />
                        ) : (
                          <input
                            type={subField.type || 'text'}
                            value={item[subField.name] || ''}
                            onChange={(e) => handleArrayItemChange(field.name, index, { [subField.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={subField.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
            
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  // Render step content
  const renderStepContent = () => {
    if (schemaLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form schema...</p>
          </div>
        </div>
      );
    }

    if (schemaError) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{schemaError}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      );
    }

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
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Profession (Optional)</h4>
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Profession (Optional)</option>
                  <option value="software-developer">Software Developer</option>
                  <option value="marketing-manager">Marketing Manager</option>
                  <option value="data-scientist">Data Scientist</option>
                  <option value="product-manager">Product Manager</option>
                  <option value="designer">Designer</option>
                  <option value="sales-manager">Sales Manager</option>
                  <option value="hr-specialist">HR Specialist</option>
                  <option value="financial-analyst">Financial Analyst</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Select your profession for better AI suggestions and tailored content generation.
                </p>
              </Card>

              {/* Template Selection */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h4>
                <div className="space-y-3">
                  {['ProwriteTemplate Professional', 'Modern Clean', 'Creative Design', 'Classic Style'].map((template) => (
                    <div
                      key={template}
                      onClick={() => setSelectedTemplate(template.toLowerCase().replace(' ', '-'))}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.toLowerCase().replace(' ', '-')
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{template}</span>
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
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Content Generation</h3>
              <p className="text-gray-600 text-lg">Let AI help you build a professional resume tailored to your profession</p>
            </div>

            {/* Main AI Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Complete AI Resume</h4>
                  <p className="text-gray-600 mb-6">AI will generate a complete resume based on your profession and best practices</p>
                  <Button
                    onClick={handleAIBuildResume}
                    loading={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    icon={<Sparkles className="h-5 w-5" />}
                  >
                    {isGenerating ? 'Building Resume...' : 'Let AI Build Your Resume'}
                  </Button>
                </div>
              </Card>

              <Card className="p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-teal-100 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Smart Content Generator</h4>
                  <p className="text-gray-600 mb-6">Generate specific sections with AI assistance and professional optimization</p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleAIGenerateContent('summary')}
                      loading={isGenerating}
                      variant="outline"
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                      icon={<Lightbulb className="h-4 w-4" />}
                    >
                      Generate Professional Summary
                    </Button>
                    <Button
                      onClick={() => handleAIGenerateContent('skills')}
                      loading={isGenerating}
                      variant="outline"
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                      icon={<Zap className="h-4 w-4" />}
                    >
                      Generate Skills List
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Job Targeting</h4>
                  <p className="text-gray-600 mb-6">Analyze job descriptions to optimize your resume for specific positions</p>
                  <Button
                    onClick={() => setShowJobDescriptionAnalyzer(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    icon={<Target className="h-5 w-5" />}
                  >
                    Analyze Job Description
                  </Button>
                </div>
              </Card>
            </div>

            {/* Advanced AI Tools */}
            <Card className="p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-100">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Advanced AI Tools</h4>
                <p className="text-gray-600">Access professional-grade AI tools for resume optimization</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setShowATSAnalysis(true)}
                  variant="outline"
                  className="h-20 flex-col space-y-2 bg-white hover:bg-red-50 border-red-200 text-red-700 hover:border-red-300 transition-all duration-300"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm font-medium">ATS Analysis</span>
                </Button>
                
                <Button
                  onClick={() => setShowChatbot(true)}
                  variant="outline"
                  className="h-20 flex-col space-y-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-300 transition-all duration-300"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-sm font-medium">AI Assistant</span>
                </Button>
                
                <Button
                  onClick={() => setShowCollaborationPanel(true)}
                  variant="outline"
                  className="h-20 flex-col space-y-2 bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-300 transition-all duration-300"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-medium">Collaboration</span>
                </Button>
                
                <Button
                  onClick={() => setShowExportIntegrationPanel(true)}
                  variant="outline"
                  className="h-20 flex-col space-y-2 bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-300 transition-all duration-300"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">Export Tools</span>
                </Button>
              </div>
            </Card>

            {/* Job Description Analysis */}
            <Card className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Job Description Analysis</h4>
                <p className="text-gray-600">Paste a job description to get tailored suggestions and optimization tips</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here to get AI-powered analysis and suggestions..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 resize-none"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    {jobDescription.length} characters
                  </div>
                  <Button
                    onClick={handleAnalyzeJobDescription}
                    loading={isGenerating}
                    disabled={!jobDescription.trim()}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    icon={<TrendingUp className="h-5 w-5" />}
                  >
                    {isGenerating ? 'Analyzing...' : 'Analyze & Optimize'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      case 2: // Personal Information
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-600">Your contact details and professional summary</p>
            </div>
            
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schema?.fields?.filter((field: any) => 
                  ['name', 'email', 'phone', 'address', 'summary'].includes(field.name)
                ).map(renderField)}
                
                {/* Fallback manual fields if schema not available */}
                {(!schema || !schema.fields?.find((field: any) => ['name', 'email', 'phone', 'address', 'summary'].includes(field.name))) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="City, State, Country"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Professional Summary *
                        </label>
                        <Button
                          onClick={() => {
                            setCurrentFieldForGeneration('summary');
                            setShowPromptGenerator(true);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          icon={<Wand2 className="h-4 w-4" />}
                        >
                          AI Enhance
                        </Button>
                      </div>
                      <textarea
                        value={formData.summary || ''}
                        onChange={(e) => handleInputChange('summary', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                        placeholder="Write a compelling professional summary that highlights your key strengths and career objectives..."
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        );

      case 3: // Professional Experience
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Experience</h3>
              <p className="text-gray-600">Your work history and achievements</p>
            </div>
            
            <Card className="p-6">
              {schema?.fields?.filter((field: any) => field.name === 'professionalExperience').map(renderField)}
              
              {/* Fallback if no schema fields found */}
              {(!schema || !schema.fields?.find((field: any) => field.name === 'professionalExperience')) && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Add Your Work Experience</h4>
                    <p className="text-gray-600 mb-6">Start building your professional experience section</p>
                    <Button
                      onClick={() => addArrayItem('professionalExperience')}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      icon={<Plus className="h-5 w-5" />}
                    >
                      Add Work Experience
                    </Button>
                  </div>
                  
                  {/* Manual form fields for professional experience */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={formData.professionalExperience?.[0]?.position || ''}
                          onChange={(e) => {
                            if (!formData.professionalExperience) {
                              handleInputChange('professionalExperience', [{}]);
                            }
                            handleArrayItemChange('professionalExperience', 0, { position: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g., Senior Software Developer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company *
                        </label>
                        <input
                          type="text"
                          value={formData.professionalExperience?.[0]?.company || ''}
                          onChange={(e) => {
                            if (!formData.professionalExperience) {
                              handleInputChange('professionalExperience', [{}]);
                            }
                            handleArrayItemChange('professionalExperience', 0, { company: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g., Tech Corp"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={formData.professionalExperience?.[0]?.location || ''}
                          onChange={(e) => {
                            if (!formData.professionalExperience) {
                              handleInputChange('professionalExperience', [{}]);
                            }
                            handleArrayItemChange('professionalExperience', 0, { location: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g., San Francisco, CA"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employment Type
                        </label>
                        <select
                          value={formData.professionalExperience?.[0]?.employmentType || ''}
                          onChange={(e) => {
                            if (!formData.professionalExperience) {
                              handleInputChange('professionalExperience', [{}]);
                            }
                            handleArrayItemChange('professionalExperience', 0, { employmentType: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        >
                          <option value="">Select Type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.professionalExperience?.[0]?.startDate || ''}
                          onChange={(e) => {
                            if (!formData.professionalExperience) {
                              handleInputChange('professionalExperience', [{}]);
                            }
                            handleArrayItemChange('professionalExperience', 0, { startDate: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="date"
                            value={formData.professionalExperience?.[0]?.endDate || ''}
                            onChange={(e) => {
                              if (!formData.professionalExperience) {
                                handleInputChange('professionalExperience', [{}]);
                              }
                              handleArrayItemChange('professionalExperience', 0, { endDate: e.target.value });
                            }}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          />
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.professionalExperience?.[0]?.current || false}
                              onChange={(e) => {
                                if (!formData.professionalExperience) {
                                  handleInputChange('professionalExperience', [{}]);
                                }
                                handleArrayItemChange('professionalExperience', 0, { current: e.target.checked });
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Current</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Job Description & Achievements
                        </label>
                        <Button
                          onClick={() => {
                            setCurrentFieldForGeneration('professionalExperience');
                            setShowPromptGenerator(true);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          icon={<Wand2 className="h-4 w-4" />}
                        >
                          AI Enhance
                        </Button>
                      </div>
                      <textarea
                        value={formData.professionalExperience?.[0]?.responsibilities || ''}
                        onChange={(e) => {
                          if (!formData.professionalExperience) {
                            handleInputChange('professionalExperience', [{}]);
                          }
                          handleArrayItemChange('professionalExperience', 0, { responsibilities: e.target.value });
                        }}
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                        placeholder="Describe your key responsibilities, achievements, and impact in this role. Use action verbs and quantify results when possible."
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        );

      case 4: // Education
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Education & Qualifications</h3>
              <p className="text-gray-600">Academic background and certifications</p>
            </div>
            
            <Card className="p-6">
              {schema?.fields?.filter((field: any) => field.name === 'education').map(renderField)}
              
              {/* Fallback if no schema fields found */}
              {(!schema || !schema.fields?.find((field: any) => field.name === 'education')) && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Add Your Education</h4>
                    <p className="text-gray-600 mb-6">Include your academic background and qualifications</p>
                    <Button
                      onClick={() => addArrayItem('education')}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      icon={<Plus className="h-5 w-5" />}
                    >
                      Add Education
                    </Button>
                  </div>
                  
                  {/* Manual form fields for education */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Degree/Certificate *
                        </label>
                        <input
                          type="text"
                          value={formData.education?.[0]?.degree || ''}
                          onChange={(e) => {
                            if (!formData.education) {
                              handleInputChange('education', [{}]);
                            }
                            handleArrayItemChange('education', 0, { degree: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g., Bachelor of Science in Computer Science"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Institution *
                        </label>
                        <input
                          type="text"
                          value={formData.education?.[0]?.institution || ''}
                          onChange={(e) => {
                            if (!formData.education) {
                              handleInputChange('education', [{}]);
                            }
                            handleArrayItemChange('education', 0, { institution: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g., Stanford University"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={formData.education?.[0]?.location || ''}
                          onChange={(e) => {
                            if (!formData.education) {
                              handleInputChange('education', [{}]);
                            }
                            handleArrayItemChange('education', 0, { location: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g., Stanford, CA"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GPA (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.education?.[0]?.gpa || ''}
                          onChange={(e) => {
                            if (!formData.education) {
                              handleInputChange('education', [{}]);
                            }
                            handleArrayItemChange('education', 0, { gpa: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.education?.[0]?.startDate || ''}
                          onChange={(e) => {
                            if (!formData.education) {
                              handleInputChange('education', [{}]);
                            }
                            handleArrayItemChange('education', 0, { startDate: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Graduation Date
                        </label>
                        <input
                          type="date"
                          value={formData.education?.[0]?.graduationDate || ''}
                          onChange={(e) => {
                            if (!formData.education) {
                              handleInputChange('education', [{}]);
                            }
                            handleArrayItemChange('education', 0, { graduationDate: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Academic Achievements
                        </label>
                        <Button
                          onClick={() => {
                            setCurrentFieldForGeneration('education');
                            setShowPromptGenerator(true);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          icon={<Wand2 className="h-4 w-4" />}
                        >
                          AI Enhance
                        </Button>
                      </div>
                      <textarea
                        value={formData.education?.[0]?.achievements || ''}
                        onChange={(e) => {
                          if (!formData.education) {
                            handleInputChange('education', [{}]);
                          }
                          handleArrayItemChange('education', 0, { achievements: e.target.value });
                        }}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                        placeholder="Describe your academic achievements, relevant coursework, honors, or special recognition..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        );

      case 5: // Skills & Additional
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Skills & Additional Information</h3>
              <p className="text-gray-600">Technical skills, languages, and other relevant details</p>
            </div>
            
            <Card className="p-6">
              {schema?.fields?.filter((field: any) => 
                ['skills', 'languages', 'certifications', 'projects', 'additionalInfo'].includes(field.name)
              ).map(renderField)}
              
              {/* Fallback manual fields if schema not available */}
              {(!schema || !schema.fields?.find((field: any) => ['skills', 'languages', 'certifications', 'projects', 'additionalInfo'].includes(field.name))) && (
                <div className="space-y-8">
                  {/* Skills Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                        Technical Skills
                      </h4>
                      <Button
                        onClick={() => addArrayItem('skills')}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        icon={<Plus className="h-4 w-4" />}
                      >
                        Add Skill
                      </Button>
                    </div>
                    
                    {formData.skills?.map((skill: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <input
                          type="text"
                          value={skill.name || ''}
                          onChange={(e) => handleArrayItemChange('skills', index, { name: e.target.value })}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g., JavaScript, Python, React"
                        />
                        <select
                          value={skill.level || ''}
                          onChange={(e) => handleArrayItemChange('skills', index, { level: e.target.value })}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        >
                          <option value="">Level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                        <Button
                          onClick={() => removeArrayItem('skills', index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          icon={<Trash2 className="h-4 w-4" />}
                        />
                      </div>
                    ))}
                    
                    {(!formData.skills || formData.skills.length === 0) && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No skills added yet</p>
                        <Button
                          onClick={() => addArrayItem('skills')}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                          icon={<Plus className="h-5 w-5" />}
                        >
                          Add Your First Skill
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Languages Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Globe className="h-5 w-5 text-green-500 mr-2" />
                        Languages
                      </h4>
                      <Button
                        onClick={() => addArrayItem('languages')}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        icon={<Plus className="h-4 w-4" />}
                      >
                        Add Language
                      </Button>
                    </div>
                    
                    {formData.languages?.map((language: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <input
                          type="text"
                          value={language.name || ''}
                          onChange={(e) => handleArrayItemChange('languages', index, { name: e.target.value })}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                          placeholder="e.g., English, Spanish, French"
                        />
                        <select
                          value={language.proficiency || ''}
                          onChange={(e) => handleArrayItemChange('languages', index, { proficiency: e.target.value })}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        >
                          <option value="">Proficiency</option>
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Basic">Basic</option>
                        </select>
                        <Button
                          onClick={() => removeArrayItem('languages', index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          icon={<Trash2 className="h-4 w-4" />}
                        />
                      </div>
                    ))}
                    
                    {(!formData.languages || formData.languages.length === 0) && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No languages added yet</p>
                        <Button
                          onClick={() => addArrayItem('languages')}
                          className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
                          icon={<Plus className="h-5 w-5" />}
                        >
                          Add Your First Language
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Certifications Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Award className="h-5 w-5 text-purple-500 mr-2" />
                        Certifications
                      </h4>
                      <Button
                        onClick={() => addArrayItem('certifications')}
                        variant="outline"
                        size="sm"
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        icon={<Plus className="h-4 w-4" />}
                      >
                        Add Certification
                      </Button>
                    </div>
                    
                    {formData.certifications?.map((cert: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={cert.name || ''}
                            onChange={(e) => handleArrayItemChange('certifications', index, { name: e.target.value })}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                            placeholder="Certification Name"
                          />
                          <input
                            type="text"
                            value={cert.issuer || ''}
                            onChange={(e) => handleArrayItemChange('certifications', index, { issuer: e.target.value })}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                            placeholder="Issuing Organization"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={cert.date || ''}
                            onChange={(e) => handleArrayItemChange('certifications', index, { date: e.target.value })}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                          />
                          <input
                            type="text"
                            value={cert.credentialId || ''}
                            onChange={(e) => handleArrayItemChange('certifications', index, { credentialId: e.target.value })}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                            placeholder="Credential ID (Optional)"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <input
                            type="url"
                            value={cert.url || ''}
                            onChange={(e) => handleArrayItemChange('certifications', index, { url: e.target.value })}
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 mr-3"
                            placeholder="Verification URL (Optional)"
                          />
                          <Button
                            onClick={() => removeArrayItem('certifications', index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            icon={<Trash2 className="h-4 w-4" />}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {(!formData.certifications || formData.certifications.length === 0) && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No certifications added yet</p>
                        <Button
                          onClick={() => addArrayItem('certifications')}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          icon={<Plus className="h-5 w-5" />}
                        >
                          Add Your First Certification
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Projects Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FolderOpen className="h-5 w-5 text-indigo-500 mr-2" />
                        Projects
                      </h4>
                      <Button
                        onClick={() => addArrayItem('projects')}
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        icon={<Plus className="h-4 w-4" />}
                      >
                        Add Project
                      </Button>
                    </div>
                    
                    {formData.projects?.map((project: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={project.name || ''}
                            onChange={(e) => handleArrayItemChange('projects', index, { name: e.target.value })}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                            placeholder="Project Name"
                          />
                          <input
                            type="url"
                            value={project.url || ''}
                            onChange={(e) => handleArrayItemChange('projects', index, { url: e.target.value })}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                            placeholder="Project URL (Optional)"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={project.technologies || ''}
                            onChange={(e) => handleArrayItemChange('projects', index, { technologies: e.target.value })}
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 mr-3"
                            placeholder="Technologies Used (e.g., React, Node.js, MongoDB)"
                          />
                          <Button
                            onClick={() => removeArrayItem('projects', index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            icon={<Trash2 className="h-4 w-4" />}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <textarea
                            value={project.description || ''}
                            onChange={(e) => handleArrayItemChange('projects', index, { description: e.target.value })}
                            rows={3}
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none"
                            placeholder="Project description and your role..."
                          />
                          <Button
                            onClick={() => {
                              setCurrentFieldForGeneration('projects');
                              setShowPromptGenerator(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 ml-2"
                            icon={<Wand2 className="h-4 w-4" />}
                          >
                            AI
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {(!formData.projects || formData.projects.length === 0) && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No projects added yet</p>
                        <Button
                          onClick={() => addArrayItem('projects')}
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                          icon={<Plus className="h-5 w-5" />}
                        >
                          Add Your First Project
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-2" />
                      Additional Information
                    </h4>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Details
                      </label>
                      <Button
                        onClick={() => {
                          setCurrentFieldForGeneration('additionalInfo');
                          setShowPromptGenerator(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        icon={<Wand2 className="h-4 w-4" />}
                      >
                        AI Enhance
                      </Button>
                    </div>
                    <textarea
                      value={formData.additionalInfo || ''}
                      onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                      placeholder="Any additional information you'd like to include (hobbies, interests, volunteer work, etc.)..."
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        );

      case 6: // AI Analysis & Optimization
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis & Optimization</h3>
              <p className="text-gray-600">Get AI-powered insights and recommendations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">ATS Analysis</h4>
                  <p className="text-gray-600 mb-4 text-sm">Check your resume's ATS compatibility and get optimization suggestions</p>
                  <Button
                    onClick={() => setShowATSAnalysis(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                    icon={<TrendingUp className="h-4 w-4" />}
                  >
                    Analyze Resume
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileSearch className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Job Description Analysis</h4>
                  <p className="text-gray-600 mb-4 text-sm">Optimize your resume for specific job postings</p>
                  <Button
                    onClick={() => setShowJobAnalyzer(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                    icon={<FileSearch className="h-4 w-4" />}
                  >
                    Analyze Job Description
                  </Button>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Suggestions</h4>
                  <p className="text-gray-600 mb-4 text-sm">Get AI-powered content suggestions and improvements</p>
                  <Button
                    onClick={() => setShowPromptGenerator(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    icon={<Lightbulb className="h-4 w-4" />}
                  >
                    Get Suggestions
                  </Button>
                </div>
              </Card>
            </div>

            {/* ATS Score Display */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Current ATS Score</h4>
                <div className="text-2xl font-bold text-green-600">{atsScore}%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${atsScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Applicant Tracking System Compatibility Score</p>
            </Card>

            {/* Advanced AI Tools Grid */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                Advanced AI Tools
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setShowChatbot(true)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-sm">AI Chatbot</span>
                </Button>
                
                <Button
                  onClick={() => setShowCollaboration(true)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-gray-700 hover:bg-green-50 hover:border-green-300"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Collaboration</span>
                </Button>
                
                <Button
                  onClick={() => setShowExport(true)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-gray-700 hover:bg-purple-50 hover:border-purple-300"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Export Tools</span>
                </Button>
                
                <Button
                  onClick={() => setShowPromptGenerator(true)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-gray-700 hover:bg-orange-50 hover:border-orange-300"
                >
                  <Wand2 className="h-6 w-6" />
                  <span className="text-sm">Content Generator</span>
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

            {/* Resume Summary with Modern Cards */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                Resume Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{formData.professionalExperience?.length || 0}</div>
                  <div className="text-sm text-gray-600">Work Experiences</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">{formData.education?.length || 0}</div>
                  <div className="text-sm text-gray-600">Education Entries</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{formData.skills?.length || 0}</div>
                  <div className="text-sm text-gray-600">Skills</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{progress}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            </Card>

            {/* Export and Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Export PDF</h4>
                  <p className="text-gray-600 mb-4 text-sm">Download your resume as a professional PDF</p>
                  <Button
                    onClick={handleExportPDF}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                    icon={<Download className="h-4 w-4" />}
                  >
                    Download PDF
                  </Button>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Save className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Save Resume</h4>
                  <p className="text-gray-600 mb-4 text-sm">Save your resume for future editing</p>
                  <Button
                    onClick={handleSaveDraft}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Resume
                  </Button>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Preview Resume</h4>
                  <p className="text-gray-600 mb-4 text-sm">Preview how your resume will look</p>
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                    icon={<Eye className="h-4 w-4" />}
                  >
                    Preview Resume
                  </Button>
                </div>
              </Card>
            </div>

            {/* Additional Actions */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Share2 className="h-5 w-5 text-gray-500 mr-2" />
                Additional Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setShowExport(true)}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Export Options</span>
                </Button>
                
                <Button
                  onClick={() => setShowCollaboration(true)}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2 text-gray-700 hover:bg-green-50 hover:border-green-300"
                >
                  <Share2 className="h-6 w-6" />
                  <span className="text-sm">Share Resume</span>
                </Button>
                
                <Button
                  onClick={() => setShowATSAnalysis(true)}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">ATS Analysis</span>
                </Button>
                
                <Button
                  onClick={() => setShowJobAnalyzer(true)}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2 text-gray-700 hover:bg-cyan-50 hover:border-cyan-300"
                >
                  <FileSearch className="h-6 w-6" />
                  <span className="text-sm">Job Analysis</span>
                </Button>
              </div>
            </Card>
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
            <h1 className="text-3xl font-bold text-gray-900">ProwriteTemplate Resume Builder</h1>
            <p className="text-gray-600">Create your professional resume with preserved styling</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* AI Enhancement Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowChatbot(true)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
                icon={<MessageCircle className="h-4 w-4" />}
              >
                AI Assistant
              </Button>
              <Button
                onClick={() => setShowATSAnalysis(true)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700 hover:from-red-100 hover:to-pink-100"
                icon={<BarChart3 className="h-4 w-4" />}
              >
                ATS Analysis
              </Button>
              <Button
                onClick={() => setShowJobDescriptionAnalyzer(true)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-yellow-100"
                icon={<Target className="h-4 w-4" />}
              >
                Job Analyzer
              </Button>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <Button
              variant="outline"
              icon={<Eye className="h-5 w-5" />}
            >
              Preview
            </Button>
            <Button
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
              ProwriteTemplate Professional Resume
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

      {/* Modern AI Enhancement Panels */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Resume Assistant</h3>
                    <p className="text-purple-100">Get personalized help building your resume</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowChatbot(false)}
                  variant="ghost"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ProwriteTemplateChatbot
                onClose={() => setShowChatbot(false)}
                onAutoFill={handleChatbotAutoFill}
              />
            </div>
          </motion.div>
        </div>
      )}

      {showPromptGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Content Generator</h3>
                    <p className="text-green-100">Generate professional content for your resume</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowPromptGenerator(false)}
                  variant="ghost"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ProwriteTemplateSmartPromptGenerator
                onClose={() => setShowPromptGenerator(false)}
                fieldName={currentFieldForGeneration}
                onGenerate={(content) => {
                  handleInputChange(currentFieldForGeneration, content);
                  setShowPromptGenerator(false);
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {showATSAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">ATS Analysis</h3>
                    <p className="text-red-100">Optimize your resume for Applicant Tracking Systems</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowATSAnalysis(false)}
                  variant="ghost"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ProwriteTemplateATSAnalysis
                onClose={() => setShowATSAnalysis(false)}
                resumeContent={generateResumeContent()}
              />
            </div>
          </motion.div>
        </div>
      )}

      {showJobDescriptionAnalyzer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-600 to-yellow-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Job Description Analyzer</h3>
                    <p className="text-orange-100">Analyze job postings for better resume targeting</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowJobDescriptionAnalyzer(false)}
                  variant="ghost"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ProwriteTemplateJobDescriptionAnalyzer
                onClose={() => setShowJobDescriptionAnalyzer(false)}
                onAnalyze={(analysis) => {
                  console.log('Job analysis:', analysis);
                  setShowJobDescriptionAnalyzer(false);
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {showCollaborationPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Collaboration & Sharing</h3>
                    <p className="text-indigo-100">Share your resume for feedback and collaboration</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCollaborationPanel(false)}
                  variant="ghost"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ProwriteTemplateCollaborationPanel
                onClose={() => setShowCollaborationPanel(false)}
                resumeId="current"
              />
            </div>
          </motion.div>
        </div>
      )}

      {showExportIntegrationPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Download className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Export & Integration</h3>
                    <p className="text-emerald-100">Export your resume in multiple formats</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowExportIntegrationPanel(false)}
                  variant="ghost"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ProwriteTemplateExportIntegrationPanel
                onClose={() => setShowExportIntegrationPanel(false)}
                resumeData={formData}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProwriteTemplateSectionedForm;
