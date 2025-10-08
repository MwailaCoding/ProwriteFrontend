import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Globe,
  DollarSign,
  Search,
  MapPin,
  Building2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { advancedAIMarketService, GlobalMarketInsight, GlobalSalaryInsight } from '../../services/advancedAIMarketService';

export const AdvancedAIMarketInsights: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [salarySearchTerm, setSalarySearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [globalMarketData, setGlobalMarketData] = useState<GlobalMarketInsight[]>([]);
  const [salaryInsights, setSalaryInsights] = useState<GlobalSalaryInsight | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<GlobalMarketInsight | null>(null);

  const regions = ['Global', 'North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Africa', 'Middle East'];
  const countries = [
    'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 
    'Netherlands', 'Sweden', 'Singapore', 'Japan', 'India', 'Brazil', 
    'South Africa', 'Kenya', 'Nigeria', 'Mexico', 'Argentina', 'Chile'
  ];

  useEffect(() => {
    loadGlobalMarketData();
  }, [selectedRegion, selectedCountry]);


  const loadGlobalMarketData = async () => {
    setLoading(true);
    try {
      const marketData = await advancedAIMarketService.getGlobalMarketData(selectedRegion, selectedCountry);

      // Ensure marketData is an array
      const validMarketData = Array.isArray(marketData) ? marketData : [];
      setGlobalMarketData(validMarketData);
    } catch (error) {
      console.error('Error loading global market data:', error);
      // Set empty array on error to prevent crashes
      setGlobalMarketData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSalarySearch = async () => {
    if (!salarySearchTerm.trim()) return;
    
    setLoading(true);
    try {
      const salaryData = await advancedAIMarketService.searchSalaryByJob(salarySearchTerm, selectedCountry);
      setSalaryInsights(salaryData);
    } catch (error) {
      console.error('Error searching salary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAnalysis = (skill: GlobalMarketInsight) => {
    setSelectedSkill(skill);
    setActiveTab('analysis');
  };


  const filteredMarketData = (globalMarketData || []).filter(item =>
    item.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.country.toLowerCase().includes(searchTerm.toLowerCase())
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

  const averageDemand = (globalMarketData && globalMarketData.length > 0) 
    ? Math.round(globalMarketData.reduce((acc, item) => acc + item.demand_percentage, 0) / globalMarketData.length)
    : 0;

  const trendingUpCount = (globalMarketData || []).filter(item => item.trend === 'up').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 text-blue-600 mr-3" />
            Advanced AI Market Insights
          </h1>
          <p className="text-gray-600 mt-2">
            Global market analysis with real job vacancies, salary insights, and AI-powered predictions
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
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills, industries, or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <Button onClick={loadGlobalMarketData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Global Skills</p>
              <p className="text-lg font-bold text-gray-900">
                {globalMarketData?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Demand</p>
              <p className="text-lg font-bold text-gray-900">
                {averageDemand}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trending Up</p>
              <p className="text-lg font-bold text-gray-900">
                {trendingUpCount}
              </p>
            </div>
          </div>
        </Card>

      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Global Overview', icon: Globe },
          { id: 'salary', label: 'Salary Insights', icon: DollarSign },
          { id: 'analysis', label: 'AI Analysis', icon: Brain }
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

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Global Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredMarketData.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleSkillAnalysis(item)}>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Brain className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.skill}</h4>
                            <p className="text-sm text-gray-600">{item.industry} • {item.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">{item.demand_percentage}%</span>
                            {getTrendIcon(item.trend)}
                          </div>
                          <p className="text-xs text-gray-500">Global Rank #{item.global_rank}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}


        {activeTab === 'salary' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Salary Insights Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search for job title or skill (e.g., React Developer, Data Scientist)..."
                      value={salarySearchTerm}
                      onChange={(e) => setSalarySearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button onClick={handleSalarySearch} disabled={!salarySearchTerm.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Search Salary
                  </Button>
                </div>
              </CardContent>
            </Card>

            {salaryInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Salary Insights for {salaryInsights.skill}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {salaryInsights.salary_data && Object.entries(salaryInsights.salary_data).map(([level, data]) => (
                      <div key={level} className="text-center p-4 border rounded-lg">
                        <h4 className="font-semibold text-gray-900 capitalize">{level.replace('_', ' ')}</h4>
                        <p className="text-2xl font-bold text-blue-600">${data.average.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">${data.min.toLocaleString()} - ${data.max.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Market Trends</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Salary Growth Rate:</span>
                          <span className="font-medium text-green-600">+{salaryInsights.market_trends?.salary_growth_rate || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Demand Increase:</span>
                          <span className="font-medium text-blue-600">+{salaryInsights.market_trends?.demand_increase || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Competition:</span>
                          <span className="font-medium text-orange-600 capitalize">{salaryInsights.market_trends?.market_competition || 'medium'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">AI Insights</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>6-Month Prediction:</span>
                          <span className="font-medium text-green-600">+{salaryInsights.ai_insights?.salary_prediction_6months || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1-Year Prediction:</span>
                          <span className="font-medium text-blue-600">+{salaryInsights.ai_insights?.salary_prediction_1year || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Negotiation Tips</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {salaryInsights.ai_insights?.negotiation_tips?.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {selectedSkill ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Analysis: {selectedSkill.skill}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Market Overview</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Demand Percentage:</span>
                          <span className="font-medium text-blue-600">{selectedSkill.demand_percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Global Rank:</span>
                          <span className="font-medium text-gray-900">#{selectedSkill.global_rank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Trend:</span>
                          <span className="font-medium text-green-600">{selectedSkill.trend.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Confidence:</span>
                          <span className="font-medium text-green-600">{selectedSkill.ai_analysis?.ai_confidence_score || 0}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Salary Ranges</h4>
                      <div className="space-y-2">
                        {selectedSkill.salary_data && Object.entries(selectedSkill.salary_data).map(([level, salary]) => (
                          <div key={level} className="flex justify-between">
                            <span className="capitalize">{level.replace('_', ' ')}:</span>
                            <span className="font-medium text-gray-900">{salary}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">AI Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Growth Predictions</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>6 Months:</span>
                            <span className="font-medium text-green-600">+{selectedSkill.ai_analysis?.growth_prediction_6months || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>1 Year:</span>
                            <span className="font-medium text-blue-600">+{selectedSkill.ai_analysis?.growth_prediction_1year || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>2 Years:</span>
                            <span className="font-medium text-purple-600">+{selectedSkill.ai_analysis?.growth_prediction_2years || 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Market Sentiment</h5>
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {selectedSkill.ai_analysis?.market_sentiment?.toUpperCase() || 'NEUTRAL'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Market Opportunities</h5>
                      <ul className="space-y-1">
                        {(selectedSkill.ai_analysis?.market_opportunities || []).map((opportunity, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Risk Factors</h5>
                      <ul className="space-y-1">
                        {(selectedSkill.ai_analysis?.risk_factors || []).map((risk, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h5 className="font-medium text-gray-900 mb-2">Learning Path</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(selectedSkill.ai_analysis?.learning_path || []).map((step, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Skill for Analysis</h3>
                <p className="text-gray-600">Click on any skill from the overview tab to see detailed AI analysis.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
