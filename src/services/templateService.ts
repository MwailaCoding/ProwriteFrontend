import api from './api';

export interface Template {
  template_id: number;
  name: string;
  description: string;
  category: string;
  industry: string;
  file_path: string;
  is_premium: boolean;
  price: number;
  is_active: boolean;
  created_at: string;
  thumbnail_url?: string;
  category_name?: string;
}

export interface TemplateSection {
  section_id: number;
  template_id: number;
  section_type: string;
  section_name: string;
  display_order: number;
  content?: string; // Template content
}

export interface TemplateWithSections extends Template {
  sections: TemplateSection[];
}

class TemplateService {
  async getTemplates(): Promise<Template[]> {
    const response = await api.get('/api/templates');
    return response.data;
  }

  async getTemplate(templateId: number): Promise<TemplateWithSections> {
    const response = await api.get(`/api/templates/${templateId}`);
    return response.data;
  }

  async createTemplate(
    formData: FormData
  ): Promise<{ message: string; template_id: number }> {
    const response = await api.post('/api/templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateTemplate(
    templateId: number,
    data: Partial<Template>
  ): Promise<{ message: string }> {
    const response = await api.put(`/api/admin/templates/${templateId}`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    return response.data;
  }

  async deleteTemplate(templateId: number): Promise<{ message: string }> {
    const response = await api.delete(`/api/admin/templates/${templateId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    return response.data;
  }
}

export const templateService = new TemplateService();
export default templateService;