/**
 * M-Pesa Integration Service
 * Handles all M-Pesa payment operations and callbacks
 */

import api from '../config/api';

export interface MpesaPaymentRequest {
  phone_number: string;
  amount: number;
  account_reference: string;
  transaction_desc: string;
  callback_url?: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  checkout_request_id?: string;
  merchant_request_id?: string;
  response_code?: string;
  response_description?: string;
  customer_message?: string;
  error?: string;
}

export interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface MpesaPaymentStatus {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  checkout_request_id?: string;
  merchant_request_id?: string;
  amount?: number;
  mpesa_receipt_number?: string;
  transaction_date?: string;
  phone_number?: string;
  error?: string;
}

export interface MpesaFormSubmission {
  submission_id: number;
  form_data: any;
  document_type: 'Prowrite Template Resume' | 'Cover Letter';
  amount: number;
  phone_number: string;
  status: 'pending_payment' | 'paid' | 'pdf_generated' | 'email_sent' | 'completed';
  checkout_request_id?: string;
  merchant_request_id?: string;
  mpesa_receipt_number?: string;
  pdf_path?: string;
  email_sent?: boolean;
  created_at: string;
  updated_at: string;
}

class MpesaService {
  private readonly PRICING = {
    'Prowrite Template Resume': 500,
    'Cover Letter': 300
  };

  /**
   * Initiate M-Pesa STK Push payment
   */
  async initiatePayment(paymentData: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    try {
      const response = await api.post('/payments/mpesa/initiate', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('M-Pesa payment initiation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment initiation failed'
      };
    }
  }

  /**
   * Submit form with M-Pesa payment
   */
  async submitFormWithPayment(data: {
    form_data: any;
    document_type: 'Prowrite Template Resume' | 'Cover Letter';
    phone_number: string;
  }): Promise<{
    success: boolean;
    submission_id?: number;
    checkout_request_id?: string;
    amount?: number;
    error?: string;
  }> {
    try {
      const response = await api.post('/forms/submit-with-payment', data);
      return response.data;
    } catch (error: any) {
      console.error('Form submission with payment error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Form submission failed'
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(checkoutRequestId: string): Promise<MpesaPaymentStatus> {
    try {
      const response = await api.get(`/payments/mpesa/status/${checkoutRequestId}`);
      return response.data;
    } catch (error: any) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        status: 'pending',
        error: error.response?.data?.message || error.message || 'Status check failed'
      };
    }
  }

  /**
   * Check form submission status
   */
  async checkSubmissionStatus(submissionId: number): Promise<{
    success: boolean;
    submission?: MpesaFormSubmission;
    error?: string;
  }> {
    try {
      const response = await api.get(`/forms/submissions/${submissionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Submission status check error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Status check failed'
      };
    }
  }

  /**
   * Get user's form submissions
   */
  async getUserSubmissions(): Promise<{
    success: boolean;
    submissions?: MpesaFormSubmission[];
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
   * Download PDF for completed submission
   */
  async downloadPDF(submissionId: number): Promise<{
    success: boolean;
    download_url?: string;
    filename?: string;
    error?: string;
  }> {
    try {
      const response = await api.post('/forms/download-pdf', {
        submission_id: submissionId
      });
      return response.data;
    } catch (error: any) {
      console.error('PDF download error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Download failed'
      };
    }
  }

  /**
   * Process M-Pesa callback (for testing)
   */
  async processCallback(callbackData: MpesaCallbackData): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await api.post('/payments/mpesa/callback', callbackData);
      return response.data;
    } catch (error: any) {
      console.error('Callback processing error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Callback processing failed'
      };
    }
  }

  /**
   * Get pricing for document type
   */
  getPricing(documentType: 'Prowrite Template Resume' | 'Cover Letter'): number {
    return this.PRICING[documentType];
  }

  /**
   * Format phone number for M-Pesa
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 9 && cleaned.startsWith('7')) {
      return `254${cleaned}`;
    } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `254${cleaned.slice(1)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return cleaned;
    }
    
    return phone;
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 9 || cleaned.length === 12;
  }

  /**
   * Format document type for display
   */
  formatDocumentType(documentType: string): string {
    return documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Poll submission status until completion
   */
  async pollSubmissionStatus(
    submissionId: number,
    onStatusUpdate: (submission: MpesaFormSubmission) => void,
    maxAttempts: number = 40, // 2 minutes with 3-second intervals
    intervalMs: number = 3000
  ): Promise<MpesaFormSubmission | null> {
    let attempts = 0;
    
    const poll = async (): Promise<MpesaFormSubmission | null> => {
      attempts++;
      
      try {
        const response = await this.checkSubmissionStatus(submissionId);
        
        if (response.success && response.submission) {
          onStatusUpdate(response.submission);
          
          // Check if completed
          if (response.submission.status === 'completed' || 
              response.submission.status === 'email_sent' || 
              attempts >= maxAttempts) {
            return response.submission;
          }
          
          // Continue polling if still processing
          if (response.submission.status === 'paid' || 
              response.submission.status === 'pdf_generated') {
            setTimeout(poll, intervalMs);
          }
          
          return response.submission;
        }
        
        if (attempts >= maxAttempts) {
          return null;
        }
        
        setTimeout(poll, intervalMs);
        return null;
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts >= maxAttempts) {
          return null;
        }
        setTimeout(poll, intervalMs);
        return null;
      }
    };
    
    return poll();
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<{
    success: boolean;
    payments?: MpesaFormSubmission[];
    error?: string;
  }> {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error: any) {
      console.error('Payment history error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get payment history'
      };
    }
  }

  /**
   * Test M-Pesa callback URL
   */
  async testCallbackUrl(callbackUrl: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const testData: MpesaCallbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: "test-merchant-request-id",
            CheckoutRequestID: "test-checkout-request-id",
            ResultCode: 0,
            ResultDesc: "The service request is processed successfully.",
            CallbackMetadata: {
              Item: [
                { Name: "Amount", Value: 500 },
                { Name: "MpesaReceiptNumber", Value: "TEST123456" },
                { Name: "TransactionDate", Value: 20231201120000 },
                { Name: "PhoneNumber", Value: 254708374149 }
              ]
            }
          }
        }
      };

      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Callback URL is working correctly'
        };
      } else {
        return {
          success: false,
          error: `Callback URL returned status: ${response.status}`
        };
      }
    } catch (error: any) {
      console.error('Callback URL test error:', error);
      return {
        success: false,
        error: error.message || 'Callback URL test failed'
      };
    }
  }
}

export const mpesaService = new MpesaService();
export default mpesaService;

