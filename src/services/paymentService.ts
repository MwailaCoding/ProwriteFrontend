import api from '../config/api';
import { 
  Payment, 
  PaymentForm, 
  MpesaPaymentRequest, 
  MpesaPaymentResponse, 
  PaymentVerificationResponse,
  PaymentHistoryItem,
  PaymentStats
} from '../types';

class PaymentService {
  // M-Pesa Payment Methods
  async initiateMpesaPayment(paymentData: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  }

  async verifyMpesaPayment(checkoutRequestId: string): Promise<PaymentVerificationResponse> {
    const response = await api.get(`/payments/verify/${checkoutRequestId}`);
    return response.data;
  }

  async getMpesaCallbackStatus(checkoutRequestId: string): Promise<{ status: string }> {
    const response = await api.get(`/payments/status/${checkoutRequestId}`);
    return response.data;
  }

  // Legacy methods (kept for backward compatibility)
  async initiatePayment(paymentData: PaymentForm): Promise<{ payment_id: number; mpesa_code: string }> {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  }

  async getPaymentHistory(): Promise<PaymentHistoryItem[]> {
    const response = await api.get('/payments/history');
    return response.data;
  }

  async verifyPayment(paymentId: number): Promise<{ status: string; verified: boolean }> {
    const response = await api.get(`/payments/${paymentId}/verify`);
    return response.data;
  }

  async getPayment(paymentId: number): Promise<Payment> {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  }

  async downloadReceipt(paymentId: number): Promise<Blob> {
    const response = await api.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Admin methods
  async getPaymentStats(): Promise<PaymentStats> {
    const response = await api.get('/admin/stats');
    return response.data;
  }

  async getAdminPayments(page: number = 1, perPage: number = 20, filters?: {
    status?: string;
    paymentType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    payments: PaymentHistoryItem[];
    pagination: {
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...filters
    });
    
    const response = await api.get(`/admin/payments?${params}`);
    return response.data;
  }

  async exportPayments(): Promise<Blob> {
    const response = await api.get('/admin/payments/export', {
      responseType: 'blob'
    });
    return response.data;
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = 'KES'): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 9 && cleaned.startsWith('7')) {
      return `254${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `254${cleaned.slice(1)}`;
    }
    
    return phone; // Return original if can't format
  }

  validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 9 || cleaned.length === 12;
  }
}

export const paymentService = new PaymentService();