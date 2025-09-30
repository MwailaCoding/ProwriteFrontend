import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  MapPin,
  Briefcase,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  Filter,
  Brain,
  Zap,
  TrendingUp as TrendingUpIcon,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Award,
  Users,
  Globe,
  Lightbulb,
  LineChart,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { aiMarketService, AIMarketInsight, AIIndustryAnalysis, AISkillPrediction } from '../../services/aiMarketService';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const AIMarketInsights: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('Nairobi');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [aiMarketData, setAiMarketData] = useState<AIMarketInsight[]>([]);
  const [aiTopSkills, setAiTopSkills] = useState<AIMarketInsight[]>([]);
  const [aiTrendingSkills, setAiTrendingSkills] = useState<AIMarketInsight[]>([]);
  const [industryAnalysis, setIndustryAnalysis] = useState<AIIndustryAnalysis[]>([]);
  const [skillPredictions, setSkillPredictions] = useState<AISkillPrediction[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<AIMarketInsight | null>(null);

  const regions = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  const industries = ['all', 'technology', 'healthcare', 'finance', 'marketing', 'education', 'consulting'];

  useEffect(() => {
    loadAIMarketData();
  }, [selectedRegion, selectedIndustry]);

  const loadAIMarketData = async () => {
    setLoading(true);
    try {
      const [marketData, topSkills, trendingSkills, industryData, predictions] = await Promise.all([
        aiMarketService.getAIMarketData(selectedRegion, selectedIndustry),
        aiMarketService.getAITopSkills(selectedRegion),
        aiMarketService.getAITrendingSkills(selectedRegion),
        aiMarketService.getAIIndustryAnalysis(selectedRegion),
        aiMarketService.getAISkillPredictions(selectedRegion)
      ]);

      setAiMarketData(marketData);
      setAiTopSkills(topSkills);
      setAiTrendingSkills(trendingSkills);
      setIndustryAnalysis(industryData);
      setSkillPredictions(predictions);
    } catch (error) {
      console.error('Error loading AI market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = aiMarketData.filter(item =>
    item.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSkillClick = async (skill: AIMarketInsight) => {
    setSelectedSkill(skill);
  };

  const averageDemand = aiMarketData.length > 0 
    ? Math.round(aiMarketData.reduce((acc, item) => acc + item.demand_percentage, 0) / aiMarketData.length)
    : 0;

  const trendingUpCount = aiMarketData.filter(item => item.trend === 'up').length;
  const uniqueIndustries = new Set(aiMarketData.map(item => item.industry)).size;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              AI Market Insights
            </h1>
            <p className="text-gray-600 mt-2">
              Advanced AI-powered analysis of trending skills and industry demands
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Top Skill</p>
                <p className="text-lg font-bold text-gray-900">
                  {aiTopSkills?.[0]?.skill || 'Loading...'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <LineChart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Avg Demand</p>
                <p className="text-lg font-bold text-gray-900">
                  {averageDemand}%
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Trending Up</p>
                <p className="text-lg font-bold text-gray-900">
                  {trendingUpCount}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Industries</p>
                <p className="text-lg font-bold text-gray-900">
                  {uniqueIndustries}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants}>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'AI Overview', icon: Brain },
            { id: 'predictions', label: 'AI Predictions', icon: TrendingUpIcon },
            { id: 'analysis', label: 'AI Analysis', icon: BarChart3 },
            { id: 'insights', label: 'AI Insights', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content will be added in next part */}
      <div className="text-center py-8">
        <p className="text-gray-600">AI Market Insights content will be loaded here...</p>
      </div>
    </motion.div>
  );
};
