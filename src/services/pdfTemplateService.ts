/**
 * Service for interacting with the PDF template API
 */
import api from './api';

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
  };
  education: Array<{
    institution: string;
    location?: string;
    city?: string;
    country?: string;
    degree: string;
    fieldOfStudy: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    relevantCoursework?: string | string[];
    activities?: string | string[];
  }>;
  workExperience: Array<{
    employer: string;
    location?: string;
    city?: string;
    country?: string;
    jobTitle: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description: string | string[];
  }>;
  leadership?: Array<{
    organization: string;
    location?: string;
    title: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    responsibilities?: string | string[];
    achievements?: string | string[];
  }>;
  volunteerWork?: Array<{
    organization: string;
    location?: string;
    title: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description: string | string[];
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  skills?: Array<{
    name: string;
  }>;
  interests?: string[];
  programs?: string[];
  referees?: Array<{
      name: string;
    position: string;
    organization: string;
    contact?: string;
    phone?: string;
    email?: string;
  }>;
}

interface AIEnhancedData extends ResumeData {
  use_ai: boolean;
  theme: string;
  job_description?: string;
  industry?: string;
}

interface AIAnalysis {
  skills_analysis?: {
    missing_skills: string[];
    recommendations: string[];
    strengths: string[];
    highlight_suggestions: string[];
  };
  job_keywords?: string[];
  design_recommendations?: string[];
}

interface GenerateResponse {
  success: boolean;
  pdf_path: string;
  enhanced_data?: ResumeData;
  skills_analysis?: AIAnalysis['skills_analysis'];
  job_keywords?: string[];
  design_recommendations?: string[];
}

class PDFTemplateService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://prowrite.pythonanywhere.com';
  }

  /**
   * Generate a resume using the Prowrite Template template
   */
  async generateProwriteTemplateResume(resumeData: AIEnhancedData): Promise<GenerateResponse> {
    try {
      const response = await api.post('/api/resumes/generate-francisca', {
        resume_data: resumeData,
        use_ai: resumeData.use_ai,
        theme: resumeData.theme,
        job_description: resumeData.job_description,
        industry: resumeData.industry
      });
      
      const result = response.data;
      
      // Create download link
      if (result.success && result.pdf_path) {
        const downloadLink = document.createElement('a');
        downloadLink.href = `${this.baseUrl}${result.pdf_path}`;
        downloadLink.target = '_blank';
        downloadLink.download = 'prowrite-template_resume.pdf';
        downloadLink.click();
      }

      return result;
    } catch (error) {
      console.error('Error generating resume:', error);
      throw error;
    }
  }
}

export const pdfTemplateService = new PDFTemplateService();