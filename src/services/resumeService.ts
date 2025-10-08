import api from './api';

export interface Resume {
  resume_id: number;
  user_id: number;
  template_id?: number;
  title: string;
  json_content: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  template_name?: string;
  thumbnail_url?: string;
}

export interface ParsedResume {
  id: number;
  user_id: number;
  original_filename: string;
  file_path: string;
  parsed_data: {
    personal_info: {
      name: string;
      email: string;
      phone: string;
      address: string;
      linkedin: string;
    };
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      gpa: string;
    }>;
    skills: string[];
    certifications: string[];
    languages: string[];
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
    }>;
  };
  raw_text: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeSection {
  section_id: number;
  resume_id: number;
  section_type: string;
  section_title: string;
  content: string;
  display_order: number;
}

export interface CreateResumeData {
  template_id?: number;
  title: string;
}

export interface UpdateResumeData {
  title?: string;
  content?: any;
  sections?: ResumeSection[];
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  parsed_resume_id: number;
  parsed_data: ParsedResume['parsed_data'];
  filename: string;
}

class ResumeService {
  async getUserResumes(): Promise<Resume[]> {
    const response = await api.get('/api/resumes');
    return response.data.data || [];
  }

  async getResume(resumeId: number): Promise<Resume & { sections: ResumeSection[] }> {
    const response = await api.get(`/api/resumes/${resumeId}`);
    return response.data.data;
  }

  async createResume(data: CreateResumeData): Promise<{ message: string; resume_id: number }> {
    const response = await api.post('/api/resumes', data);
    return response.data;
  }

  async updateResume(resumeId: number, data: UpdateResumeData): Promise<{ message: string }> {
    const response = await api.put(`/api/resumes/${resumeId}`, data);
    return response.data;
  }

  async enhanceResume(
    resumeId: number, 
    sectionId: number, 
    jobDescription?: string, 
    tone: string = 'formal'
  ): Promise<{ message: string; enhancements: string[] }> {
    const response = await api.post(`/api/resumes/${resumeId}/enhance`, {
      section_id: sectionId,
      job_description: jobDescription,
      tone
    });
    return response.data;
  }

  async analyzeResume(
    resumeId: number, 
    jobDescription?: string
  ): Promise<{ message: string; score: any }> {
    const response = await api.post(`/api/resumes/${resumeId}/analyze`, {
      job_description: jobDescription
    });
    return response.data;
  }

  async generateCoverLetter(
    resumeId: number, 
    company: string, 
    position: string, 
    templateId?: number
  ): Promise<{ message: string; cover_letter_id: number; content: string }> {
    const response = await api.post(`/api/resumes/${resumeId}/cover-letter`, {
      company,
      position,
      template_id: templateId
    });
    return response.data;
  }

  // New methods for resume upload and parsing
  async uploadResume(file: File): Promise<UploadResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getParsedResumes(): Promise<ParsedResume[]> {
    const response = await api.get('/api/resumes/parsed');
    return response.data.parsed_resumes;
  }

  async getParsedResume(resumeId: number): Promise<ParsedResume> {
    const response = await api.get(`/api/resumes/parsed/${resumeId}`);
    return response.data.parsed_resume;
  }

  async deleteParsedResume(resumeId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/resumes/parsed/${resumeId}`);
    return response.data;
  }
}

export const resumeService = new ResumeService();
export default resumeService;