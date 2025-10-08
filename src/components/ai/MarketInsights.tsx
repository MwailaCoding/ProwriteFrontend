import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Zap, 
  RefreshCw,
  Target,
  DollarSign,
  Users,
  Briefcase,
  Star,
  Database,
  Activity
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { marketDataService } from '../../services/marketDataService';

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  category: 'trend' | 'salary' | 'demand' | 'skill' | 'industry';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  source: string;
  timestamp: string;
}

interface MarketInsightsProps {
  industry: string;
  jobTitle: string;
  location?: string;
  onInsightsLoaded?: (insights: MarketInsight[]) => void;
}

const MarketInsights: React.FC<MarketInsightsProps> = ({
  industry,
  jobTitle,
  location = 'Global',
  onInsightsLoaded
}) => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchMarketInsights();
  }, [industry, jobTitle, location]);

  const fetchMarketInsights = async () => {
    setIsLoading(true);
    
    try {
      // REAL AI-powered market insights
      const [aiInsights, liveTrends] = await Promise.all([
        aiService.getMarketInsights(industry, jobTitle, location),
        marketDataService.getLiveMarketTrends(industry)
      ]);
      
      // Combine AI insights with live market data
      const combinedInsights = [
        ...aiInsights,
        ...liveTrends.map(trend => ({
          id: `trend_${Date.now()}`,
          title: `${industry} Market Trends`,
          description: `Job growth: ${trend.jobGrowth}%, Salary growth: ${trend.salaryGrowth}%`,
          category: 'trend' as const,
          impact: trend.demandTrend === 'increasing' ? 'high' : 'medium' as const,
          confidence: 0.9,
          source: 'Live Market Data',
          timestamp: trend.lastUpdated,
          data: trend
        }))
      ];
      
      setInsights(combinedInsights);
      setLastUpdated(new Date());
      onInsightsLoaded?.(combinedInsights);
    } catch (error) {
      console.error('Failed to fetch market insights:', error);
      alert('Failed to fetch market insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real AI and market data services now handle insight generation

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'salary': return <DollarSign className="h-4 w-4" />;
      case 'demand': return <Users className="h-4 w-4" />;
      case 'skill': return <Briefcase className="h-4 w-4" />;
      case 'industry': return <Globe className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trend': return 'bg-blue-100 text-blue-800';
      case 'salary': return 'bg-green-100 text-green-800';
      case 'demand': return 'bg-purple-100 text-purple-800';
      case 'skill': return 'bg-orange-100 text-orange-800';
      case 'industry': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Insights', count: insights.length },
    { value: 'trend', label: 'Trends', count: insights.filter(i => i.category === 'trend').length },
    { value: 'salary', label: 'Salary', count: insights.filter(i => i.category === 'salary').length },
    { value: 'demand', label: 'Demand', count: insights.filter(i => i.category === 'demand').length },
    { value: 'skill', label: 'Skills', count: insights.filter(i => i.category === 'skill').length },
    { value: 'industry', label: 'Industry', count: insights.filter(i => i.category === 'industry').length }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">AI Market Insights</h3>
        </div>
        
        <button
          onClick={fetchMarketInsights}
          disabled={isLoading}
          className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Industry & Job Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Industry</div>
            <div className="font-semibold text-gray-900">{industry}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Job Title</div>
            <div className="font-semibold text-gray-900">{jobTitle}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Location</div>
            <div className="font-semibold text-gray-900">{location}</div>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-center mt-3 text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI is analyzing market data...</p>
        </div>
      )}

      {/* Market Insights */}
      <AnimatePresence>
        {!isLoading && filteredInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`p-2 rounded-lg ${getCategoryColor(insight.category)}`}>
                      {getCategoryIcon(insight.category)}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{insight.source}</span>
                        <span>•</span>
                        <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getImpactColor(insight.impact)}`}>
                      {insight.impact.toUpperCase()} Impact
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Category: {insight.category}</span>
                  <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      {!isLoading && insights.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Market Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {insights.filter(i => i.impact === 'high').length}
              </div>
              <div className="text-xs text-gray-600">High Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {insights.filter(i => i.category === 'trend').length}
              </div>
              <div className="text-xs text-gray-600">Trends</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length * 100)}%
              </div>
              <div className="text-xs text-gray-600">Avg Confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {insights.length}
              </div>
              <div className="text-xs text-gray-600">Total Insights</div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <Zap className="h-4 w-4 mr-2" />
          How to Use These Insights
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Incorporate trending skills into your resume</li>
          <li>• Highlight relevant experience for high-demand areas</li>
          <li>• Use salary insights for salary negotiations</li>
          <li>• Stay updated with industry trends</li>
          <li>• Focus on skills with high market demand</li>
        </ul>
      </div>
    </div>
  );
};

export default MarketInsights;
