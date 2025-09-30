import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  Lightbulb, 
  Clock, 
  Star,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Rocket,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { aiService } from '../../services/aiService';

interface CareerInsight {
  id: string;
  type: 'skill' | 'trend' | 'opportunity' | 'warning';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'positive' | 'negative' | 'neutral';
  timeline: string;
  actionRequired: boolean;
  actionText?: string;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  learningPath: string[];
  estimatedTime: string;
}

export const AICareerInsights: React.FC = () => {
  const [insights, setInsights] = useState<CareerInsight[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real AI-generated insights
    const fetchAIInsights = async () => {
      try {
        setLoading(true);
        const result = await aiService.getInsights();
        
        if (result.success && result.data) {
          // Transform AI service data to component format
          const realInsights: CareerInsight[] = result.data.careerInsights.map((insight: any, index: number) => ({
            id: insight.id || `insight_${index + 1}`,
            type: insight.type || 'trend',
            title: insight.title || 'AI-Generated Insight',
            description: insight.description || 'Based on real market analysis and AI insights',
            priority: insight.priority || 'medium',
            impact: insight.impact || 'positive',
            timeline: insight.timeline || '3-6 months',
            actionRequired: insight.actionRequired || false,
            actionText: insight.actionText || 'Take Action'
          }));

          const realSkillGaps: SkillGap[] = result.data.skillGaps.map((gap: any, index: number) => ({
            skill: gap.skill || `Skill ${index + 1}`,
            currentLevel: gap.currentLevel || 3,
            targetLevel: gap.targetLevel || 8,
            priority: gap.priority || 'medium',
            learningPath: gap.learningPath || ['Learning Path'],
            estimatedTime: gap.estimatedTime || '3-6 months'
          }));

          setInsights(realInsights);
          setSkillGaps(realSkillGaps);
        } else {
          // Fallback to basic insights if AI service fails
          setInsights([
            {
              id: '1',
              type: 'trend',
              title: 'AI Service Unavailable',
              description: 'Please configure your AI API keys to get personalized insights.',
              priority: 'medium',
              impact: 'neutral',
              timeline: 'Immediate',
              actionRequired: true,
              actionText: 'Configure API Keys'
            }
          ]);
          setSkillGaps([]);
        }
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        setInsights([
          {
            id: '1',
            type: 'warning',
            title: 'Service Error',
            description: 'Unable to fetch AI insights. Please check your configuration.',
            priority: 'medium',
            impact: 'negative',
            timeline: 'Immediate',
            actionRequired: true,
            actionText: 'Retry'
          }
        ]);
        setSkillGaps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case 'neutral': return <BarChart3 className="h-4 w-4 text-gray-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Brain className="h-6 w-6" />
            <span>AI Career Intelligence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-900 mb-3">Key Insights</h4>
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      {getImpactIcon(insight.impact)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="text-sm font-medium text-gray-900">{insight.title}</h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Timeline: {insight.timeline}</span>
                          {insight.actionRequired && insight.actionText && (
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                              {insight.actionText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-900 mb-3">Critical Skill Gaps</h4>
              <div className="space-y-3">
                {skillGaps.slice(0, 2).map((gap, index) => (
                  <motion.div
                    key={gap.skill}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-3 bg-white rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900">{gap.skill}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(gap.priority)}`}>
                        {gap.priority}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Current: {gap.currentLevel}/10</span>
                        <span className="text-gray-600">Target: {gap.targetLevel}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(gap.currentLevel / gap.targetLevel) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Estimated time: {gap.estimatedTime}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Recommendations */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-900">
            <Lightbulb className="h-6 w-6" />
            <span>AI-Powered Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.filter(i => i.actionRequired).map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-white rounded-lg border border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-5 w-5 text-emerald-600 group-hover:text-emerald-700" />
                  <span className="text-sm font-medium text-emerald-900">Action Required</span>
                </div>
                <h5 className="font-medium text-gray-900 mb-2">{insight.title}</h5>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-medium">{insight.timeline}</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
