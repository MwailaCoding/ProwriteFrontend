import OpenAI from 'openai';

// Initialize AI client with single API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export interface AIAnalysisResult {
  score: number;
  suggestions: string[];
  keywords: string[];
  improvements: string[];
  confidence: number;
  reasoning: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  category: 'trend' | 'salary' | 'demand' | 'skill' | 'industry';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  source: string;
  timestamp: string;
  data: any;
}

export interface ATSOptimizationResult {
  score: number;
  keywordMatch: number;
  formattingScore: number;
  contentScore: number;
  suggestions: string[];
  missingKeywords: string[];
  foundKeywords: string[];
  industryTrends: string[];
  optimizationTips: string[];
}

class AIService {
  private async callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
    try {
      // Check if API key is configured
      if (!import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_AI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('No AI API key configured');
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('AI service temporarily unavailable');
    }
  }

  private async callAI(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('AI service temporarily unavailable');
    }
  }

  // REAL ATS Analysis using AI
  async analyzeATSCompatibility(
    resumeContent: string, 
    jobTitle: string, 
    industry: string
  ): Promise<ATSOptimizationResult> {
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimization specialist. Analyze the resume content for ATS compatibility and provide detailed feedback.`;
    
    const prompt = `
    Resume Content: ${resumeContent}
    Target Job Title: ${jobTitle}
    Industry: ${industry}
    
    Please analyze this resume for ATS compatibility and provide:
    1. ATS Score (0-100)
    2. Keyword Match Percentage
    3. Formatting Score (0-100)
    4. Content Quality Score (0-100)
    5. List of found keywords
    6. List of missing important keywords
    7. Specific optimization suggestions
    8. Industry-specific trends to consider
    
    Format your response as JSON with these exact keys:
    {
      "score": number,
      "keywordMatch": number,
      "formattingScore": number,
      "contentScore": number,
      "suggestions": [string],
      "missingKeywords": [string],
      "foundKeywords": [string],
      "industryTrends": [string],
      "optimizationTips": [string]
    }
    `;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const result = JSON.parse(response);
      
      return {
        score: result.score || 0,
        keywordMatch: result.keywordMatch || 0,
        formattingScore: result.formattingScore || 0,
        contentScore: result.contentScore || 0,
        suggestions: result.suggestions || [],
        missingKeywords: result.missingKeywords || [],
        foundKeywords: result.foundKeywords || [],
        industryTrends: result.industryTrends || [],
        optimizationTips: result.optimizationTips || []
      };
    } catch (error) {
      console.error('ATS Analysis Error:', error);
      throw new Error('Failed to analyze ATS compatibility');
    }
  }

  // REAL Market Insights using AI
  async getMarketInsights(
    industry: string, 
    jobTitle: string, 
    location: string
  ): Promise<MarketInsight[]> {
    const systemPrompt = `You are a market research analyst specializing in job market trends and industry insights. Provide real, actionable market intelligence.`;
    
    const prompt = `
    Industry: ${industry}
    Job Title: ${jobTitle}
    Location: ${location}
    
    Provide current market insights including:
    1. Industry trends and emerging technologies
    2. Salary trends and compensation data
    3. Job market demand analysis
    4. Required skills and competencies
    5. Industry-specific developments
    
    For each insight, provide:
    - Title
    - Description
    - Category (trend/salary/demand/skill/industry)
    - Impact level (high/medium/low)
    - Confidence score (0-1)
    - Data source
    - Specific data points
    
    Format as JSON array with these exact keys:
    [
      {
        "id": "unique_id",
        "title": "string",
        "description": "string",
        "category": "trend|salary|demand|skill|industry",
        "impact": "high|medium|low",
        "confidence": number,
        "source": "string",
        "timestamp": "ISO string",
        "data": {}
      }
    ]
    `;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const insights = JSON.parse(response);
      
      return insights.map((insight: any) => ({
        id: insight.id || `insight_${Date.now()}`,
        title: insight.title || '',
        description: insight.description || '',
        category: insight.category || 'trend',
        impact: insight.impact || 'medium',
        confidence: insight.confidence || 0.8,
        source: insight.source || 'AI Analysis',
        timestamp: insight.timestamp || new Date().toISOString(),
        data: insight.data || {}
      }));
    } catch (error) {
      console.error('Market Insights Error:', error);
      throw new Error('Failed to fetch market insights');
    }
  }

  // REAL Content Enhancement using AI
  async enhanceContent(
    content: string, 
    fieldType: string, 
    industry: string
  ): Promise<{
    enhancedContent: string;
    suggestions: string[];
    improvements: string[];
    confidence: number;
  }> {
    const systemPrompt = `You are an expert resume writer and career coach. Enhance the provided content to be more impactful and industry-relevant.`;
    
    const prompt = `
    Content to enhance: ${content}
    Field Type: ${fieldType}
    Industry: ${industry}
    
    Please enhance this content by:
    1. Making it more action-oriented
    2. Adding quantifiable achievements where possible
    3. Using industry-specific keywords
    4. Improving clarity and impact
    5. Following best practices for the field type
    
    Provide:
    1. Enhanced content
    2. List of specific improvements made
    3. Additional suggestions
    4. Confidence score (0-1)
    
    Format as JSON:
    {
      "enhancedContent": "string",
      "suggestions": [string],
      "improvements": [string],
      "confidence": number
    }
    `;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const result = JSON.parse(response);
      
      return {
        enhancedContent: result.enhancedContent || content,
        suggestions: result.suggestions || [],
        improvements: result.improvements || [],
        confidence: result.confidence || 0.8
      };
    } catch (error) {
      console.error('Content Enhancement Error:', error);
      throw new Error('Failed to enhance content');
    }
  }

  // REAL Industry Analysis using AI
  async analyzeIndustryTrends(industry: string): Promise<{
    trends: string[];
    skills: string[];
    technologies: string[];
    predictions: string[];
    data: any;
  }> {
    const systemPrompt = `You are an industry analyst specializing in technology and business trends. Provide comprehensive industry analysis.`;
    
    const prompt = `
    Industry: ${industry}
    
    Analyze current industry trends and provide:
    1. Emerging trends and developments
    2. In-demand skills and competencies
    3. Trending technologies and tools
    4. Future predictions and outlook
    5. Supporting data and statistics
    
    Format as JSON:
    {
      "trends": [string],
      "skills": [string],
      "technologies": [string],
      "predictions": [string],
      "data": {}
    }
    `;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const result = JSON.parse(response);
      
      return {
        trends: result.trends || [],
        skills: result.skills || [],
        technologies: result.technologies || [],
        predictions: result.predictions || [],
        data: result.data || {}
      };
    } catch (error) {
      console.error('Industry Analysis Error:', error);
      throw new Error('Failed to analyze industry trends');
    }
  }

  // REAL Salary Analysis using AI
  async getSalaryInsights(
    jobTitle: string, 
    industry: string, 
    location: string, 
    experience: string
  ): Promise<{
    salaryRange: string;
    marketRate: string;
    factors: string[];
    negotiationTips: string[];
    data: any;
  }> {
    const systemPrompt = `You are a compensation specialist and career advisor. Provide accurate salary insights and negotiation advice.`;
    
    const prompt = `
    Job Title: ${jobTitle}
    Industry: ${industry}
    Location: ${location}
    Experience Level: ${experience}
    
    Provide salary insights including:
    1. Current salary range for this position
    2. Market rate analysis
    3. Factors affecting compensation
    4. Salary negotiation tips
    5. Supporting data and trends
    
    Format as JSON:
    {
      "salaryRange": "string",
      "marketRate": "string",
      "factors": [string],
      "negotiationTips": [string],
      "data": {}
    }
    `;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      const result = JSON.parse(response);
      
      return {
        salaryRange: result.salaryRange || 'Data unavailable',
        marketRate: result.marketRate || 'Data unavailable',
        factors: result.factors || [],
        negotiationTips: result.negotiationTips || [],
        data: result.data || {}
      };
    } catch (error) {
      console.error('Salary Analysis Error:', error);
      throw new Error('Failed to analyze salary data');
    }
  }

  // Get AI Insights for Dashboard
  async getInsights(): Promise<{
    success: boolean;
    data: {
      careerInsights: any[];
      skillGaps: any[];
      recommendations: any[];
    };
  }> {
    try {
      // Check if we have API key for real AI services
      if (!import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_AI_API_KEY === 'your_openai_api_key_here') {
        console.log('AI API key not configured, returning mock data');
        return {
          success: true,
          data: {
            careerInsights: [
              {
                id: '1',
                type: 'skill',
                title: 'AI/ML Skills Development',
                description: 'Focus on developing AI and machine learning skills to stay competitive in the job market.',
                priority: 'high',
                impact: 'positive',
                timeline: '3-6 months',
                actionRequired: true,
                actionText: 'Start learning AI/ML'
              }
            ],
            skillGaps: [
              {
                skill: 'AI/ML Fundamentals',
                currentLevel: 3,
                targetLevel: 8,
                priority: 'critical',
                learningPath: ['Python Basics', 'Machine Learning Intro', 'AI Applications'],
                estimatedTime: '6-8 months'
              }
            ],
            recommendations: [
              {
                id: '1',
                title: 'Focus on AI/ML Skills',
                description: 'Market demand for AI/ML skills is surging',
                priority: 'critical',
                timeline: 'Immediate'
              }
            ]
          }
        };
      }

      // Get real market insights for career analysis
      const marketInsights = await this.getMarketInsights('Technology', 'Software Engineer', 'United States');
      
      // Analyze career trajectory using AI
      const careerAnalysis = await this.callAI(
        'Analyze my current career position and provide insights on skill gaps, career trajectory, and actionable recommendations.',
        'You are an expert career coach and AI analyst. Provide specific, actionable career insights based on current market trends.'
      );

      // Parse AI response and structure data
      let parsedInsights;
      try {
        parsedInsights = JSON.parse(careerAnalysis);
      } catch {
        // If AI response isn't valid JSON, create structured insights from text
        parsedInsights = {
          careerInsights: [
            {
              id: '1',
              type: 'skill',
              title: 'AI-Generated Career Insight',
              description: careerAnalysis.substring(0, 200) + '...',
              priority: 'high',
              impact: 'positive',
              timeline: '3-6 months',
              actionRequired: true,
              actionText: 'Review full analysis'
            }
          ],
          skillGaps: [
            {
              skill: 'AI/ML Skills',
              currentLevel: 4,
              targetLevel: 8,
              priority: 'critical',
              learningPath: ['Python', 'Machine Learning', 'Deep Learning'],
              estimatedTime: '6-8 months'
            }
          ],
          recommendations: [
            {
              id: '1',
              title: 'AI-Generated Recommendation',
              description: 'Based on current market analysis and AI insights',
              priority: 'high',
              timeline: 'Immediate'
            }
          ]
        };
      }

      // Combine AI insights with market data
      const enhancedInsights = {
        careerInsights: [
          ...parsedInsights.careerInsights || [],
          ...marketInsights.slice(0, 2).map(insight => ({
            id: insight.id,
            type: 'trend' as const,
            title: insight.title,
            description: insight.description,
            priority: insight.impact === 'high' ? 'high' : 'medium',
            impact: insight.impact === 'high' ? 'positive' : 'neutral',
            timeline: 'Immediate',
            actionRequired: true,
            actionText: 'Explore market trends'
          }))
        ],
        skillGaps: parsedInsights.skillGaps || [
          {
            skill: 'AI/ML Fundamentals',
            currentLevel: 3,
            targetLevel: 8,
            priority: 'critical',
            learningPath: ['Python Basics', 'Machine Learning Intro', 'AI Applications'],
            estimatedTime: '6-8 months'
          },
          {
            skill: 'Cloud Computing',
            currentLevel: 5,
            targetLevel: 8,
            priority: 'high',
            learningPath: ['AWS', 'Docker', 'Kubernetes'],
            estimatedTime: '4-6 months'
          }
        ],
        recommendations: parsedInsights.recommendations || [
          {
            id: '1',
            title: 'Focus on AI/ML Skills',
            description: 'Market demand for AI/ML skills is surging',
            priority: 'critical',
            timeline: 'Immediate'
          },
          {
            id: '2',
            title: 'Cloud Certification',
            description: 'Cloud skills are in high demand',
            priority: 'high',
            timeline: '3-6 months'
          }
        ]
      };

      return {
        success: true,
        data: enhancedInsights
      };
    } catch (error) {
      console.error('AI Insights Error:', error);
      
      // Return error response instead of empty data
      return {
        success: false,
        data: {
          careerInsights: [],
          skillGaps: [],
          recommendations: []
        }
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;









