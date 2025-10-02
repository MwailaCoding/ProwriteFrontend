import api from '../config/api';
import { CoverLetter } from '../types';

class CoverLetterService {
  async getCoverLetters(): Promise<CoverLetter[]> {
    const response = await api.get('/cover-letters');
    return response.data.data || [];
  }

  async getCoverLetter(id: number): Promise<CoverLetter> {
    const response = await api.get(`/cover-letters/${id}`);
    return response.data.data;
  }

  async generateCoverLetterFromResume(
    resumeId: number,
    company: string,
    position: string,
    templateId?: number
  ): Promise<{ cover_letter_id: number; content: string }> {
    const response = await api.post(`/api/resumes/${resumeId}/cover-letter`, {
      company,
      position,
      template_id: templateId
    });
    return response.data;
  }

  async updateCoverLetter(id: number, data: Partial<CoverLetter>): Promise<{ message: string }> {
    const response = await api.put(`/cover-letters/${id}`, data);
    return response.data;
  }

  async deleteCoverLetter(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/cover-letters/${id}`);
    return response.data;
  }

  async downloadCoverLetterById(id: number, format: 'pdf' | 'docx' = 'pdf'): Promise<Blob> {
    const response = await api.get(`/cover-letters/${id}/download`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  async getCollaborationReport(coverLetterId: number): Promise<any> {
    const response = await api.get(`/api/collaboration/report/${coverLetterId}`);
    return response.data;
  }

  // Phase 5: AI-Powered Insights & Machine Learning
  async generateAIInsights(userData: any): Promise<{
    success: boolean;
    insights: Array<{
      insight_id: string;
      insight_type: string;
      title: string;
      description: string;
      confidence_score: number;
      actionable: boolean;
    }>;
    total_insights: number;
  }> {
    const response = await api.post('/ai/insights/generate', { user_data: userData });
    return response.data;
  }

  async predictATSScore(coverLetterData: any): Promise<{
    success: boolean;
    prediction: {
      predicted_score: number;
      confidence: number;
      model_available: boolean;
      model_version?: string;
    };
  }> {
    const response = await api.post('/ai/predict/ats-score', { cover_letter_data: coverLetterData });
    return response.data;
  }

  async predictSuccessProbability(coverLetterData: any): Promise<{
    success: boolean;
    prediction: {
      success_probability: number;
      confidence: number;
      model_available: boolean;
      model_version?: string;
    };
  }> {
    const response = await api.post('/ai/predict/success-probability', { cover_letter_data: coverLetterData });
    return response.data;
  }

  async markInsightActioned(insightId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.post(`/api/ai/insights/${insightId}/action`);
    return response.data;
  }

  // AI Job Description Enhancement
  async enhanceJobDescription(data: {
    job_description: string;
    job_title: string;
    industry: string;
  }): Promise<{
    success: boolean;
    enhanced_description: string;
    message?: string;
  }> {
    const response = await api.post('/api/ai/enhance-job-description', data);
    return response.data;
  }

  // Template methods
  async getTemplates(): Promise<any[]> {
    const response = await api.get('/cover-letters/templates');
    return response.data.data || [];
  }

  async getTemplateDetails(templateId: number): Promise<any> {
    const response = await api.get(`/cover-letters/templates/${templateId}`);
    return response.data.data;
  }

  async getTemplateRecommendations(industry: string, roleLevel: string): Promise<any[]> {
    const response = await api.get('/cover-letters/templates/recommendations', {
      params: { industry, role_level: roleLevel }
    });
    return response.data.templates || [];
  }

  async applyTemplate(coverLetterId: number, templateId: number): Promise<any> {
    const response = await api.post(`/cover-letters/${coverLetterId}/apply-template`, {
      template_id: templateId
    });
    return response.data;
  }

  // Enhanced generate cover letter method
  async generateCoverLetter(data: {
    resume_id?: number | null;
    name: string;
    job_title: string;
    job_description: string;
    employer_name: string;
    employer_email: string;
    employer_address: string;
    company_name: string;
    personal_email: string;
    personal_phone: string;
    personal_address: string;
    template_id?: number;
    tone: string;
    industry: string;
    is_blank_cover_letter?: boolean;
  }): Promise<{
    success: boolean;
    cover_letter_content: string;
    message?: string;
  }> {
    const response = await api.post('/cover-letters/generate', data);
    return response.data;
  }

  // Create cover letter method
  async createCoverLetter(data: {
    title: string;
    content: string;
    job_title: string;
    company_name: string;
    employer_name: string;
    employer_email: string;
    employer_address: string;
    personal_name: string;
    personal_email: string;
    personal_phone: string;
    personal_address: string;
    template_id?: number;
    tone: string;
    industry: string;
  }): Promise<{
    success: boolean;
    cover_letter_id: number;
    message?: string;
  }> {
    const response = await api.post('/cover-letters', data);
    return response.data;
  }

  // Download cover letter with content
  async downloadCoverLetter(data: {
    content: string;
    job_title: string;
    company_name: string;
    employer_name: string;
    employer_email: string;
    employer_address: string;
    personal_name: string;
    personal_email: string;
    personal_phone: string;
    personal_address: string;
  }): Promise<Blob> {
    const response = await api.post('/cover-letters/download', data, {
      responseType: 'blob'
    });
    return response.data;
  }

  async generateAIReport(): Promise<any> {
    const response = await api.get('/ai/report');
    return response.data;
  }

  // Phase 6: Advanced Integrations & Mobile APIs
  async addIntegration(platformName: string, apiKey: string, apiSecret: string, baseUrl: string): Promise<{
    success: boolean;
    integration: {
      integration_id: string;
      platform_name: string;
      is_active: boolean;
      created_at: string;
    };
  }> {
    const response = await api.post('/integrations/add', {
      platform_name: platformName,
      api_key: apiKey,
      api_secret: apiSecret,
      base_url: baseUrl
    });
    return response.data;
  }

  async syncWithLinkedIn(integrationId: string, coverLetterData: any): Promise<{
    success: boolean;
    message: string;
    platform: string;
    sync_timestamp: string;
  }> {
    const response = await api.post(`/api/integrations/${integrationId}/sync/linkedin`, {
      cover_letter_data: coverLetterData
    });
    return response.data;
  }

  async syncWithIndeed(integrationId: string, coverLetterData: any): Promise<{
    success: boolean;
    message: string;
    platform: string;
    sync_timestamp: string;
  }> {
    const response = await api.post(`/api/integrations/${integrationId}/sync/indeed`, {
      cover_letter_data: coverLetterData
    });
    return response.data;
  }

  async syncWithGlassdoor(integrationId: string, coverLetterData: any): Promise<{
    success: boolean;
    message: string;
    platform: string;
    sync_timestamp: string;
  }> {
    const response = await api.post(`/api/integrations/${integrationId}/sync/glassdoor`, {
      cover_letter_data: coverLetterData
    });
    return response.data;
  }

  async registerMobileDevice(deviceType: string, deviceToken: string, appVersion: string = '1.0.0'): Promise<{
    success: boolean;
    device: {
      device_id: string;
      device_type: string;
      push_enabled: boolean;
      app_version: string;
    };
  }> {
    const response = await api.post('/mobile/device/register', {
      device_type: deviceType,
      device_token: deviceToken,
      app_version: appVersion
    });
    return response.data;
  }

  async sendPushNotification(title: string, message: string, data?: any): Promise<{
    success: boolean;
    total_devices: number;
    successful_sends: number;
    failed_sends: number;
    results: Array<{
      device_id: string;
      device_type: string;
      status: string;
      timestamp?: string;
      error?: string;
    }>;
  }> {
    const response = await api.post('/mobile/notifications/send', {
      title,
      message,
      data: data || {}
    });
    return response.data;
  }

  async logSecurityAudit(action: string, resource: string, success: boolean = true): Promise<{
    success: boolean;
    audit_id: string;
    risk_score: number;
  }> {
    const response = await api.post('/security/audit/log', {
      action,
      resource,
      success
    });
    return response.data;
  }

  async getSecurityAudits(startDate?: string, endDate?: string): Promise<{
    success: boolean;
    audits: Array<{
      audit_id: string;
      action: string;
      resource: string;
      ip_address: string;
      timestamp: string;
      success: boolean;
      risk_score: number;
    }>;
    total_audits: number;
  }> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/security/audits', { params });
    return response.data;
  }

  async generateIntegrationReport(): Promise<any> {
    const response = await api.get('/integrations/report');
    return response.data;
  }

  async exportDataForPlatform(platformName: string, dataType: string = 'cover_letters'): Promise<{
    success: boolean;
    platform: string;
    format: string;
    data_type: string;
    export_timestamp: string;
    data: any;
  }> {
    const response = await api.post('/integrations/export/' + platformName, {
      data_type: dataType
    });
    return response.data;
  }

  // Blank Cover Letter Methods
  async getBlankTemplates(): Promise<{ success: boolean; templates: any[] }> {
    const response = await api.get('/cover-letters/templates/blank');
    return response.data;
  }

  async createBlankCoverLetter(data: {
    title: string;
    content: string;
    job_title: string;
    company_name: string;
    employer_name?: string;
    employer_email?: string;
    employer_address?: string;
    personal_name?: string;
    personal_email?: string;
    personal_phone?: string;
    personal_address?: string;
    template_id?: string;
    tone?: string;
    industry?: string;
  }): Promise<{ success: boolean; message: string; cover_letter_id: number }> {
    const response = await api.post('/cover-letters/create-blank', data);
    return response.data;
  }
}

export const coverLetterService = new CoverLetterService();