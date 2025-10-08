import api from '../config/api';
import { PDFTemplate, ResumeFormData } from '../types';

export interface PDFGenerationOptions {
  templateId: string;
  formData: ResumeFormData;
  outputFormat?: 'pdf' | 'png' | 'jpg';
  quality?: 'low' | 'medium' | 'high';
  includeMetadata?: boolean;
}

export interface PDFGenerationResult {
  downloadUrl: string;
  previewUrl?: string;
  fileSize: number;
  pageCount: number;
  generationTime: number;
}

export const pdfGenerationService = {
  /**
   * Generate a PDF with form data injected into the template
   */
  async generatePDF(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
    try {
      const response = await api.post('/resume/generate-pdf', options);
      return response.data;
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  },

  /**
   * Generate a preview image of the filled template
   */
  async generatePreview(options: PDFGenerationOptions): Promise<{ previewUrl: string }> {
    try {
      const response = await api.post('/resume/generate-preview', {
        ...options,
        outputFormat: 'png'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      throw new Error('Failed to generate preview. Please try again.');
    }
  },

  /**
   * Test template compatibility with form data
   */
  async testTemplateCompatibility(templateId: string, formData: ResumeFormData): Promise<{
    isCompatible: boolean;
    missingFields: string[];
    warnings: string[];
  }> {
    try {
      const response = await api.post('/resume/test-compatibility', {
        templateId,
        formData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to test compatibility:', error);
      throw new Error('Failed to test template compatibility.');
    }
  },

  /**
   * Get generation progress for long-running operations
   */
  async getGenerationProgress(generationId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message: string;
    result?: PDFGenerationResult;
  }> {
    try {
      const response = await api.get(`/resume/generation-progress/${generationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get generation progress:', error);
      throw new Error('Failed to get generation progress.');
    }
  },

  /**
   * Download generated PDF
   */
  async downloadPDF(downloadUrl: string): Promise<Blob> {
    try {
      const response = await api.get(downloadUrl, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw new Error('Failed to download PDF.');
    }
  },

  /**
   * Share generated PDF via email or link
   */
  async sharePDF(generationId: string, shareOptions: {
    method: 'email' | 'link';
    recipients?: string[];
    expiresAt?: string;
    password?: string;
  }): Promise<{
    shareUrl?: string;
    shareId: string;
    expiresAt: string;
  }> {
    try {
      const response = await api.post(`/resume/share-pdf/${generationId}`, shareOptions);
      return response.data;
    } catch (error) {
      console.error('Failed to share PDF:', error);
      throw new Error('Failed to share PDF.');
    }
  },

  /**
   * Get generation history for user
   */
  async getGenerationHistory(): Promise<{
    id: string;
    templateName: string;
    createdAt: string;
    status: string;
    downloadUrl?: string;
    fileSize?: number;
  }[]> {
    try {
      const response = await api.get('/resume/generation-history');
      return response.data;
    } catch (error) {
      console.error('Failed to get generation history:', error);
      throw new Error('Failed to get generation history.');
    }
  },

  /**
   * Delete generated PDF
   */
  async deleteGeneratedPDF(generationId: string): Promise<void> {
    try {
      await api.delete(`/resume/generated-pdf/${generationId}`);
    } catch (error) {
      console.error('Failed to delete generated PDF:', error);
      throw new Error('Failed to delete generated PDF.');
    }
  }
};




























