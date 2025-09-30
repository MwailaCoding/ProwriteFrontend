import api from '../config/api';

export interface RealJob {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  salary_range: string;
  currency: string;
  job_type: string;
  experience_level: string;
  skills_required: string[];
  description: string;
  posted_date: string;
  application_deadline: string;
  ai_match_score: number;
  market_demand: number;
  source: string;
  application_url: string;
  company_url: string;
  logo_url: string;
  relevance_score?: number;
}

export interface JobPlatform {
  name: string;
  url: string;
  description: string;
  api_available: boolean;
}

export interface RealJobSearchResponse {
  success: boolean;
  message: string;
  data: RealJob[];
}

export interface JobPlatformsResponse {
  success: boolean;
  message: string;
  data: JobPlatform[];
}

export class RealJobService {
  /**
   * Search for real jobs across multiple platforms
   */
  static async searchJobs(
    query: string,
    location?: string,
    experienceLevel?: string,
    jobType?: string,
    limit: number = 50
  ): Promise<RealJob[]> {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      if (location) params.append('location', location);
      if (experienceLevel) params.append('experience_level', experienceLevel);
      if (jobType) params.append('job_type', jobType);
      params.append('limit', limit.toString());

      const response = await api.get<RealJobSearchResponse>(`/real-jobs/search?${params.toString()}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Error searching jobs:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error searching real jobs:', error);
      return [];
    }
  }

  /**
   * Get available job platforms
   */
  static async getAvailablePlatforms(): Promise<JobPlatform[]> {
    try {
      const response = await api.get<JobPlatformsResponse>('/real-jobs/platforms');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Error getting platforms:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error getting job platforms:', error);
      return [];
    }
  }

  /**
   * Get trending job searches
   */
  static async getTrendingJobs(): Promise<RealJob[]> {
    try {
      const response = await api.get<RealJobSearchResponse>('/real-jobs/trending');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Error getting trending jobs:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error getting trending jobs:', error);
      return [];
    }
  }

  /**
   * Apply to a job (opens the application URL)
   */
  static applyToJob(job: RealJob): void {
    if (job.application_url) {
      window.open(job.application_url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Visit company website
   */
  static visitCompany(job: RealJob): void {
    if (job.company_url) {
      window.open(job.company_url, '_blank', 'noopener,noreferrer');
    } else if (job.company) {
      // Fallback to LinkedIn company search
      const companySearchUrl = `https://linkedin.com/company/${job.company.toLowerCase().replace(/\s+/g, '-')}`;
      window.open(companySearchUrl, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Get job source icon and color
   */
  static getJobSourceInfo(source: string): { icon: string; color: string; bgColor: string } {
    if (!source) {
      return {
        icon: '💼',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      };
    }
    
    switch (source.toLowerCase()) {
      case 'linkedin':
        return {
          icon: '💼',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'indeed':
        return {
          icon: '🔍',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50'
        };
      case 'glassdoor':
        return {
          icon: '🏢',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'ziprecruiter':
        return {
          icon: '📧',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        };
      default:
        return {
          icon: '💼',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  }

  /**
   * Format salary range for display
   */
  static formatSalary(salaryRange: string, currency: string = 'USD'): string {
    if (!salaryRange) return 'Salary not specified';
    
    // Clean up the salary range
    const cleanSalary = salaryRange.replace(/[^\d\-\s]/g, '').trim();
    
    if (cleanSalary.includes('-')) {
      const [min, max] = cleanSalary.split('-').map(s => s.trim());
      return `${currency} ${min}k - ${max}k`;
    } else {
      return `${currency} ${cleanSalary}k`;
    }
  }

  /**
   * Get experience level badge
   */
  static getExperienceBadge(level: string): { text: string; color: string } {
    if (!level) {
      return { text: 'Entry Level', color: 'bg-gray-100 text-gray-800' };
    }
    
    switch (level.toLowerCase()) {
      case 'entry':
        return { text: 'Entry Level', color: 'bg-green-100 text-green-800' };
      case 'mid':
        return { text: 'Mid Level', color: 'bg-blue-100 text-blue-800' };
      case 'senior':
        return { text: 'Senior', color: 'bg-purple-100 text-purple-800' };
      case 'executive':
        return { text: 'Executive', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Entry Level', color: 'bg-gray-100 text-gray-800' };
    }
  }

  /**
   * Get job type badge
   */
  static getJobTypeBadge(type: string): { text: string; color: string } {
    if (!type) {
      return { text: 'Full Time', color: 'bg-gray-100 text-gray-800' };
    }
    
    switch (type.toLowerCase()) {
      case 'full-time':
        return { text: 'Full Time', color: 'bg-green-100 text-green-800' };
      case 'part-time':
        return { text: 'Part Time', color: 'bg-blue-100 text-blue-800' };
      case 'contract':
        return { text: 'Contract', color: 'bg-orange-100 text-orange-800' };
      case 'remote':
        return { text: 'Remote', color: 'bg-purple-100 text-purple-800' };
      case 'hybrid':
        return { text: 'Hybrid', color: 'bg-teal-100 text-teal-800' };
      default:
        return { text: 'Full Time', color: 'bg-gray-100 text-gray-800' };
    }
  }

  /**
   * Calculate days since posted
   */
  static getDaysSincePosted(postedDate: string): number {
    if (!postedDate) return 0;
    
    try {
      const posted = new Date(postedDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - posted.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get posting time badge
   */
  static getPostingTimeBadge(days: number): { text: string; color: string } {
    if (days === 0) {
      return { text: 'Today', color: 'bg-green-100 text-green-800' };
    } else if (days === 1) {
      return { text: 'Yesterday', color: 'bg-green-100 text-green-800' };
    } else if (days <= 7) {
      return { text: `${days} days ago`, color: 'bg-blue-100 text-blue-800' };
    } else if (days <= 30) {
      return { text: `${days} days ago`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: `${days} days ago`, color: 'bg-gray-100 text-gray-800' };
    }
  }
}











