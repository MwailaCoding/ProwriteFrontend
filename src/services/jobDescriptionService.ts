import api from './api';

export interface JobDescriptionData {
  description?: string;
  url?: string;
}

export interface JobAnalysisResponse {
  message: string;
  keywords: string;
}

class JobDescriptionService {
  async analyzeJobDescription(data: JobDescriptionData): Promise<JobAnalysisResponse> {
    const response = await api.post('/api/job-descriptions/analyze', data);
    return response.data;
  }
}

export const jobDescriptionService = new JobDescriptionService();
export default jobDescriptionService;