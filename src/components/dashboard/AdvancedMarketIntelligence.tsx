import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  MapPin,
  Clock,
  Star,
  ArrowUpRight,
  BarChart3,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';

interface MarketTrend {
  id: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface SalaryData {
  position: string;
  currentRange: string;
  marketAverage: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  demand: 'high' | 'medium' | 'low';
}

interface CompanyInsight {
  name: string;
  industry: string;
  growth: number;
  hiring: boolean;
  skills: string[];
  location: string;
  rating: number;
}

export const AdvancedMarketIntelligence: React.FC = () => {
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [companyInsights, setCompanyInsights] = useState<CompanyInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time market data
    const generateMarketData = () => {
      const mockTrends: MarketTrend[] = [
        {
          id: '1',
          category: 'AI/ML Skills',
          trend: 'up',
          percentage: 23,
          description: 'Demand for AI/ML professionals surged this quarter',
          impact: 'high',
          timeframe: 'Q3 2024'
        },
        {
          id: '2',
          category: 'Remote Work',
          trend: 'stable',
          percentage: 2,
          description: 'Remote work adoption stabilized after pandemic peak',
          impact: 'medium',
          timeframe: 'Q3 2024'
        },
        {
          id: '3',
          category: 'Cloud Computing',
          trend: 'up',
          percentage: 18,
          description: 'Continued growth in cloud infrastructure demand',
          impact: 'high',
          timeframe: 'Q3 2024'
        },
        {
          id: '4',
          category: 'Cybersecurity',
          trend: 'up',
          percentage: 31,
          description: 'Critical need for security professionals',
          impact: 'high',
          timeframe: 'Q3 2024'
        }
      ];

      const mockSalaryData: SalaryData[] = [
        {
          position: 'Senior Software Engineer',
          currentRange: '$120K - $150K',
          marketAverage: '$135K',
          trend: 'up',
          change: 8,
          demand: 'high'
        },
        {
          position: 'Data Scientist',
          currentRange: '$110K - $140K',
          marketAverage: '$125K',
          trend: 'up',
          change: 15,
          demand: 'high'
        },
        {
          position: 'Product Manager',
          currentRange: '$130K - $160K',
          marketAverage: '$145K',
          trend: 'stable',
          change: 3,
          demand: 'medium'
        }
      ];

      const mockCompanyInsights: CompanyInsight[] = [
        {
          name: 'TechCorp Inc.',
          industry: 'Software Development',
          growth: 25,
          hiring: true,
          skills: ['React', 'Node.js', 'AI/ML'],
          location: 'San Francisco, CA',
          rating: 4.2
        },
        {
          name: 'DataFlow Systems',
          industry: 'Data Analytics',
          growth: 18,
          hiring: true,
          skills: ['Python', 'SQL', 'Machine Learning'],
          location: 'Austin, TX',
          rating: 4.5
        },
        {
          name: 'CloudTech Solutions',
          industry: 'Cloud Infrastructure',
          growth: 32,
          hiring: true,
          skills: ['AWS', 'Docker', 'Kubernetes'],
          location: 'Seattle, WA',
          rating: 4.1
        }
      ];

      setMarketTrends(mockTrends);
      setSalaryData(mockSalaryData);
      setCompanyInsights(mockCompanyInsights);
      setLoading(false);
    };

    setTimeout(generateMarketData, 1500);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Trends Dashboard */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-900">
            <TrendingUp className="h-6 w-6" />
            <span>Live Market Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Trends */}
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-900 mb-3">Key Market Trends</h4>
              <div className="space-y-3">
                {marketTrends.map((trend, index) => (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-3 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      {getTrendIcon(trend.trend)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="text-sm font-medium text-gray-900">{trend.category}</h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(trend.impact)}`}>
                            {trend.impact} impact
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{trend.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-purple-600">
                            {trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : ''}{trend.percentage}%
                          </span>
                          <span className="text-xs text-gray-500">{trend.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Market Pulse */}
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-900 mb-3">Market Pulse</h4>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Overall Market Health</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-semibold">Strong</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Job Growth</span>
                      <span className="text-green-600">+12%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Salary Growth</span>
                      <span className="text-green-600">+8%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Competition Level</span>
                      <span className="text-yellow-600">Medium</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Your Industry Position</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-600 font-semibold">Above Average</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    You're positioned in the top 30% of your field
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Intelligence */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <DollarSign className="h-6 w-6" />
            <span>Salary Intelligence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryData.map((salary, index) => (
              <motion.div
                key={salary.position}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 text-sm">{salary.position}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDemandColor(salary.demand)}`}>
                    {salary.demand} demand
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Your Range</span>
                    <span className="font-semibold text-blue-600">{salary.currentRange}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Market Average</span>
                    <span className="text-gray-700">{salary.marketAverage}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Trend</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(salary.trend)}
                      <span className={`font-medium ${salary.trend === 'up' ? 'text-green-600' : salary.trend === 'down' ? 'text-red-600' : 'text-blue-600'}`}>
                        {salary.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Insights */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-900">
            <Building className="h-6 w-6" />
            <span>Company Intelligence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyInsights.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-white rounded-lg border border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900">{company.name}</h5>
                    <p className="text-xs text-gray-600">{company.industry}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{company.rating}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Growth</span>
                    <span className="text-sm font-semibold text-green-600">+{company.growth}%</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{company.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {company.hiring ? 'Actively Hiring' : 'Limited Openings'}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-emerald-100">
                    <div className="flex flex-wrap gap-1">
                      {company.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-emerald-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-medium">View Details</span>
                    <ArrowUpRight className="h-3 w-3 text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

