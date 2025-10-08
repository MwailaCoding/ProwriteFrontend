/**
 * Prowrite Template Question Flow Service
 * Handles the guided resume building process with real-time enhancement
 */

import axios from 'axios';

export interface QuestionField {
  field: string;
  question: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'number' | 'select' | 'textarea' | 'tags';
  required: boolean;
  placeholder: string;
  enhancement_hint: string;
  options?: string[];
}

export interface QuestionStep {
  step: string;
  title: string;
  description: string;
  fields: QuestionField[];
}

export interface Progress {
  current_step: number;
  current_step_name: string;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  is_complete: boolean;
}

export interface Enhancement {
  enhanced: string;
  suggestions: string[];
  quality_score: number;
  improvements: string[];
  field_specific_tips: string[];
}

export interface AnswerResponse {
  success: boolean;
  answer: {
    success: boolean;
    field: string;
    answer: string;
    step_completed: string;
    progress: Progress;
  };
  enhancement: Enhancement;
  next_question: QuestionStep | null;
  progress: Progress;
}

export interface ResumeData {
  [key: string]: string;
}

class ProwriteTemplateQuestionService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api';
  }

  /**
   * Start the guided question flow
   */
  async startQuestionFlow(): Promise<{ question: QuestionStep; progress: Progress }> {
    try {
      const response = await axios.post(`${this.baseURL}/prowrite-template/questions/start`);
      return {
        question: response.data.question,
        progress: response.data.progress
      };
    } catch (error: any) {
      console.error('Error starting question flow:', error);
      throw new Error(error.response?.data?.error || 'Failed to start question flow');
    }
  }

  /**
   * Get the current question
   */
  async getCurrentQuestion(): Promise<{ question: QuestionStep; progress: Progress }> {
    try {
      const response = await axios.get(`${this.baseURL}/prowrite-template/questions/current`);
      return {
        question: response.data.question,
        progress: response.data.progress
      };
    } catch (error: any) {
      console.error('Error getting current question:', error);
      throw new Error(error.response?.data?.error || 'Failed to get current question');
    }
  }

  /**
   * Submit an answer and get enhancement suggestions
   */
  async submitAnswer(field: string, answer: string, context: Record<string, any> = {}): Promise<AnswerResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/prowrite-template/questions/answer`, {
        field,
        answer,
        context
      });
      return response.data;
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      throw new Error(error.response?.data?.error || 'Failed to submit answer');
    }
  }

  /**
   * Get the next question
   */
  async getNextQuestion(): Promise<{ question: QuestionStep | null; progress: Progress }> {
    try {
      const response = await axios.post(`${this.baseURL}/prowrite-template/questions/next`);
      return {
        question: response.data.question,
        progress: response.data.progress
      };
    } catch (error: any) {
      console.error('Error getting next question:', error);
      throw new Error(error.response?.data?.error || 'Failed to get next question');
    }
  }

  /**
   * Get the previous question
   */
  async getPreviousQuestion(): Promise<{ question: QuestionStep | null; progress: Progress }> {
    try {
      const response = await axios.post(`${this.baseURL}/prowrite-template/questions/previous`);
      return {
        question: response.data.question,
        progress: response.data.progress
      };
    } catch (error: any) {
      console.error('Error getting previous question:', error);
      throw new Error(error.response?.data?.error || 'Failed to get previous question');
    }
  }

  /**
   * Jump to a specific step
   */
  async jumpToStep(stepName: string): Promise<{ question: QuestionStep; progress: Progress }> {
    try {
      const response = await axios.post(`${this.baseURL}/prowrite-template/questions/jump`, {
        step: stepName
      });
      return {
        question: response.data.question,
        progress: response.data.progress
      };
    } catch (error: any) {
      console.error('Error jumping to step:', error);
      throw new Error(error.response?.data?.error || 'Failed to jump to step');
    }
  }

  /**
   * Get current progress
   */
  async getProgress(): Promise<Progress> {
    try {
      const response = await axios.get(`${this.baseURL}/prowrite-template/questions/progress`);
      return response.data.progress;
    } catch (error: any) {
      console.error('Error getting progress:', error);
      throw new Error(error.response?.data?.error || 'Failed to get progress');
    }
  }

  /**
   * Get complete resume data for auto-filling
   */
  async getResumeData(): Promise<{ resume_data: ResumeData; progress: Progress }> {
    try {
      const response = await axios.get(`${this.baseURL}/prowrite-template/questions/resume-data`);
      return {
        resume_data: response.data.resume_data,
        progress: response.data.progress
      };
    } catch (error: any) {
      console.error('Error getting resume data:', error);
      throw new Error(error.response?.data?.error || 'Failed to get resume data');
    }
  }

  /**
   * Get step summary
   */
  async getStepSummary(stepName: string): Promise<{ summary: any }> {
    try {
      const response = await axios.post(`${this.baseURL}/prowrite-template/questions/step-summary`, {
        step: stepName
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting step summary:', error);
      throw new Error(error.response?.data?.error || 'Failed to get step summary');
    }
  }

  /**
   * Enhance an answer without submitting
   */
  async enhanceAnswer(field: string, answer: string, context: Record<string, any> = {}): Promise<Enhancement> {
    try {
      const response = await axios.post(`${this.baseURL}/prowrite-template/ai/enhance-field`, {
        content: answer,
        field_type: field,
        profession: context.profession || 'Professional'
      });
      return {
        enhanced: response.data.result.enhanced_content,
        suggestions: response.data.result.improvements || [],
        quality_score: response.data.result.confidence * 100,
        improvements: response.data.result.improvements || [],
        field_specific_tips: response.data.result.improvements || []
      };
    } catch (error: any) {
      console.error('Error enhancing answer:', error);
      throw new Error(error.response?.data?.error || 'Failed to enhance answer');
    }
  }
}

// Create and export singleton instance
const prowriteTemplateQuestionService = new ProwriteTemplateQuestionService();
export default prowriteTemplateQuestionService;









