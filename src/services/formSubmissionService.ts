import api from '../config/api';

export interface FormSubmissionData {
  form_data: any;
  document_type: 'Francisca Resume' | 'Cover Letter';
  phone_number: string;
}

export interface FormSubmissionResponse {
  success: boolean;
  submission_id?: number;
  payment_id?: number;
  checkout_request_id?: string;
  amount?: number;
  document_type?: string;
  message?: string;
  error?: string;
}

export interface SubmissionStatus {
  success: boolean;
  submission_id: number;
  status: 'pending_payment' | 'paid' | 'pdf_generated' | 'email_sent' | 'completed';
  pdf_path?: string;
  email_sent?: boolean;
  created_at?: string;
  updated_at?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment_status?: 'pending' | 'completed' | 'failed';
  submission_status?: string;
  message?: string;
  error?: string;
}

export interface DownloadResponse {
  success: boolean;
  download_url?: string;
  filename?: string;
  message?: string;
  error?: string;
}

class FormSubmissionService {
  /**
   * Submit form with payment integration
   */
  async submitFormWithPayment(data: FormSubmissionData): Promise<FormSubmissionResponse> {
    try {
      const response = await api.post('/forms/submit-with-payment', data);
      return response.data;
    } catch (error: any) {
      console.error('Form submission error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Form submission failed'
      };
    }
  }

  /**
   * Check payment status for a form submission
   */
  async checkPaymentStatus(submissionId: number, checkoutRequestId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await api.post('/forms/payment-status', {
        submission_id: submissionId,
        checkout_request_id: checkoutRequestId
      });
      return response.data;
    } catch (error: any) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment status check failed'
      };
    }
  }

  /**
   * Check submission status (auto-processes paid submissions)
   */
  async checkSubmissionStatus(submissionId: number): Promise<SubmissionStatus> {
    try {
      const response = await api.post('/forms/check-status', {
        submission_id: submissionId
      });
      return response.data;
    } catch (error: any) {
      console.error('Status check error:', error);
      return {
        success: false,
        submission_id: submissionId,
        status: 'pending_payment',
        error: error.response?.data?.message || error.message || 'Status check failed'
      };
    }
  }

  /**
   * Process payment and generate PDF
   */
  async processPaymentAndGenerate(submissionId: number): Promise<FormSubmissionResponse> {
    try {
      const response = await api.post('/forms/process-payment', {
        submission_id: submissionId
      });
      return response.data;
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment processing failed'
      };
    }
  }

  /**
   * Get download URL for completed PDF
   */
  async getDownloadUrl(submissionId: number): Promise<DownloadResponse> {
    try {
      const response = await api.post('/forms/download-pdf', {
        submission_id: submissionId
      });
      return response.data;
    } catch (error: any) {
      console.error('Download URL error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Download failed'
      };
    }
  }

  /**
   * Get user's form submissions
   */
  async getUserSubmissions(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const response = await api.get('/forms/submissions');
      return response.data;
    } catch (error: any) {
      console.error('Get submissions error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get submissions'
      };
    }
  }

  /**
   * Poll submission status until completion
   */
  async pollSubmissionStatus(
    submissionId: number, 
    onStatusUpdate: (status: SubmissionStatus) => void,
    maxAttempts: number = 24, // 2 minutes with 5-second intervals
    intervalMs: number = 5000
  ): Promise<SubmissionStatus> {
    let attempts = 0;
    
    const poll = async (): Promise<SubmissionStatus> => {
      attempts++;
      
      try {
        const status = await this.checkSubmissionStatus(submissionId);
        onStatusUpdate(status);
        
        // Check if completed or failed
        if (status.status === 'completed' || status.status === 'email_sent' || attempts >= maxAttempts) {
          return status;
        }
        
        // Continue polling
        if (status.status === 'paid' || status.status === 'pdf_generated') {
          setTimeout(poll, intervalMs);
        }
        
        return status;
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts >= maxAttempts) {
          return {
            success: false,
            submission_id: submissionId,
            status: 'pending_payment',
            error: 'Polling timeout'
          };
        }
        setTimeout(poll, intervalMs);
        return {
          success: false,
          submission_id: submissionId,
          status: 'pending_payment',
          error: 'Polling error'
        };
      }
    };
    
    return poll();
  }

  /**
   * Get pricing for document types
   */
  getPricing(documentType: 'Francisca Resume' | 'Cover Letter'): number {
    return documentType === 'Francisca Resume' ? 500 : 300;
  }

  /**
   * Format document type for display
   */
  formatDocumentType(documentType: string): string {
    return documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

export const formSubmissionService = new FormSubmissionService();

