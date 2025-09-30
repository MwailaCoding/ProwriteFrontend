import api from '../config/api';

export interface AIMarketInsight {
  id: string;
  skill: string;
  industry: string;
  demand_percentage: number;
  trend: 'up' | 'down' | 'stable';
  region: string;
  ai_analysis: {
    market_sentiment: 'positive' | 'negative' | 'neutral';
    growth_prediction: number;
    salary_range: string;
    skill_evolution: string;
    market_opportunities: string[];
    risk_factors: string[];
    learning_path: string[];
    certification_recommendations: string[];
  };
  timestamp: string;
}

export interface AIIndustryAnalysis {
  industry: string;
  growth_rate: number;
  top_skills: string[];
  emerging_roles: string[];
  market_trends: string[];
  salary_trends: string;
  ai_insights: string;
}

export interface AISkillPrediction {
  skill: string;
  current_demand: number;
  predicted_demand_6months: number;
  predicted_demand_1year: number;
  confidence_level: number;
  factors: string[];
}

class AIMarketService {
  async getAIMarketData(region: string = 'Nairobi', industry?: string): Promise<AIMarketInsight[]> {
    try {
      const params = new URLSearchParams();
      params.append('region', region);
      if (industry && industry !== 'all') {
        params.append('industry', industry);
      }
      
      const response = await api.get(`/ai/market-data?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI market data:', error);
      // Return mock data for development
      return this.getMockAIMarketData(region, industry);
    }
  }

  async getAITopSkills(region: string = 'Nairobi'): Promise<AIMarketInsight[]> {
    try {
      const response = await api.get(`/ai/top-skills?region=${region}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI top skills:', error);
      return this.getMockAITopSkills(region);
    }
  }

  async getAITrendingSkills(region: string = 'Nairobi'): Promise<AIMarketInsight[]> {
    try {
      const response = await api.get(`/ai/trending-skills?region=${region}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI trending skills:', error);
      return this.getMockAITrendingSkills(region);
    }
  }

  async getAIIndustryAnalysis(region: string = 'Nairobi'): Promise<AIIndustryAnalysis[]> {
    try {
      const response = await api.get(`/ai/industry-analysis?region=${region}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI industry analysis:', error);
      return this.getMockIndustryAnalysis(region);
    }
  }

  async getAISkillPredictions(region: string = 'Nairobi'): Promise<AISkillPrediction[]> {
    try {
      const response = await api.get(`/ai/skill-predictions?region=${region}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI skill predictions:', error);
      return this.getMockSkillPredictions(region);
    }
  }

  async analyzeSkillWithAI(skill: string, region: string = 'Nairobi'): Promise<AIMarketInsight> {
    try {
      const response = await api.post('/ai/analyze-skill', {
        skill,
        region
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing skill with AI:', error);
      return this.getMockSkillAnalysis(skill, region);
    }
  }

  // Mock data for development
  private getMockAIMarketData(region: string, industry?: string): AIMarketInsight[] {
    const skills = [
      'React.js', 'Python', 'Data Analysis', 'Machine Learning', 'DevOps',
      'UI/UX Design', 'Project Management', 'Digital Marketing', 'Sales',
      'Customer Service', 'Content Writing', 'Graphic Design', 'SEO',
      'Social Media Marketing', 'Business Analysis', 'Agile', 'Scrum'
    ];

    const industries = [
      'technology', 'healthcare', 'finance', 'marketing', 'education',
      'consulting', 'retail', 'manufacturing', 'logistics'
    ];

    return skills.map((skill, index) => ({
      id: `ai-${index + 1}`,
      skill,
      industry: industry || industries[Math.floor(Math.random() * industries.length)],
      demand_percentage: Math.floor(Math.random() * 40) + 60,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      region,
      ai_analysis: {
        market_sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as 'positive' | 'negative' | 'neutral',
        growth_prediction: Math.floor(Math.random() * 30) + 10,
        salary_range: `$${Math.floor(Math.random() * 50) + 30}k - $${Math.floor(Math.random() * 100) + 80}k`,
        skill_evolution: 'This skill is evolving rapidly with new frameworks and methodologies emerging.',
        market_opportunities: [
          'Remote work opportunities increasing',
          'High demand in startup ecosystem',
          'Growing need in enterprise companies'
        ],
        risk_factors: [
          'Automation may impact entry-level positions',
          'Rapid technology changes require continuous learning'
        ],
        learning_path: [
          'Start with fundamentals',
          'Practice with real projects',
          'Get certified',
          'Build portfolio'
        ],
        certification_recommendations: [
          'AWS Certified Solutions Architect',
          'Google Cloud Professional',
          'Microsoft Azure Developer'
        ]
      },
      timestamp: new Date().toISOString()
    }));
  }

  private getMockAITopSkills(region: string): AIMarketInsight[] {
    const topSkills = [
      'React.js', 'Python', 'Data Analysis', 'Machine Learning', 'DevOps',
      'UI/UX Design', 'Project Management', 'Digital Marketing', 'Sales'
    ];

    return topSkills.map((skill, index) => ({
      id: `top-${index + 1}`,
      skill,
      industry: ['technology', 'healthcare', 'finance', 'marketing'][Math.floor(Math.random() * 4)],
      demand_percentage: 85 - (index * 5),
      trend: 'up' as const,
      region,
      ai_analysis: {
        market_sentiment: 'positive' as const,
        growth_prediction: Math.floor(Math.random() * 30) + 15,
        salary_range: `$${Math.floor(Math.random() * 50) + 40}k - $${Math.floor(Math.random() * 100) + 90}k`,
        skill_evolution: 'High growth potential with increasing market adoption.',
        market_opportunities: [
          'High demand across multiple industries',
          'Remote work friendly',
          'Excellent career progression'
        ],
        risk_factors: [
          'Competitive market',
          'Requires continuous upskilling'
        ],
        learning_path: [
          'Master fundamentals',
          'Build practical projects',
          'Network with professionals',
          'Stay updated with trends'
        ],
        certification_recommendations: [
          'Industry-recognized certifications',
          'Specialized training programs'
        ]
      },
      timestamp: new Date().toISOString()
    }));
  }

  private getMockAITrendingSkills(region: string): AIMarketInsight[] {
    const trendingSkills = [
      'AI/ML', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'Data Science',
      'DevOps', 'React.js', 'Python', 'Kubernetes', 'Docker'
    ];

    return trendingSkills.map((skill, index) => ({
      id: `trending-${index + 1}`,
      skill,
      industry: ['technology', 'finance', 'healthcare'][Math.floor(Math.random() * 3)],
      demand_percentage: Math.floor(Math.random() * 20) + 80,
      trend: 'up' as const,
      region,
      ai_analysis: {
        market_sentiment: 'positive' as const,
        growth_prediction: Math.floor(Math.random() * 40) + 20,
        salary_range: `$${Math.floor(Math.random() * 60) + 50}k - $${Math.floor(Math.random() * 120) + 100}k`,
        skill_evolution: 'Rapidly evolving with high market demand.',
        market_opportunities: [
          'Explosive growth in demand',
          'High salary potential',
          'Future-proof career'
        ],
        risk_factors: [
          'Fast-changing technology landscape',
          'High learning curve'
        ],
        learning_path: [
          'Start with basics',
          'Hands-on practice',
          'Advanced courses',
          'Real-world projects'
        ],
        certification_recommendations: [
          'Advanced certifications',
          'Specialized training',
          'Industry workshops'
        ]
      },
      timestamp: new Date().toISOString()
    }));
  }

  private getMockIndustryAnalysis(region: string): AIIndustryAnalysis[] {
    const industries = [
      'Technology', 'Healthcare', 'Finance', 'Marketing', 'Education',
      'Consulting', 'Retail', 'Manufacturing'
    ];

    return industries.map((industry, index) => ({
      industry,
      growth_rate: Math.floor(Math.random() * 30) + 10,
      top_skills: [
        'Leadership', 'Communication', 'Problem Solving',
        'Technical Skills', 'Analytical Thinking'
      ],
      emerging_roles: [
        'AI Specialist', 'Data Scientist', 'DevOps Engineer',
        'Product Manager', 'UX Designer'
      ],
      market_trends: [
        'Digital transformation accelerating',
        'Remote work becoming standard',
        'AI integration increasing'
      ],
      salary_trends: 'Salaries increasing by 5-15% annually',
      ai_insights: 'This industry is experiencing significant digital transformation with high demand for technical and soft skills.'
    }));
  }

  private getMockSkillPredictions(region: string): AISkillPrediction[] {
    const skills = [
      'React.js', 'Python', 'Machine Learning', 'DevOps', 'Data Science',
      'Cybersecurity', 'Cloud Computing', 'Blockchain', 'AI/ML', 'Kubernetes'
    ];

    return skills.map((skill, index) => ({
      skill,
      current_demand: Math.floor(Math.random() * 40) + 60,
      predicted_demand_6months: Math.floor(Math.random() * 50) + 70,
      predicted_demand_1year: Math.floor(Math.random() * 60) + 80,
      confidence_level: Math.floor(Math.random() * 20) + 80,
      factors: [
        'Market adoption rate',
        'Technology evolution',
        'Industry demand',
        'Geographic factors'
      ]
    }));
  }

  private getMockSkillAnalysis(skill: string, region: string): AIMarketInsight {
    return {
      id: `analysis-${Date.now()}`,
      skill,
      industry: 'technology',
      demand_percentage: Math.floor(Math.random() * 40) + 60,
      trend: 'up' as const,
      region,
      ai_analysis: {
        market_sentiment: 'positive' as const,
        growth_prediction: Math.floor(Math.random() * 30) + 15,
        salary_range: `$${Math.floor(Math.random() * 50) + 40}k - $${Math.floor(Math.random() * 100) + 90}k`,
        skill_evolution: 'This skill is in high demand and expected to grow significantly.',
        market_opportunities: [
          'High demand across industries',
          'Remote work opportunities',
          'Excellent career growth'
        ],
        risk_factors: [
          'Competitive market',
          'Continuous learning required'
        ],
        learning_path: [
          'Start with fundamentals',
          'Practice with projects',
          'Get certified',
          'Build portfolio'
        ],
        certification_recommendations: [
          'Industry certifications',
          'Specialized training'
        ]
      },
      timestamp: new Date().toISOString()
    };
  }
}

export const aiMarketService = new AIMarketService();











