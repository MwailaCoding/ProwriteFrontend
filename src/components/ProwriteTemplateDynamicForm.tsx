import React, { useState, useEffect } from 'react';
import { pdfTemplateService } from '../services/pdfTemplateService';
import { MpesaPaymentModal } from './payments/MpesaPaymentModal';
import ProwriteTemplateFieldEnhancer from './prowrite-template/ProwriteTemplateFieldEnhancer';
import ProwriteTemplateChatbot from './prowrite-template/ProwriteTemplateChatbot';
import ProwriteTemplateSmartPromptGenerator from './prowrite-template/ProwriteTemplateSmartPromptGenerator';
import ProwriteTemplateATSAnalysis from './prowrite-template/ProwriteTemplateATSAnalysis';
import EnhancedATSAnalysis from './prowrite-template/EnhancedATSAnalysis';
import ResumeImportModal from './prowrite-template/ResumeImportModal';
import ResumeWorkflow from './prowrite-template/ResumeWorkflow';
import ProwriteTemplateJobDescriptionAnalyzer from './prowrite-template/ProwriteTemplateJobDescriptionAnalyzer';
import ProwriteTemplateCollaborationPanel from './prowrite-template/ProwriteTemplateCollaborationPanel';
import ProwriteTemplateExportIntegrationPanel from './prowrite-template/ProwriteTemplateExportIntegrationPanel';
import { 
  MessageCircle, 
  Sparkles, 
  Wand2, 
  BarChart3, 
  Briefcase, 
  Share2, 
  Download,
  User,
  GraduationCap,
  Briefcase as WorkIcon,
  Award,
  Code,
  FileText,
  Settings,
  Save,
  Eye,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Info,
  Lightbulb,
  Target,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Star,
  Clock,
  TrendingUp,
  Upload,
  X
} from 'lucide-react';
import '../styles/prowriteTemplateTemplate.css';

interface FormData {
  [key: string]: any;
}

interface ArrayItem {
  [key: string]: any;
}

const ProwriteTemplateDynamicForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    personal: false,
    summary: false,
    experience: false,
    education: false,
    leadership: false,
    volunteer: false,
    skills: false,
    references: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  
  // Guided form state
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpContent, setHelpContent] = useState<string>('');
  const [fieldHints, setFieldHints] = useState<{[key: string]: string}>({});
  const [completionStatus, setCompletionStatus] = useState<{[key: string]: boolean}>({});
  
  // Virtual Guide state
  const [showVirtualGuide, setShowVirtualGuide] = useState(false);
  const [guideMessage, setGuideMessage] = useState<string>('');
  const [guideIsTyping, setGuideIsTyping] = useState(false);
  const [currentFieldFocus, setCurrentFieldFocus] = useState<string>('');
  const [showFieldHighlight, setShowFieldHighlight] = useState(false);
  const [guidePersonality, setGuidePersonality] = useState<'friendly' | 'professional' | 'encouraging'>('friendly');
  const [guideVoiceEnabled, setGuideVoiceEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Advanced AI Guidance System
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [autoProgressDelay, setAutoProgressDelay] = useState(3000);
  const [isAutoProgressing, setIsAutoProgressing] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [autoValidationEnabled, setAutoValidationEnabled] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  
  // Advanced AI Features
  const [aiContext, setAiContext] = useState({
    userProfile: null,
    industryInsights: null,
    marketTrends: null,
    optimizationScore: 0,
    predictedOutcomes: null,
    personalizedRecommendations: []
  });
  
  const [adaptiveLearning, setAdaptiveLearning] = useState({
    userBehaviorPatterns: {},
    preferredGuidanceStyle: 'friendly',
    learningProgress: 0,
    personalizedTips: [],
    successMetrics: {}
  });
  
  const [smartWorkflows, setSmartWorkflows] = useState({
    currentWorkflow: 'standard',
    workflowProgress: 0,
    nextActions: [],
    contextualHints: [],
    predictiveSuggestions: []
  });
  
  const [advancedAnalytics, setAdvancedAnalytics] = useState({
    resumeStrength: 0,
    atsCompatibility: 0,
    marketCompetitiveness: 0,
    improvementAreas: [],
    optimizationOpportunities: []
  });
  
  // Guided form functions
  const updateCompletionStatus = () => {
    const newStatus: {[key: string]: boolean} = {};
    guidedSteps.forEach(step => {
      if (step.fields) {
        step.fields.forEach(fieldName => {
          if (fieldName === 'workExperience' || fieldName === 'education' || fieldName === 'skills' || fieldName === 'leadership' || fieldName === 'volunteerWork' || fieldName === 'referees') {
            newStatus[fieldName] = formData[fieldName] && formData[fieldName].length > 0;
          } else {
            newStatus[fieldName] = formData[fieldName] && formData[fieldName].toString().trim() !== '';
          }
        });
      }
    });
    setCompletionStatus(newStatus);
  };

  const getStepCompletion = (stepIndex: number) => {
    const step = guidedSteps[stepIndex];
    if (!step.fields || step.fields.length === 0) return true;
    
    return step.fields.every(fieldName => completionStatus[fieldName]);
  };

  const handleStepNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStep < guidedSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Virtual Guide Functions
  const typeMessage = async (message: string) => {
    setGuideIsTyping(true);
    setGuideMessage('');
    
    for (let i = 0; i < message.length; i++) {
      setGuideMessage(message.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    setGuideIsTyping(false);
    
    // Auto-progress after message is complete
    if (isAutoMode && !isAutoProgressing) {
      setTimeout(() => {
        handleAutoProgression();
      }, autoProgressDelay);
    }
  };

  const showGuideMessage = (messageKey: string) => {
    const message = guideMessages[messageKey]?.[guidePersonality] || guideMessages[messageKey]?.friendly;
    if (message) {
      typeMessage(message);
    }
  };

  const handleAutoProgression = () => {
    if (isAutoProgressing) return;
    
    setIsAutoProgressing(true);
    
    // Get current step fields
    const currentStepFields = guidedSteps[currentStep]?.fields || [];
    
    if (currentStepFields.length > 0) {
      // Focus on next field in current step
      if (currentFieldIndex < currentStepFields.length) {
        const fieldName = currentStepFields[currentFieldIndex];
        highlightField(fieldName);
        setCurrentFieldIndex(currentFieldIndex + 1);
        
        // If all fields in current step are completed, move to next step
        if (currentFieldIndex >= currentStepFields.length - 1) {
          setTimeout(() => {
            if (getStepCompletion(currentStep)) {
              moveToNextStep();
            }
          }, 2000);
        }
      }
    } else {
      // No fields in current step, move to next step
      moveToNextStep();
    }
    
    setTimeout(() => {
      setIsAutoProgressing(false);
    }, 1000);
  };

  const moveToNextStep = () => {
    if (currentStep < guidedSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentFieldIndex(0);
      
      // Show message for next step
      setTimeout(() => {
        const stepMessages = {
          0: 'welcome',
          1: 'personalInfo',
          2: 'experience',
          3: 'education',
          4: 'skills',
          5: 'completion'
        };
        
        const messageKey = stepMessages[currentStep + 1];
        if (messageKey) {
          showGuideMessage(messageKey);
        }
      }, 500);
    } else {
      // All steps completed
      celebrateCompletion();
    }
  };

  const autoValidateField = (fieldName: string, value: string) => {
    if (!autoValidationEnabled) return;
    
    const fieldGuidanceData = fieldGuidance[fieldName];
    if (!fieldGuidanceData) return;
    
    // Check if field is properly filled
    const isValid = value && value.trim().length > 0;
    
    if (isValid) {
      // Show success message
      const successMessages = {
        friendly: `Perfect! Great job filling out ${fieldName}! ✨`,
        professional: `Excellent. The ${fieldName} field is properly completed.`,
        encouraging: `Awesome! You're doing great with ${fieldName}! Keep it up! 🎉`
      };
      
      const message = successMessages[guidePersonality];
      if (message) {
        setTimeout(() => {
          typeMessage(message);
        }, 500);
      }
    }
  };

  const highlightField = (fieldName: string) => {
    setCurrentFieldFocus(fieldName);
    setShowFieldHighlight(true);
    
    // Scroll to field
    const fieldElement = document.querySelector(`[data-field="${fieldName}"]`);
    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setShowFieldHighlight(false);
      setCurrentFieldFocus('');
    }, 3000);
  };

  const celebrateCompletion = () => {
    setShowCelebration(true);
    showGuideMessage('completion');
    
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  const speakMessage = (message: string) => {
    if (guideVoiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  // Initialize schema on component mount
  useEffect(() => {
    setSchemaLoading(true);
    try {
      const formSchema = createFormSchema();
      setSchema(formSchema);
    } catch (error) {
      console.error('Error creating schema:', error);
      setSchemaError('Failed to create form schema');
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  // Update completion status when form data changes
  useEffect(() => {
    updateCompletionStatus();
    
    // Perform AI context analysis
    if (Object.keys(formData).length > 0) {
      analyzeUserContext(formData);
      performAdvancedAnalytics(formData);
    }
  }, [formData]);

  // Show guide messages based on current step
  useEffect(() => {
    if (isGuidedMode && !showWelcome) {
      const stepMessages = {
        0: 'welcome',
        1: 'personalInfo',
        2: 'experience',
        3: 'education',
        4: 'skills',
        5: 'completion'
      };
      
      const messageKey = stepMessages[currentStep];
      if (messageKey) {
        setTimeout(() => {
          showGuideMessage(messageKey);
        }, 500);
      }
    }
  }, [currentStep, isGuidedMode, showWelcome]);

  // Speak messages when voice is enabled
  useEffect(() => {
    if (guideMessage && guideVoiceEnabled) {
      speakMessage(guideMessage);
    }
  }, [guideMessage, guideVoiceEnabled]);
  
  // Guided form steps
  const guidedSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Resume Builder',
      description: 'Let\'s create your professional resume step by step',
      icon: <Star className="h-6 w-6" />,
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Add your contact details and basic information',
      icon: <User className="h-6 w-6" />,
      color: 'from-green-500 to-teal-500',
      fields: ['personalInfo']
    },
    {
      id: 'summary',
      title: 'Professional Summary',
      description: 'A compelling overview of your professional background',
      icon: <FileText className="h-6 w-6" />,
      color: 'from-blue-500 to-indigo-500',
      fields: ['summary']
    },
    {
      id: 'experience',
      title: 'Work Experience',
      description: 'List your professional work history and achievements',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'from-orange-500 to-red-500',
      fields: ['workExperience']
    },
    {
      id: 'education',
      title: 'Education & Qualifications',
      description: 'Add your academic background and certifications',
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500',
      fields: ['education']
    },
    {
      id: 'leadership',
      title: 'Leadership/Organizations',
      description: 'Your leadership roles and organizational involvement',
      icon: <Award className="h-6 w-6" />,
      color: 'from-yellow-500 to-orange-500',
      fields: ['leadership']
    },
    {
      id: 'volunteer',
      title: 'Volunteer Work',
      description: 'Your volunteer experience and community service',
      icon: <Star className="h-6 w-6" />,
      color: 'from-pink-500 to-rose-500',
      fields: ['volunteerWork']
    },
    {
      id: 'skills',
      title: 'Skills & Interests',
      description: 'Highlight your technical skills and other relevant information',
      icon: <Code className="h-6 w-6" />,
      color: 'from-indigo-500 to-blue-500',
      fields: ['skills', 'languages', 'interests', 'programs']
    },
    {
      id: 'references',
      title: 'References',
      description: 'Professional references',
      icon: <User className="h-6 w-6" />,
      color: 'from-gray-500 to-slate-500',
      fields: ['referees']
    },
    {
      id: 'review',
      title: 'Review & Export',
      description: 'Review your resume and generate the final PDF',
      icon: <FileText className="h-6 w-6" />,
      color: 'from-emerald-500 to-green-500',
      fields: []
    }
  ];

  // Advanced AI Context Engine
  const analyzeUserContext = (formData: any) => {
    const context = {
      experienceLevel: determineExperienceLevel(formData),
      industry: detectIndustry(formData),
      careerStage: assessCareerStage(formData),
      strengths: identifyStrengths(formData),
      improvementAreas: identifyImprovementAreas(formData),
      marketPosition: calculateMarketPosition(formData)
    };
    
    setAiContext(prev => ({
      ...prev,
      userProfile: context,
      optimizationScore: calculateOptimizationScore(context),
      personalizedRecommendations: generatePersonalizedRecommendations(context)
    }));
    
    return context;
  };

  const determineExperienceLevel = (data: any) => {
    const experience = data.workExperience || [];
    const years = experience.reduce((total: number, exp: any) => {
      const start = new Date(exp.startDate || 0);
      const end = exp.current ? new Date() : new Date(exp.endDate || 0);
      return total + (end.getFullYear() - start.getFullYear());
    }, 0);
    
    if (years < 2) return 'entry';
    if (years < 5) return 'mid';
    if (years < 10) return 'senior';
    return 'executive';
  };

  const detectIndustry = (data: any) => {
    const experience = data.workExperience || [];
    const skills = data.skills || [];
    const summary = data.summary || '';
    
    const industryKeywords = {
      'technology': ['software', 'developer', 'engineer', 'programming', 'tech', 'IT', 'coding'],
      'healthcare': ['medical', 'health', 'patient', 'clinical', 'nurse', 'doctor', 'healthcare'],
      'finance': ['financial', 'banking', 'investment', 'accounting', 'finance', 'trading'],
      'marketing': ['marketing', 'advertising', 'brand', 'digital', 'social media', 'content'],
      'education': ['teaching', 'education', 'academic', 'student', 'learning', 'curriculum']
    };
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      const text = [...experience, ...skills, summary].join(' ').toLowerCase();
      if (keywords.some(keyword => text.includes(keyword))) {
        return industry;
      }
    }
    
    return 'general';
  };

  const assessCareerStage = (data: any) => {
    const experience = data.workExperience || [];
    const education = data.education || [];
    
    if (experience.length === 0 && education.length > 0) return 'student';
    if (experience.length <= 2) return 'early-career';
    if (experience.length <= 5) return 'mid-career';
    if (experience.length <= 10) return 'experienced';
    return 'senior';
  };

  const identifyStrengths = (data: any) => {
    const strengths = [];
    const experience = data.workExperience || [];
    const skills = data.skills || [];
    
    if (experience.length > 3) strengths.push('extensive experience');
    if (skills.length > 10) strengths.push('diverse skill set');
    if (data.education && data.education.length > 0) strengths.push('strong education');
    if (data.certifications && data.certifications.length > 0) strengths.push('professional certifications');
    
    return strengths;
  };

  const identifyImprovementAreas = (data: any) => {
    const areas = [];
    
    if (!data.summary || data.summary.length < 50) areas.push('professional summary');
    if (!data.professionalExperience || data.professionalExperience.length === 0) areas.push('work experience');
    if (!data.skills || data.skills.length < 5) areas.push('skills section');
    if (!data.education || data.education.length === 0) areas.push('education');
    
    return areas;
  };

  const calculateMarketPosition = (data: any) => {
    let score = 0;
    
    // Experience scoring
    const experience = data.workExperience || [];
    score += Math.min(experience.length * 10, 50);
    
    // Skills scoring
    const skills = data.skills || [];
    score += Math.min(skills.length * 2, 20);
    
    // Education scoring
    const education = data.education || [];
    score += education.length * 5;
    
    // Summary quality
    if (data.summary && data.summary.length > 100) score += 15;
    
    return Math.min(score, 100);
  };

  const calculateOptimizationScore = (context: any) => {
    let score = 0;
    
    score += context.experienceLevel === 'executive' ? 30 : 
             context.experienceLevel === 'senior' ? 25 :
             context.experienceLevel === 'mid' ? 20 : 10;
    
    score += context.strengths.length * 5;
    score += (5 - context.improvementAreas.length) * 10;
    score += context.marketPosition;
    
    return Math.min(score, 100);
  };

  const generatePersonalizedRecommendations = (context: any) => {
    const recommendations = [];
    
    if (context.experienceLevel === 'entry') {
      recommendations.push('Focus on education and projects to compensate for limited experience');
      recommendations.push('Highlight transferable skills and achievements');
    }
    
    if (context.improvementAreas.includes('professional summary')) {
      recommendations.push('Create a compelling professional summary that highlights your unique value');
    }
    
    if (context.industry === 'technology') {
      recommendations.push('Include specific technologies and programming languages');
      recommendations.push('Highlight project outcomes and technical achievements');
    }
    
    return recommendations;
  };

  // Predictive Assistance Engine
  const generatePredictiveSuggestions = (currentField: string, currentValue: string) => {
    const suggestions = [];
    
    switch (currentField) {
      case 'summary':
        suggestions.push('Include 2-3 key achievements with quantifiable results');
        suggestions.push('Mention your years of experience and core competencies');
        suggestions.push('Use action verbs like "developed", "managed", "achieved"');
        break;
      case 'professionalExperience':
        suggestions.push('Use the STAR method: Situation, Task, Action, Result');
        suggestions.push('Quantify achievements with numbers and percentages');
        suggestions.push('Start each bullet point with a strong action verb');
        break;
      case 'skills':
        suggestions.push('Include both technical and soft skills');
        suggestions.push('List skills in order of proficiency');
        suggestions.push('Use industry-standard terminology');
        break;
    }
    
    return suggestions;
  };

  // Adaptive Learning System
  const updateAdaptiveLearning = (userAction: string, fieldName: string, success: boolean) => {
    setAdaptiveLearning(prev => {
      const newPatterns = {
        ...prev.userBehaviorPatterns,
        [fieldName]: {
          ...prev.userBehaviorPatterns[fieldName],
          [userAction]: (prev.userBehaviorPatterns[fieldName]?.[userAction] || 0) + 1,
          success: success
        }
      };
      
      const learningProgress = Object.keys(newPatterns).length * 10;
      
      return {
        ...prev,
        userBehaviorPatterns: newPatterns,
        learningProgress: Math.min(learningProgress, 100),
        personalizedTips: generatePersonalizedTips(newPatterns)
      };
    });
  };

  const generatePersonalizedTips = (patterns: any) => {
    const tips = [];
    
    // Analyze user patterns and generate personalized tips
    Object.entries(patterns).forEach(([field, data]: [string, any]) => {
      if (data.success) {
        tips.push(`Great job with ${field}! Keep using this approach.`);
      } else {
        tips.push(`Try a different approach for ${field}. Consider using more specific examples.`);
      }
    });
    
    return tips;
  };

  // Smart Workflow Engine
  const determineOptimalWorkflow = (userProfile: any) => {
    if (userProfile.experienceLevel === 'entry') {
      return {
        workflow: 'entry-level',
        steps: ['education', 'projects', 'skills', 'experience', 'summary'],
        focus: 'education and projects'
      };
    } else if (userProfile.experienceLevel === 'executive') {
      return {
        workflow: 'executive',
        steps: ['summary', 'experience', 'education', 'achievements', 'leadership'],
        focus: 'leadership and achievements'
      };
    } else {
      return {
        workflow: 'standard',
        steps: ['summary', 'experience', 'education', 'skills', 'achievements'],
        focus: 'balanced approach'
      };
    }
  };

  // Advanced Analytics Engine
  const performAdvancedAnalytics = (formData: any) => {
    const analytics = {
      resumeStrength: calculateResumeStrength(formData),
      atsCompatibility: calculateATSCompatibility(formData),
      marketCompetitiveness: calculateMarketCompetitiveness(formData),
      improvementAreas: identifyAdvancedImprovementAreas(formData),
      optimizationOpportunities: generateOptimizationOpportunities(formData)
    };
    
    setAdvancedAnalytics(analytics);
    return analytics;
  };

  const calculateResumeStrength = (data: any) => {
    let strength = 0;
    
    // Content quality
    if (data.summary && data.summary.length > 100) strength += 20;
    if (data.professionalExperience && data.professionalExperience.length > 0) strength += 30;
    if (data.education && data.education.length > 0) strength += 15;
    if (data.skills && data.skills.length > 5) strength += 20;
    
    // Quantification
    const text = JSON.stringify(data).toLowerCase();
    const numbers = text.match(/\d+/g) || [];
    strength += Math.min(numbers.length * 2, 15);
    
    return Math.min(strength, 100);
  };

  const calculateATSCompatibility = (data: any) => {
    let score = 0;
    
    // Required sections
    if (data.name) score += 10;
    if (data.email) score += 10;
    if (data.phone) score += 10;
    if (data.summary) score += 15;
    if (data.professionalExperience) score += 25;
    if (data.education) score += 15;
    if (data.skills) score += 15;
    
    return Math.min(score, 100);
  };

  const calculateMarketCompetitiveness = (data: any) => {
    const context = analyzeUserContext(data);
    return context.optimizationScore;
  };

  const identifyAdvancedImprovementAreas = (data: any) => {
    const areas = [];
    
    if (!data.summary || data.summary.length < 100) {
      areas.push({
        area: 'Professional Summary',
        priority: 'high',
        suggestion: 'Create a compelling 2-3 sentence summary that highlights your unique value proposition'
      });
    }
    
    if (!data.workExperience || data.workExperience.length === 0) {
      areas.push({
        area: 'Work Experience',
        priority: 'critical',
        suggestion: 'Add your work experience with quantifiable achievements'
      });
    }
    
    return areas;
  };

  const generateOptimizationOpportunities = (data: any) => {
    const opportunities = [];
    
    opportunities.push({
      type: 'content',
      title: 'Add Quantifiable Achievements',
      description: 'Include specific numbers, percentages, and metrics to make your resume more impactful',
      impact: 'high'
    });
    
    opportunities.push({
      type: 'format',
      title: 'Optimize for ATS',
      description: 'Use standard section headings and avoid complex formatting',
      impact: 'medium'
    });
    
    return opportunities;
  };

  // Virtual Guide Messages
  const guideMessages = {
    welcome: {
      friendly: "Hi there! 👋 I'm your virtual resume guide, Sarah. I'll help you create an amazing resume step by step. Let's start with your personal information!",
      professional: "Welcome to the resume builder. I'm your virtual assistant, and I'll guide you through each section to create a professional resume.",
      encouraging: "You've got this! 💪 I'm here to help you build a resume that will make employers take notice. Let's start this journey together!"
    },
    personalInfo: {
      friendly: "Great! Let's start with your personal information. This is like introducing yourself to potential employers. What should they call you?",
      professional: "We'll begin with your contact details. This information helps employers reach you for interviews.",
      encouraging: "First impressions matter! Let's make sure your contact information is perfect and professional."
    },
    experience: {
      friendly: "Now let's talk about your work experience! This is where you really shine. Tell me about your professional journey! ✨",
      professional: "Your work experience is the core of your resume. We'll highlight your achievements and responsibilities.",
      encouraging: "This is your chance to show off! Let's highlight all the amazing things you've accomplished in your career! 🚀"
    },
    education: {
      friendly: "Education time! Whether you have a degree, certifications, or self-taught skills, let's showcase your learning journey! 📚",
      professional: "Your educational background and qualifications are important for many positions. Let's add them to your resume.",
      encouraging: "Knowledge is power! Let's show employers how much you've learned and grown! 🎓"
    },
    skills: {
      friendly: "Skills time! This is where you get to brag about all the cool things you can do! What are you amazing at? 🎯",
      professional: "Your skills section demonstrates your capabilities. We'll organize them by category and proficiency level.",
      encouraging: "You're so talented! Let's make sure employers know about all your amazing skills! ⭐"
    },
    completion: {
      friendly: "Wow! You've done an incredible job! Your resume looks fantastic and ready to impress employers! 🎉",
      professional: "Excellent work. Your resume is now complete and professionally formatted. You're ready to apply for positions.",
      encouraging: "You did it! This resume is going to open so many doors for you. I'm so proud of what we've created together! 🌟"
    }
  };

  // Field hints and guidance
  const fieldGuidance = {
    name: {
      hint: "Enter your full name as it appears on official documents",
      example: "John Smith",
      tip: "Use your professional name consistently across all platforms"
    },
    email: {
      hint: "Use a professional email address",
      example: "john.smith@email.com",
      tip: "Avoid unprofessional email addresses like 'coolguy123@email.com'"
    },
    phone: {
      hint: "Include your phone number with country code if applying internationally",
      example: "+1 (555) 123-4567",
      tip: "Make sure this number is active and professional"
    },
    address: {
      hint: "City, State, Country (full address not necessary)",
      example: "San Francisco, CA, USA",
      tip: "Consider privacy - city and state are usually sufficient"
    },
    summary: {
      hint: "Write a compelling 2-3 sentence professional summary",
      example: "Experienced software engineer with 5+ years developing scalable web applications...",
      tip: "Highlight your key strengths, experience level, and career focus"
    },
    professionalExperience: {
      hint: "List your work experience in reverse chronological order",
      example: "Include job title, company, dates, and key achievements",
      tip: "Use action verbs and quantify your achievements with numbers"
    },
    education: {
      hint: "Include your highest degree and relevant certifications",
      example: "Bachelor of Science in Computer Science, Stanford University",
      tip: "Include GPA only if it's 3.5 or higher"
    },
    skills: {
      hint: "List your technical and soft skills",
      example: "JavaScript, Python, React, Project Management, Leadership",
      tip: "Include both technical skills and soft skills relevant to your field"
    }
  };

  const [schema, setSchema] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Create a comprehensive schema for the form
  const createFormSchema = () => ({
    template_name: "ProwriteTemplate Resume Template",
    fields: [
      // Personal Information
      { name: 'name', label: 'Full Name', type: 'text', required: true, section: 'personal', placeholder: 'Enter your full name' },
      { name: 'email', label: 'Email Address', type: 'email', required: true, section: 'personal', placeholder: 'your.email@example.com' },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: true, section: 'personal', placeholder: '+1 (555) 123-4567' },
      { name: 'address', label: 'Address', type: 'text', required: false, section: 'personal', placeholder: 'City, State, Country' },
      { name: 'summary', label: 'Professional Summary', type: 'textarea', required: true, section: 'personal', placeholder: 'Write a compelling summary of your professional background...' },
      
      // Professional Experience
      { name: 'professionalExperience', label: 'Professional Experience', type: 'array', required: true, section: 'experience', itemSchema: {
        company: { type: 'text', label: 'Company Name', required: true },
        position: { type: 'text', label: 'Job Title', required: true },
        startDate: { type: 'date', label: 'Start Date', required: true },
        endDate: { type: 'date', label: 'End Date', required: false },
        current: { type: 'checkbox', label: 'Currently Working', required: false },
        description: { type: 'textarea', label: 'Job Description', required: true },
        achievements: { type: 'array', label: 'Key Achievements', required: false, itemSchema: { type: 'text' } }
      }},
      
      // Education
      { name: 'education', label: 'Education', type: 'array', required: true, section: 'education', itemSchema: {
        institution: { type: 'text', label: 'Institution Name', required: true },
        degree: { type: 'text', label: 'Degree/Qualification', required: true },
        field: { type: 'text', label: 'Field of Study', required: false },
        startDate: { type: 'date', label: 'Start Date', required: true },
        endDate: { type: 'date', label: 'End Date', required: false },
        gpa: { type: 'text', label: 'GPA (Optional)', required: false },
        achievements: { type: 'textarea', label: 'Academic Achievements', required: false }
      }},
      
      // Skills
      { name: 'skills', label: 'Skills', type: 'array', required: true, section: 'skills', itemSchema: { type: 'text' }},
      
      // Languages
      { name: 'languages', label: 'Languages', type: 'array', required: false, section: 'skills', itemSchema: {
        language: { type: 'text', label: 'Language', required: true },
        proficiency: { type: 'select', label: 'Proficiency', required: true, options: ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'] }
      }},
      
      // Certifications
      { name: 'certifications', label: 'Certifications', type: 'array', required: false, section: 'skills', itemSchema: {
        name: { type: 'text', label: 'Certification Name', required: true },
        issuer: { type: 'text', label: 'Issuing Organization', required: true },
        date: { type: 'date', label: 'Date Obtained', required: true },
        expiry: { type: 'date', label: 'Expiry Date (Optional)', required: false }
      }},
      
      // Projects
      { name: 'projects', label: 'Projects', type: 'array', required: false, section: 'skills', itemSchema: {
        name: { type: 'text', label: 'Project Name', required: true },
        description: { type: 'textarea', label: 'Project Description', required: true },
        technologies: { type: 'array', label: 'Technologies Used', required: false, itemSchema: { type: 'text' }},
        url: { type: 'url', label: 'Project URL (Optional)', required: false },
        startDate: { type: 'date', label: 'Start Date', required: true },
        endDate: { type: 'date', label: 'End Date', required: false }
      }},
      
      // Achievements
      { name: 'achievements', label: 'Achievements & Awards', type: 'array', required: false, section: 'achievements', itemSchema: {
        title: { type: 'text', label: 'Achievement Title', required: true },
        description: { type: 'textarea', label: 'Description', required: true },
        date: { type: 'date', label: 'Date', required: true },
        issuer: { type: 'text', label: 'Issuing Organization', required: false }
      }}
    ],
    sections: [
      { id: 'personal', title: 'Personal Information', description: 'Your contact details and professional summary' },
      { id: 'experience', title: 'Professional Experience', description: 'Your work history and achievements' },
      { id: 'education', title: 'Education', description: 'Your academic background and qualifications' },
      { id: 'skills', title: 'Skills & Additional Info', description: 'Your technical skills and other relevant information' },
      { id: 'achievements', title: 'Achievements & Awards', description: 'Your notable achievements and recognitions' }
    ]
  });
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState<string>('');
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [currentFieldForGeneration, setCurrentFieldForGeneration] = useState<string>('');
  const [showATSAnalysis, setShowATSAnalysis] = useState(false);
  const [showEnhancedATSAnalysis, setShowEnhancedATSAnalysis] = useState(false);
  const [atsAnalysisMode, setAtsAnalysisMode] = useState<'pre-download' | 'post-download'>('post-download');
  const [showResumeImport, setShowResumeImport] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showJobDescriptionAnalyzer, setShowJobDescriptionAnalyzer] = useState(false);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [showExportIntegrationPanel, setShowExportIntegrationPanel] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Fetch the ProwriteTemplate template schema from API
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setSchemaLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/francisca/schema`);
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

  // Calculate form progress
  useEffect(() => {
    if (!schema) return;
    
    const totalFields = schema.fields.length;
    const filledFields = schema.fields.filter((field: any) => {
      const value = formData[field.name];
      if (field.type === 'array') {
        return value && value.length > 0;
      }
      return value && value.toString().trim() !== '';
    }).length;
    
    setFormProgress(Math.round((filledFields / totalFields) * 100));
  }, [formData, schema]);

  // Load saved drafts on component mount
  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem('prowrite-template_drafts') || '[]');
    setSavedDrafts(savedDrafts);
  }, []);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Auto-validate field
    if (autoValidationEnabled) {
      autoValidateField(fieldName, value);
    }
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

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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
        if (exp.duration) content += ` (${exp.duration})`;
        content += '\n';
        if (exp.responsibilities) content += `${exp.responsibilities}\n`;
      });
    }
    
    if (formData.education && formData.education.length > 0) {
      content += 'Education:\n';
      formData.education.forEach((edu: any) => {
        if (edu.degree) content += `${edu.degree}`;
        if (edu.field) content += ` in ${edu.field}`;
        if (edu.institution) content += ` from ${edu.institution}`;
        content += '\n';
        if (edu.activities) content += `${edu.activities}\n`;
      });
    }
    
    if (formData.skills) content += `Skills: ${formData.skills}\n\n`;
    
    return content;
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draft = {
        id: Date.now(),
        name: formData.name || 'Untitled Draft',
        timestamp: new Date().toISOString(),
        data: { ...formData },
        progress: formProgress
      };
      
      // Save to localStorage
      const existingDrafts = JSON.parse(localStorage.getItem('prowrite-template_drafts') || '[]');
      const updatedDrafts = [...existingDrafts, draft];
      localStorage.setItem('prowrite-template_drafts', JSON.stringify(updatedDrafts));
      
      setSavedDrafts(updatedDrafts);
      
      // Show success message
      alert(`Draft "${draft.name}" saved successfully!`);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDraft = (draft: any) => {
    if (confirm(`Load draft "${draft.name}"? This will replace your current form data.`)) {
      setFormData(draft.data);
    }
  };

  const handleDownloadAndAnalyze = async () => {
    try {
      const content = generateResumeContent();
      setResumeContent(content);
      
      // Show pre-download ATS analysis
      setAtsAnalysisMode('pre-download');
      setShowEnhancedATSAnalysis(true);
      
    } catch (error) {
      console.error('Error in download and analyze:', error);
    }
  };

  const handleDownloadResume = async () => {
    try {
      await handleSubmit(new Event('submit') as any);
      
      // Show post-download ATS analysis
      setAtsAnalysisMode('post-download');
      setShowEnhancedATSAnalysis(true);
      
    } catch (error) {
      console.error('Error in download:', error);
    }
  };

  const handlePreDownloadAnalysis = () => {
    setAtsAnalysisMode('pre-download');
    setShowEnhancedATSAnalysis(true);
  };

  const handlePostDownloadAnalysis = () => {
    setAtsAnalysisMode('post-download');
    setShowEnhancedATSAnalysis(true);
  };

  const handleResumeImport = (importedData: any) => {
    try {
      // Map imported data to form data
      const mappedData = {
        ...formData,
        ...importedData
      };
      
      setFormData(mappedData);
      setShowResumeImport(false);
      setShowWorkflow(false);
      
      // Show success message
      alert('Resume imported successfully! Your form has been filled with the extracted information.');
      
    } catch (error) {
      console.error('Error importing resume:', error);
      alert('Error importing resume. Please try again.');
    }
  };

  const handleStartBlankForm = () => {
    setShowWorkflow(false);
    // Form is already visible, just continue
  };

  const handleSkipWorkflow = () => {
    setShowWorkflow(false);
    // Form is already visible, just continue
  };

  const renderField = (field: any) => {
    const { name, label, type, required, styling, placeholder, validation, itemSchema, fields } = field;
    const value = formData[name];

    // Define field style
    const fieldStyle = {
      fontFamily: styling?.font?.includes('Arial') ? 'Arial, sans-serif' : 'inherit',
      fontSize: styling?.size ? `${styling.size}px` : 'inherit',
      fontWeight: styling?.bold ? 'bold' : 'normal',
      fontStyle: styling?.italic ? 'italic' : 'normal',
      textAlign: styling?.alignment || 'left',
      color: styling?.color || 'inherit',
      textTransform: styling?.uppercase ? 'uppercase' : 'none'
    };

    // Handle object type fields (like personalInfo)
    if (type === 'object' && fields) {
      return (
        <div key={name} className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800" style={fieldStyle}>
                {label} {required && <span className="text-red-500">*</span>}
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 rounded-lg">
            {Object.entries(fields).map(([fieldName, fieldConfig]: [string, any]) => {
              const fieldValue = value?.[fieldName] || '';
              return (
                <div key={fieldName} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {fieldConfig.label} {fieldConfig.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={fieldConfig.type === 'email' ? 'email' : fieldConfig.type === 'tel' ? 'tel' : fieldConfig.type === 'url' ? 'url' : 'text'}
                    value={fieldValue}
                    onChange={(e) => {
                      const newFormData = { ...formData };
                      if (!newFormData[name]) newFormData[name] = {};
                      newFormData[name][fieldName] = e.target.value;
                      setFormData(newFormData);
                    }}
                    placeholder={fieldConfig.placeholder || ''}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required={fieldConfig.required}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (type === 'array') {
      return (
        <div key={name} className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800" style={fieldStyle}>
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {value ? value.length : 0} {value && value.length === 1 ? 'entry' : 'entries'} added
                </p>
              </div>
              </div>
              <div className="flex items-center space-x-2">
                {value && value.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newFormData = { ...formData };
                      newFormData[name] = [];
                      setFormData(newFormData);
                    }}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors duration-200 flex items-center space-x-1"
                  >
                  <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              <button
                type="button"
                onClick={() => toggleSectionCollapse(name)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {collapsedSections[name] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              </div>
            </div>
          
          {!collapsedSections[name] && (
            <div className="space-y-4">
              {(!value || value.length === 0) && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium mb-2">No {label} entries yet</p>
                  <p className="text-sm mb-4">Click the button below to add your first {label.toLowerCase()} entry</p>
                  <button
                    type="button"
                    onClick={() => addArrayItem(name)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {label}
                  </button>
                </div>
              )}
              
              {(value || []).map((item: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                      <h4 className="font-semibold text-gray-800">{label} #{index + 1}</h4>
                  </div>
                    <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newFormData = { ...formData };
                        const newItem = { ...item };
                        newFormData[name] = [...(newFormData[name] || []), newItem];
                        setFormData(newFormData);
                      }}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                      title="Duplicate this entry"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(name, index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                      title="Remove this entry"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {itemSchema && Object.entries(itemSchema).map(([itemName, itemConfig]: [string, any]) => (
                  <div key={itemName}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                      {itemConfig.label || itemName.charAt(0).toUpperCase() + itemName.slice(1)} {itemConfig.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {itemConfig.type === 'textarea' ? (
                      <div className="relative">
                        <textarea
                          value={item?.[itemName] || ''}
                          onChange={(e) => handleArrayItemChange(name, index, { [itemName]: e.target.value })}
                          placeholder={itemConfig.placeholder || `Enter ${itemName}`}
                          className="w-full px-3 py-2 sm:py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          rows={itemConfig.rows || 3}
                          style={{
                            fontFamily: itemConfig.styling?.font?.includes('Arial') ? 'Arial, sans-serif' : 'inherit',
                            fontSize: itemConfig.styling?.size ? `${itemConfig.styling.size}px` : 'inherit',
                            fontWeight: itemConfig.styling?.bold ? 'bold' : 'normal',
                            fontStyle: itemConfig.styling?.italic ? 'italic' : 'normal',
                            textAlign: itemConfig.styling?.alignment || 'left'
                          }}
                        />
                        <ProwriteTemplateFieldEnhancer
                          fieldType={itemName}
                          currentValue={item?.[itemName] || ''}
                          profession={selectedProfession}
                          onEnhance={(enhancedValue) => handleArrayItemChange(name, index, { [itemName]: enhancedValue })}
                          className="absolute top-2 right-2"
                        />
                      </div>
                    ) : itemConfig.type === 'select' ? (
                      <div className="relative">
                        <select
                          value={item?.[itemName] || ''}
                          onChange={(e) => handleArrayItemChange(name, index, { [itemName]: e.target.value })}
                          className="w-full px-3 py-2 sm:py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          style={{
                            fontFamily: itemConfig.styling?.font?.includes('Arial') ? 'Arial, sans-serif' : 'inherit',
                            fontSize: itemConfig.styling?.size ? `${itemConfig.styling.size}px` : 'inherit',
                            fontWeight: itemConfig.styling?.bold ? 'bold' : 'normal',
                            fontStyle: itemConfig.styling?.italic ? 'italic' : 'normal',
                            textAlign: itemConfig.styling?.alignment || 'left'
                          }}
                        >
                          <option value="">Select {itemConfig.label?.toLowerCase() || itemName}</option>
                          {itemConfig.options?.map((option: any) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : itemConfig.type === 'checkbox' ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={item?.[itemName] || false}
                          onChange={(e) => handleArrayItemChange(name, index, { [itemName]: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{itemConfig.label || itemName}</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type={itemConfig.type === 'email' ? 'email' : itemConfig.type === 'tel' ? 'tel' : itemConfig.type === 'url' ? 'url' : itemConfig.type === 'date' ? 'date' : 'text'}
                          value={item?.[itemName] || ''}
                          onChange={(e) => handleArrayItemChange(name, index, { [itemName]: e.target.value })}
                          placeholder={itemConfig.placeholder || `Enter ${itemName}`}
                          className="w-full px-3 py-2 sm:py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          style={{
                            fontFamily: itemConfig.styling?.font?.includes('Arial') ? 'Arial, sans-serif' : 'inherit',
                            fontSize: itemConfig.styling?.size ? `${itemConfig.styling.size}px` : 'inherit',
                            fontWeight: itemConfig.styling?.bold ? 'bold' : 'normal',
                            fontStyle: itemConfig.styling?.italic ? 'italic' : 'normal',
                            textAlign: itemConfig.styling?.alignment || 'left'
                          }}
                        />
                        <ProwriteTemplateFieldEnhancer
                          fieldType={itemName}
                          currentValue={item?.[itemName] || ''}
                          profession={selectedProfession}
                          onEnhance={(enhancedValue) => handleArrayItemChange(name, index, { [itemName]: enhancedValue })}
                          className="absolute top-2 right-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
            <button
              type="button"
              onClick={() => addArrayItem(name)}
                className="w-full px-4 sm:px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
                <Plus className="w-5 h-5" />
              <span className="font-medium">Add Another {label}</span>
            </button>
          </div>
          )}
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div 
          key={name} 
          className={`mb-6 transition-all duration-500 ${
            showFieldHighlight && currentFieldFocus === name 
              ? 'ring-4 ring-yellow-300 ring-opacity-50 bg-yellow-50 rounded-lg p-4' 
              : ''
          }`}
          data-field={name}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700" style={fieldStyle}>
              {label} {required && <span className="text-red-500">*</span>}
              {showFieldHighlight && currentFieldFocus === name && (
                <span className="ml-2 text-yellow-600 text-xs">👈 Focus here!</span>
              )}
            </label>
            <div className="flex items-center space-x-2">
              {isGuidedMode && fieldGuidance[name] && (
                <button
                  onClick={() => {
                    setHelpContent(fieldGuidance[name]);
                    setShowHelp(true);
                  }}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  title="Get help with this field"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              )}
              {isGuidedMode && (
                <button
                  onClick={() => highlightField(name)}
                  className="text-purple-500 hover:text-purple-700 transition-colors"
                  title="Guide me to this field"
                >
                  <Target className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {isGuidedMode && fieldGuidance[name] && (
            <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">{fieldGuidance[name].hint}</p>
                  {fieldGuidance[name].example && (
                    <p className="text-blue-600 mt-1">
                      <span className="font-medium">Example:</span> {fieldGuidance[name].example}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="relative">
            <textarea
              value={value || ''}
              onChange={(e) => {
                console.log('Input onChange triggered for:', name, e.target.value);
                handleInputChange(name, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              placeholder={placeholder}
              className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                value ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              rows={4}
              style={fieldStyle}
            />
            {value && (
              <div className="absolute right-10 top-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            )}
            <ProwriteTemplateFieldEnhancer
              fieldType={name}
              currentValue={value || ''}
              profession={selectedProfession}
              onEnhance={(enhancedValue) => handleInputChange(name, enhancedValue)}
              className="absolute top-2 right-2"
            />
          </div>
          
          {isGuidedMode && fieldGuidance[name]?.tip && (
            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{fieldGuidance[name].tip}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        key={name} 
        className={`mb-6 transition-all duration-500 ${
          showFieldHighlight && currentFieldFocus === name 
            ? 'ring-4 ring-yellow-300 ring-opacity-50 bg-yellow-50 rounded-lg p-4' 
            : ''
        }`}
        data-field={name}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700" style={fieldStyle}>
            {label} {required && <span className="text-red-500">*</span>}
            {showFieldHighlight && currentFieldFocus === name && (
              <span className="ml-2 text-yellow-600 text-xs">👈 Focus here!</span>
            )}
          </label>
          <div className="flex items-center space-x-2">
            {isGuidedMode && fieldGuidance[name] && (
              <button
                onClick={() => {
                  setHelpContent(fieldGuidance[name]);
                  setShowHelp(true);
                }}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Get help with this field"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
            {isGuidedMode && (
              <button
                onClick={() => highlightField(name)}
                className="text-purple-500 hover:text-purple-700 transition-colors"
                title="Guide me to this field"
              >
                <Target className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {isGuidedMode && fieldGuidance[name] && (
          <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium">{fieldGuidance[name].hint}</p>
                {fieldGuidance[name].example && (
                  <p className="text-blue-600 mt-1">
                    <span className="font-medium">Example:</span> {fieldGuidance[name].example}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="relative">
          {type === 'select' ? (
            <select
              value={value || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                value ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              style={fieldStyle}
            >
              <option value="">Select {label.toLowerCase()}</option>
              {itemSchema?.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : type === 'checkbox' ? (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleInputChange(name, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ) : (
            <input
              type={type === 'email' ? 'email' : type === 'tel' ? 'tel' : type === 'url' ? 'url' : type === 'date' ? 'date' : 'text'}
              value={value || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              placeholder={placeholder}
              className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                value ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              style={fieldStyle}
            />
          )}
          {value && (
            <div className="absolute right-10 top-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
          <ProwriteTemplateFieldEnhancer
            fieldType={name}
            currentValue={value || ''}
            profession={selectedProfession}
            onEnhance={(enhancedValue) => handleInputChange(name, enhancedValue)}
            className="absolute top-2 right-2"
          />
        </div>
        
        {isGuidedMode && fieldGuidance[name]?.tip && (
          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">{fieldGuidance[name].tip}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: any) => {
    const sectionFields = schema.fields.filter((field: any) => field.section === section.id);
    const isCollapsed = collapsedSections[section.id];
    
    return (
      <div key={section.id} className="mb-8">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="bg-gray-50 px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={() => toggleSectionCollapse(section.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  {section.id === 'personal' && <User className="w-4 h-4 text-blue-600" />}
                  {section.id === 'summary' && <FileText className="w-4 h-4 text-blue-600" />}
                  {section.id === 'experience' && <WorkIcon className="w-4 h-4 text-blue-600" />}
                  {section.id === 'education' && <GraduationCap className="w-4 h-4 text-blue-600" />}
                  {section.id === 'leadership' && <Award className="w-4 h-4 text-blue-600" />}
                  {section.id === 'volunteer' && <Star className="w-4 h-4 text-blue-600" />}
                  {section.id === 'skills' && <Code className="w-4 h-4 text-blue-600" />}
                  {section.id === 'references' && <MessageCircle className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
            {section.title}
          </h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {sectionFields.length} fields
                </span>
                {isCollapsed ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-gray-500" />}
              </div>
            </div>
        </div>
        
          {!isCollapsed && (
            <div 
              className="p-6 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
          {sectionFields.map(renderField)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Check required fields
    if (!formData.personalInfo?.firstName) {
      errors.push('First name is required');
    }
    if (!formData.personalInfo?.lastName) {
      errors.push('Last name is required');
    }
    if (!formData.personalInfo?.email) {
      errors.push('Email is required');
    }
    if (!formData.personalInfo?.phone) {
      errors.push('Phone number is required');
    }
    if (!formData.summary) {
      errors.push('Professional summary is required');
    }
    if (!formData.workExperience || formData.workExperience.length === 0) {
      errors.push('At least one work experience entry is required');
    }
    if (!formData.education || formData.education.length === 0) {
      errors.push('At least one education entry is required');
    }
    
    // Validate work experience entries
    if (formData.workExperience) {
      formData.workExperience.forEach((exp: any, index: number) => {
        if (!exp.company) {
          errors.push(`Work experience ${index + 1}: Company name is required`);
        }
        if (!exp.jobTitle) {
          errors.push(`Work experience ${index + 1}: Job title is required`);
        }
        if (!exp.startDate) {
          errors.push(`Work experience ${index + 1}: Start date is required`);
        }
        if (!exp.description) {
          errors.push(`Work experience ${index + 1}: Job description is required`);
        }
      });
    }
    
    // Validate education entries
    if (formData.education) {
      formData.education.forEach((edu: any, index: number) => {
        if (!edu.institution) {
          errors.push(`Education ${index + 1}: Institution name is required`);
        }
        if (!edu.degree) {
          errors.push(`Education ${index + 1}: Degree is required`);
        }
        if (!edu.fieldOfStudy) {
          errors.push(`Education ${index + 1}: Field of study is required`);
        }
        if (!edu.startDate) {
          errors.push(`Education ${index + 1}: Start date is required`);
        }
      });
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    // Show payment modal instead of directly generating PDF
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (submissionId: number) => {
    setSubmissionId(submissionId);
    setShowPaymentModal(false);
    // You can add additional success handling here
    console.log('Payment successful, submission ID:', submissionId);
  };

  // Show loading state while fetching schema
  if (schemaLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Form Schema...</h2>
              <p className="text-gray-600">Please wait while we prepare your resume form</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if schema failed to load
  if (schemaError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Form</h2>
              <p className="text-gray-600 mb-4">{schemaError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show form if schema is loaded
  if (!schema) {
    return null;
  }

  // Show workflow if enabled
  if (showWorkflow) {
    console.log('Rendering ResumeWorkflow component');
    return (
      <ResumeWorkflow
        onResumeImported={handleResumeImport}
        onStartBlankForm={handleStartBlankForm}
        onSkip={handleSkipWorkflow}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Welcome Modal */}
        {showWelcome && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Resume Builder!</h2>
                  <p className="text-gray-600 text-lg">Let's create your professional resume step by step</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Guided Experience</h3>
                      <p className="text-gray-600 text-sm">We'll walk you through each section with helpful tips and examples</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI-Powered Assistance</h3>
                      <p className="text-gray-600 text-sm">Get AI suggestions and content generation for each field</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Professional Results</h3>
                      <p className="text-gray-600 text-sm">Create a resume that stands out to employers and ATS systems</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                  >
                    Start Building Resume
                  </button>
                  <button
                    onClick={() => {
                      setIsGuidedMode(false);
                      setShowWelcome(false);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Skip Guidance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced AI Dashboard */}
        {showVirtualGuide && !showWelcome && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-md">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-500 font-bold text-lg">🤖</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">AI Resume Assistant</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setGuideVoiceEnabled(!guideVoiceEnabled)}
                        className={`p-1 rounded ${
                          guideVoiceEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                        title={guideVoiceEnabled ? 'Voice On' : 'Voice Off'}
                      >
                        🔊
                      </button>
                      <button
                        onClick={() => setShowVirtualGuide(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* AI Context Display */}
                  {aiContext.userProfile && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium text-blue-700">AI Analysis</span>
                      </div>
                      <div className="text-xs text-gray-700 space-y-1">
                        <div>Level: <span className="font-medium">{aiContext.userProfile.experienceLevel}</span></div>
                        <div>Industry: <span className="font-medium">{aiContext.userProfile.industry}</span></div>
                        <div>Score: <span className="font-medium text-green-600">{aiContext.optimizationScore}%</span></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {guideIsTyping ? 'Analyzing...' : 'AI Active'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {guideMessage || "I'm analyzing your profile to provide personalized guidance. Let's optimize your resume!"}
                    </p>
                  </div>
                  
                  {/* Advanced Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">AI Mode:</span>
                      <select
                        value={guidePersonality}
                        onChange={(e) => setGuidePersonality(e.target.value as any)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="friendly">Friendly</option>
                        <option value="professional">Professional</option>
                        <option value="encouraging">Encouraging</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsAutoMode(!isAutoMode)}
                        className={`text-xs px-2 py-1 rounded ${
                          isAutoMode 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isAutoMode ? '🤖 Auto' : '⏸️ Manual'}
                      </button>
                      
                      <button
                        onClick={() => setAutoValidationEnabled(!autoValidationEnabled)}
                        className={`text-xs px-2 py-1 rounded ${
                          autoValidationEnabled 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {autoValidationEnabled ? '✅ Validate' : '❌ No Validate'}
                      </button>
                    </div>
                    
                    {isAutoMode && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Speed:</span>
                          <input
                            type="range"
                            min="1000"
                            max="5000"
                            step="500"
                            value={autoProgressDelay}
                            onChange={(e) => setAutoProgressDelay(Number(e.target.value))}
                            className="flex-1 h-1"
                          />
                          <span className="text-xs text-gray-500">
                            {(autoProgressDelay / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Insights Button */}
                    <button
                      onClick={() => {
                        const analytics = performAdvancedAnalytics(formData);
                        setShowSmartSuggestions(true);
                      }}
                      className="w-full text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                      🔍 Get AI Insights
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced AI Insights Modal */}
        {showSmartSuggestions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                    AI Resume Analysis
                  </h3>
                  <button
                    onClick={() => setShowSmartSuggestions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{advancedAnalytics.resumeStrength}%</div>
                    <div className="text-sm text-green-700">Resume Strength</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{advancedAnalytics.atsCompatibility}%</div>
                    <div className="text-sm text-blue-700">ATS Compatibility</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{advancedAnalytics.marketCompetitiveness}%</div>
                    <div className="text-sm text-purple-700">Market Competitiveness</div>
                  </div>
                </div>
                
                {/* Improvement Areas */}
                {advancedAnalytics.improvementAreas.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Priority Improvements</h4>
                    <div className="space-y-3">
                      {advancedAnalytics.improvementAreas.map((area: any, index: number) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${
                          area.priority === 'critical' ? 'bg-red-50 border-red-400' :
                          area.priority === 'high' ? 'bg-orange-50 border-orange-400' :
                          'bg-yellow-50 border-yellow-400'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{area.area}</h5>
                            <span className={`text-xs px-2 py-1 rounded ${
                              area.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              area.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {area.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{area.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Optimization Opportunities */}
                {advancedAnalytics.optimizationOpportunities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Optimization Opportunities</h4>
                    <div className="space-y-3">
                      {advancedAnalytics.optimizationOpportunities.map((opportunity: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{opportunity.title}</h5>
                            <span className={`text-xs px-2 py-1 rounded ${
                              opportunity.impact === 'high' ? 'bg-red-100 text-red-700' :
                              opportunity.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {opportunity.impact} impact
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{opportunity.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Personalized Recommendations */}
                {aiContext.personalizedRecommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Personalized Recommendations</h4>
                    <div className="space-y-2">
                      {aiContext.personalizedRecommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowSmartSuggestions(false)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Apply Insights
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <div className="text-2xl font-bold text-white bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 rounded-full shadow-lg">
                Amazing Work!
              </div>
            </div>
          </div>
        )}

        {/* Guided Progress Bar */}
        {isGuidedMode && !showWelcome && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">Resume Building Progress</h3>
                {isAutoMode && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Auto Mode</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  className={`text-xs px-2 py-1 rounded ${
                    isAutoMode 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isAutoMode ? '🤖 Auto' : '⏸️ Manual'}
                </button>
                <button
                  onClick={() => setIsGuidedMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Exit Guided Mode
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              {guidedSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    index <= currentStep 
                      ? `bg-gradient-to-r ${step.color}` 
                      : 'bg-gray-300'
                  }`}>
                    {index < currentStep ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  {index < guidedSteps.length - 1 && (
                    <div className={`w-8 h-1 mx-2 ${
                      index < currentStep ? `bg-gradient-to-r ${step.color}` : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-1">{guidedSteps[currentStep]?.title}</h4>
              <p className="text-gray-600 text-sm">{guidedSteps[currentStep]?.description}</p>
            </div>
          </div>
        )}


        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {schema?.template_name || 'Loading...'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 px-2">
              {isGuidedMode 
                ? "Follow the guided steps below to create your professional resume"
                : "Fill out the form below to generate your professional resume with preserved styling"
              }
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                {formProgress}% Complete
              </span>
              <span className="text-gray-400">•</span>
              <span>{schema.fields.length} total fields</span>
            </div>
            
            {schema.style_preserved && (
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                Style Preserved
              </div>
            )}
          </div>
            
            {/* AI Enhancement Controls */}
          <div className="space-y-6">
              {/* Profession Selector */}
              <div className="flex items-center justify-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Your Profession:</label>
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Profession</option>
                  <option value="software_engineer">Software Engineer</option>
                  <option value="marketing_manager">Marketing Manager</option>
                  <option value="sales_professional">Sales Professional</option>
                  <option value="healthcare_professional">Healthcare Professional</option>
                  <option value="finance_professional">Finance Professional</option>
                </select>
              </div>
              
              {/* AI Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setShowChatbot(true)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Let AI Build Your Resume</span>
                  <span className="sm:hidden">AI Build Resume</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    console.log('Start Resume Workflow button clicked');
                    setShowWorkflow(true);
                  }}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-green-300 text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Start Resume Workflow</span>
                  <span className="sm:hidden">Start Workflow</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResumeImport(true)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-indigo-300 text-sm sm:text-base"
                >
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Import Existing Resume</span>
                  <span className="sm:hidden">Import Resume</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setCurrentFieldForGeneration('activities');
                    setShowPromptGenerator(true);
                  }}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Generate Content with AI</span>
                  <span className="sm:hidden">AI Generate</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowJobDescriptionAnalyzer(true)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Analyze Job Description</span>
                  <span className="sm:hidden">Analyze Job</span>
                </button>
              </div>


              {/* Phase 8: Collaboration & Export Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setShowCollaborationPanel(true)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Collaboration & Sharing</span>
                  <span className="sm:hidden">Collaboration</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowExportIntegrationPanel(true)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Export & Integration</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
              
            <div className="text-center">
              <p className="text-xs text-gray-500">
                💡 Select your profession for better AI suggestions, or chat with AI to auto-fill your resume
              </p>
            </div>
            </div>
          </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          {/* Saved Drafts Section */}
          {savedDrafts.length > 0 && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Save className="w-5 h-5 mr-2" />
                Saved Drafts ({savedDrafts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedDrafts.slice(-6).reverse().map((draft: any) => (
                  <div key={draft.id} className="bg-white p-3 rounded border border-blue-200 hover:border-blue-300 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800 truncate">{draft.name}</h4>
                      <span className="text-xs text-gray-500">{draft.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {new Date(draft.timestamp).toLocaleDateString()}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleLoadDraft(draft)}
                      className="w-full text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors duration-200"
                    >
                      Load Draft
                    </button>
                  </div>
                ))}
               </div>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-8">
             {schemaLoading ? (
               <div className="text-center py-12">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                 <p className="text-gray-600">Loading form...</p>
               </div>
             ) : schemaError ? (
               <div className="text-center py-12">
                 <div className="text-red-500 mb-4">
                   <X className="h-12 w-12 mx-auto" />
                 </div>
                 <p className="text-red-600 mb-4">{schemaError}</p>
                 <button
                   onClick={() => {
                     const formSchema = createFormSchema();
                     setSchema(formSchema);
                   }}
                   className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                 >
                   Retry
                 </button>
               </div>
             ) : schema && schema.sections ? (
               schema.sections.map(renderSection)
             ) : (
               <div className="text-center py-12">
                 <p className="text-gray-600">No form sections available</p>
               </div>
             )}
            
            {/* AI and Theme Controls */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                AI Enhancement & Theme Options
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Enhancement Toggle */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.use_ai || false}
                      onChange={(e) => setFormData({...formData, use_ai: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Enable AI Enhancement</span>
                      <p className="text-xs text-gray-500">Let AI improve your content and optimize for ATS</p>
                    </div>
                  </label>
                </div>
                
                {/* Theme Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Resume Theme
                  </label>
                  <select
                    value={formData.theme || 'professional'}
                    onChange={(e) => setFormData({...formData, theme: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="modern">Modern</option>
                    <option value="creative">Creative</option>
                    <option value="minimalist">Minimalist</option>
                  </select>
                </div>
                
                {/* Job Description (for AI targeting) */}
                <div className="space-y-3 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Target Job Description (Optional)
                  </label>
                  <textarea
                    value={formData.job_description || ''}
                    onChange={(e) => setFormData({...formData, job_description: e.target.value})}
                    placeholder="Paste a job description to optimize your resume for this specific role..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    AI will analyze this job description to tailor your resume content and highlight relevant skills.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between items-center pt-8 border-t border-gray-200 space-y-4 sm:space-y-0 bg-gray-50 -mx-8 -mb-8 px-8 py-6 rounded-b-xl">
              <div className="flex flex-wrap gap-3">
               <button
                 type="button"
                 onClick={() => setFormData({})}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
               >
                 Clear Form
               </button>
               <button
                 type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className={`px-6 py-2 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex items-center ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </>
                  )}
               </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Pre-Download ATS Analysis */}
                <button
                  type="button"
                  onClick={handlePreDownloadAnalysis}
                  disabled={isLoading}
                  className={`px-3 sm:px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center space-x-2 transition-colors duration-200 text-sm sm:text-base ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  title="See ATS analysis before downloading"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview ATS Score</span>
                  <span className="sm:hidden">Preview</span>
                </button>

                {/* Download & Analyze */}
                <button
                  type="button"
                  onClick={handleDownloadAndAnalyze}
                  disabled={isLoading}
                  className={`px-3 sm:px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center space-x-2 transition-colors duration-200 text-sm sm:text-base ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  title="Download resume and see detailed ATS analysis"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Download & Analyze</span>
                  <span className="sm:hidden">Download</span>
                </button>

                {/* Regular Download */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-3 sm:px-8 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  title="Download resume without analysis"
                >
                  {isLoading ? (
                     <>
                       <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="hidden sm:inline">Generating...</span>
                      <span className="sm:hidden">Loading...</span>
                     </>
                  ) : (
                     <>
                       <Save className="h-4 w-4" />
                       <span className="hidden sm:inline">Pay & Generate Resume (KES 500)</span>
                       <span className="sm:hidden">Generate (KES 500)</span>
                     </>
                  )}
                </button>

                {/* Post-Download Analysis */}
                <button
                  type="button"
                  onClick={handlePostDownloadAnalysis}
                  disabled={isLoading}
                  className={`px-3 sm:px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center space-x-2 transition-colors duration-200 text-sm sm:text-base ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                  title="Analyze your resume after downloading"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Analyze Resume</span>
                  <span className="sm:hidden">Analyze</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* AI Chatbot */}
      <ProwriteTemplateChatbot
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        onAutoFill={handleChatbotAutoFill}
      />
      
      {/* AI Smart Prompt Generator */}
      <ProwriteTemplateSmartPromptGenerator
        fieldType={currentFieldForGeneration}
        profession={selectedProfession}
        onGenerateContent={(content) => {
          if (currentFieldForGeneration) {
            handleInputChange(currentFieldForGeneration, content);
          }
        }}
        isOpen={showPromptGenerator}
        onClose={() => setShowPromptGenerator(false)}
      />
      
             {/* ATS Analysis */}
       <ProwriteTemplateATSAnalysis
         isOpen={showATSAnalysis}
         onClose={() => setShowATSAnalysis(false)}
         resumeContent={resumeContent}
         profession={selectedProfession}
         jobTitle={formData.professionalExperience?.[0]?.position || ''}
       />

       {/* Enhanced ATS Analysis */}
       <EnhancedATSAnalysis
         isOpen={showEnhancedATSAnalysis}
         onClose={() => setShowEnhancedATSAnalysis(false)}
         resumeContent={resumeContent}
         profession={selectedProfession}
         jobTitle={formData.professionalExperience?.[0]?.position || ''}
         showDownloadOption={atsAnalysisMode === 'pre-download'}
         onDownload={handleDownloadResume}
         analysisMode={atsAnalysisMode}
       />

       {/* Resume Import Modal */}
       <ResumeImportModal
         isOpen={showResumeImport}
         onClose={() => setShowResumeImport(false)}
         onImportSuccess={handleResumeImport}
       />

       {/* Job Description Analyzer */}
       <ProwriteTemplateJobDescriptionAnalyzer
         isOpen={showJobDescriptionAnalyzer}
         onClose={() => setShowJobDescriptionAnalyzer(false)}
         resumeContent={resumeContent}
         profession={selectedProfession}
       />

      {/* Collaboration Panel */}
       <ProwriteTemplateCollaborationPanel
         isOpen={showCollaborationPanel}
         onClose={() => setShowCollaborationPanel(false)}
         resumeContent={formData}
       />

      {/* Export & Integration Panel */}
       <ProwriteTemplateExportIntegrationPanel
         isOpen={showExportIntegrationPanel}
         onClose={() => setShowExportIntegrationPanel(false)}
         resumeContent={formData}
       />

      {/* Help Modal */}
      {showHelp && helpContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Field Help</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What to enter:</h4>
                  <p className="text-blue-800 text-sm">{helpContent.hint}</p>
                </div>
                
                {helpContent.example && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Example:</h4>
                    <p className="text-green-800 text-sm font-mono">{helpContent.example}</p>
                  </div>
                )}
                
                {helpContent.tip && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Pro Tip:
                    </h4>
                    <p className="text-yellow-800 text-sm">{helpContent.tip}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Guided Navigation */}
      {isGuidedMode && !showWelcome && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleStepNavigation('prev')}
                disabled={currentStep === 0}
                className={`p-2 rounded-lg transition-colors ${
                  currentStep === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
                title="Previous step"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  Step {currentStep + 1} of {guidedSteps.length}
                </div>
                <div className="text-xs text-gray-500">
                  {guidedSteps[currentStep]?.title}
                </div>
                {getStepCompletion(currentStep) && (
                  <div className="flex items-center justify-center mt-1">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Complete</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleStepNavigation('next')}
                disabled={currentStep === guidedSteps.length - 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentStep === guidedSteps.length - 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
                title="Next step"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    const currentStepFields = guidedSteps[currentStep]?.fields || [];
                    if (currentStepFields.length > 0) {
                      highlightField(currentStepFields[0]);
                    }
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                  title="Show me what to fill"
                >
                  <Target className="h-3 w-3 mr-1" />
                  Guide Me
                </button>
                
                <button
                  onClick={() => {
                    if (currentStep === guidedSteps.length - 1) {
                      celebrateCompletion();
                    } else {
                      handleStepNavigation('next');
                    }
                  }}
                  className="text-xs bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full hover:from-green-600 hover:to-blue-600 transition-all"
                  title="Continue"
                >
                  {currentStep === guidedSteps.length - 1 ? 'Finish!' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Guide Toggle */}
      {!showVirtualGuide && !showWelcome && (
        <div className="fixed top-6 right-6 z-40">
          <button
            onClick={() => setShowVirtualGuide(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
            title="Show Virtual Guide"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Payment Modal */}
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        formData={formData}
        documentType="Prowrite Template Resume"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ProwriteTemplateDynamicForm;
