import api from '../config/api';
import { PDFTemplate, ResumeFormData } from '../types';

export interface AdvancedPDFOptions {
  templateId: string;
  formData: ResumeFormData;
  outputFormat: 'pdf' | 'docx' | 'html' | 'txt';
  quality: 'low' | 'medium' | 'high' | 'print';
  optimization: {
    compress: boolean;
    removeMetadata: boolean;
    optimizeImages: boolean;
    passwordProtect: boolean;
    password?: string;
  };
  styling: {
    fontOverride?: string;
    colorScheme?: 'default' | 'professional' | 'creative' | 'minimal';
    pageSize?: 'a4' | 'letter' | 'legal' | 'custom';
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
  };
}

export interface AdvancedPDFResult {
  id: string;
  downloadUrl: string;
  previewUrl?: string;
  fileSize: number;
  pageCount: number;
  generationTime: number;
  format: string;
  quality: string;
  checksum: string;
  expiresAt?: string;
}

export interface BatchGenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  results: AdvancedPDFResult[];
  createdAt: string;
  estimatedCompletion?: string;
}

export const advancedPDFService = {
  /**
   * Generate optimized PDF with advanced options
   */
  async generateAdvancedPDF(options: AdvancedPDFOptions): Promise<AdvancedPDFResult> {
    try {
      const response = await api.post('/resume/generate-advanced-pdf', options);
      return response.data;
    } catch (error) {
      console.error('Failed to generate advanced PDF:', error);
      throw new Error('Failed to generate advanced PDF. Please try again.');
    }
  },

  /**
   * Generate multiple formats simultaneously
   */
  async generateMultipleFormats(
    templateId: string,
    formData: ResumeFormData,
    formats: ('pdf' | 'docx' | 'html' | 'txt')[]
  ): Promise<AdvancedPDFResult[]> {
    try {
      const response = await api.post('/resume/generate-multiple-formats', {
        templateId,
        formData,
        formats
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate multiple formats:', error);
      throw new Error('Failed to generate multiple formats.');
    }
  },

  /**
   * Start batch generation job
   */
  async startBatchGeneration(
    jobs: Array<{ templateId: string; formData: ResumeFormData; options?: Partial<AdvancedPDFOptions> }>
  ): Promise<BatchGenerationJob> {
    try {
      const response = await api.post('/resume/batch-generation', { jobs });
      return response.data;
    } catch (error) {
      console.error('Failed to start batch generation:', error);
      throw new Error('Failed to start batch generation.');
    }
  },

  /**
   * Get batch generation progress
   */
  async getBatchProgress(jobId: string): Promise<BatchGenerationJob> {
    try {
      const response = await api.get(`/resume/batch-generation/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get batch progress:', error);
      throw new Error('Failed to get batch progress.');
    }
  },

  /**
   * Cancel batch generation job
   */
  async cancelBatchGeneration(jobId: string): Promise<void> {
    try {
      await api.delete(`/resume/batch-generation/${jobId}`);
    } catch (error) {
      console.error('Failed to cancel batch generation:', error);
      throw new Error('Failed to cancel batch generation.');
    }
  },

  /**
   * Optimize existing PDF
   */
  async optimizePDF(
    pdfUrl: string,
    optimizationOptions: {
      compress: boolean;
      removeMetadata: boolean;
      optimizeImages: boolean;
      quality: 'low' | 'medium' | 'high';
    }
  ): Promise<{ optimizedUrl: string; originalSize: number; optimizedSize: number; compressionRatio: number }> {
    try {
      const response = await api.post('/resume/optimize-pdf', {
        pdfUrl,
        ...optimizationOptions
      });
      return response.data;
    } catch (error) {
      console.error('Failed to optimize PDF:', error);
      throw new Error('Failed to optimize PDF.');
    }
  },

  /**
   * Convert PDF to other formats
   */
  async convertPDF(
    pdfUrl: string,
    targetFormat: 'docx' | 'html' | 'txt' | 'rtf'
  ): Promise<{ convertedUrl: string; format: string; fileSize: number }> {
    try {
      const response = await api.post('/resume/convert-pdf', {
        pdfUrl,
        targetFormat
      });
      return response.data;
    } catch (error) {
      console.error('Failed to convert PDF:', error);
      throw new Error('Failed to convert PDF.');
    }
  },

  /**
   * Add digital signature to PDF
   */
  async signPDF(
    pdfUrl: string,
    signatureOptions: {
      certificate: string;
      reason: string;
      location: string;
      contactInfo: string;
    }
  ): Promise<{ signedUrl: string; signatureInfo: any }> {
    try {
      const response = await api.post('/resume/sign-pdf', {
        pdfUrl,
        ...signatureOptions
      });
      return response.data;
    } catch (error) {
      console.error('Failed to sign PDF:', error);
      throw new Error('Failed to sign PDF.');
    }
  },

  /**
   * Get PDF analytics and insights
   */
  async getPDFAnalytics(pdfId: string): Promise<{
    views: number;
    downloads: number;
    shares: number;
    averageViewTime: number;
    popularSections: string[];
    deviceTypes: { [key: string]: number };
    geographicData: { [key: string]: number };
  }> {
    try {
      const response = await api.get(`/resume/pdf-analytics/${pdfId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get PDF analytics:', error);
      throw new Error('Failed to get PDF analytics.');
    }
  },

  /**
   * Create shareable link with advanced options
   */
  async createShareableLink(
    pdfId: string,
    options: {
      expiresAt?: string;
      password?: string;
      allowDownload: boolean;
      allowPrint: boolean;
      maxViews?: number;
      watermark?: boolean;
      watermarkText?: string;
    }
  ): Promise<{
    shareUrl: string;
    shareId: string;
    expiresAt: string;
    accessCount: number;
    maxViews?: number;
  }> {
    try {
      const response = await api.post(`/resume/share-pdf/${pdfId}`, options);
      return response.data;
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      throw new Error('Failed to create shareable link.');
    }
  },

  /**
   * Get generation templates and presets
   */
  async getGenerationPresets(): Promise<{
    professional: Partial<AdvancedPDFOptions>;
    creative: Partial<AdvancedPDFOptions>;
    minimal: Partial<AdvancedPDFOptions>;
    print: Partial<AdvancedPDFOptions>;
    web: Partial<AdvancedPDFOptions>;
  }> {
    try {
      const response = await api.get('/resume/generation-presets');
      return response.data;
    } catch (error) {
      console.error('Failed to get generation presets:', error);
      throw new Error('Failed to get generation presets.');
    }
  },

  /**
   * Save custom generation preset
   */
  async saveCustomPreset(
    name: string,
    options: Partial<AdvancedPDFOptions>
  ): Promise<{ presetId: string; name: string; options: Partial<AdvancedPDFOptions> }> {
    try {
      const response = await api.post('/resume/custom-presets', {
        name,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save custom preset:', error);
      throw new Error('Failed to save custom preset.');
    }
  },

  /**
   * Get user's custom presets
   */
  async getCustomPresets(): Promise<Array<{
    presetId: string;
    name: string;
    options: Partial<AdvancedPDFOptions>;
    createdAt: string;
    usageCount: number;
  }>> {
    try {
      const response = await api.get('/resume/custom-presets');
      return response.data;
    } catch (error) {
      console.error('Failed to get custom presets:', error);
      throw new Error('Failed to get custom presets.');
    }
  }
};
