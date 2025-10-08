import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Download, 
  Star, 
  Calendar,
  Filter,
  Download as DownloadIcon,
  Share2,
  Heart,
  Clock,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart,
  BarChart
} from 'lucide-react';
import { Card } from '../common/Card';
import { resumeTemplateCategories, getAllTemplates, getPopularTemplates } from '../../data/resumeTemplates';

interface TemplateAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export const TemplateAnalytics: React.FC<TemplateAnalyticsProps> = ({
  timeRange = '30d'
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allTemplates = getAllTemplates();
  const popularTemplates = getPopularTemplates(10);

  // Mock analytics data (in a real app, this would come from the backend)
  const mockAnalytics = {
    totalViews: 15420,
    totalDownloads: 8920,
    totalShares: 2340,
    averageRating: 4.6,
    topPerformingCategory: 'Professional',
    mostViewedTemplate: 'Classic Professional',
    conversionRate: 68.2,
    userEngagement: 87.5,
    categoryPerformance: {
      professional: { views: 5200, downloads: 3100, rating: 4.7 },
      creative: { views: 4800, downloads: 2800, rating: 4.5 },
      academic: { views: 3200, downloads: 1800, rating: 4.8 },
      technical: { views: 4100, downloads: 2400, rating: 4.6 },
      entryLevel: { views: 2800, downloads: 1600, rating: 4.4 }
    },
    monthlyTrends: [
      { month: 'Jan', views: 1200, downloads: 800, shares: 200 },
      { month: 'Feb', views: 1350, downloads: 920, shares: 240 },
      { month: 'Mar', views: 1420, downloads: 980, shares: 260 },
      { month: 'Apr', views: 1580, downloads: 1100, shares: 290 },
      { month: 'May', views: 1680, downloads: 1180, shares: 310 },
      { month: 'Jun', views: 1750, downloads: 1250, shares: 330 }
    ]
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = resumeTemplateCategories.find(cat => cat.id === categoryId);
    return category?.icon || '📄';
  };

  const getCategoryColor = (categoryId: string) => {
    const colors = {
      professional: 'bg-blue-100 text-blue-800',
      creative: 'bg-purple-100 text-purple-800',
      academic: 'bg-green-100 text-green-800',
      technical: 'bg-orange-100 text-orange-800',
      'entry-level': 'bg-pink-100 text-pink-800'
    };
    return colors[categoryId as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string, change?: string) => (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  const renderCategoryPerformance = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
      <div className="space-y-4">
        {Object.entries(mockAnalytics.categoryPerformance).map(([categoryId, stats]) => (
          <div key={categoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getCategoryIcon(categoryId)}</span>
              <div>
                <p className="font-medium text-gray-900 capitalize">{categoryId.replace('-', ' ')}</p>
                <p className="text-sm text-gray-500">{stats.views.toLocaleString()} views</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(stats.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{stats.downloads.toLocaleString()} downloads</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderTopTemplates = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Templates</h3>
      <div className="space-y-3">
        {popularTemplates.slice(0, 5).map((template, index) => (
          <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">
                #{index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{template.name}</p>
                <p className="text-sm text-gray-500">{template.category}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(template.popularity / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{template.popularity}% popularity</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderTrendsChart = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
      <div className="space-y-4">
        {mockAnalytics.monthlyTrends.map((monthData, index) => (
          <div key={monthData.month} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{monthData.month}</span>
              <span className="text-gray-500">
                {monthData.views.toLocaleString()} views • {monthData.downloads.toLocaleString()} downloads
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(monthData.views / 1800) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderEngagementMetrics = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{mockAnalytics.conversionRate}%</div>
          <div className="text-sm text-blue-800">Conversion Rate</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{mockAnalytics.userEngagement}%</div>
          <div className="text-sm text-green-800">User Engagement</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{mockAnalytics.averageRating}</div>
          <div className="text-sm text-purple-800">Average Rating</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round((mockAnalytics.totalDownloads / mockAnalytics.totalViews) * 100)}%
          </div>
          <div className="text-sm text-orange-800">Download Rate</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into template performance and user engagement</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {resumeTemplateCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {renderMetricCard(
          'Total Views',
          mockAnalytics.totalViews.toLocaleString(),
          <Eye className="h-6 w-6 text-blue-600" />,
          'bg-blue-100',
          '+12.5% from last month'
        )}
        {renderMetricCard(
          'Total Downloads',
          mockAnalytics.totalDownloads.toLocaleString(),
          <DownloadIcon className="h-6 w-6 text-green-600" />,
          'bg-green-100',
          '+8.3% from last month'
        )}
        {renderMetricCard(
          'Total Shares',
          mockAnalytics.totalShares.toLocaleString(),
          <Share2 className="h-6 w-6 text-purple-600" />,
          'bg-purple-100',
          '+15.2% from last month'
        )}
        {renderMetricCard(
          'Average Rating',
          mockAnalytics.averageRating,
          <Star className="h-6 w-6 text-yellow-600" />,
          'bg-yellow-100',
          '+0.2 from last month'
        )}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {renderCategoryPerformance()}
        {renderTopTemplates()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {renderTrendsChart()}
        {renderEngagementMetrics()}
      </div>

      {/* Additional Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Best Performing Category</h4>
            <p className="text-2xl font-bold text-blue-600">{mockAnalytics.topPerformingCategory}</p>
            <p className="text-sm text-gray-500">Highest engagement and conversion rates</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Most Viewed Template</h4>
            <p className="text-lg font-bold text-green-600">{mockAnalytics.mostViewedTemplate}</p>
            <p className="text-sm text-gray-500">Consistently high user interest</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Growth Trend</h4>
            <p className="text-2xl font-bold text-purple-600">+18.7%</p>
            <p className="text-sm text-gray-500">Month-over-month growth in usage</p>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📈 Optimize Popular Templates</h4>
            <p className="text-sm text-gray-600">
              Focus on improving the top 5 performing templates to maximize user satisfaction and engagement.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Expand Professional Category</h4>
            <p className="text-sm text-gray-600">
              The Professional category shows the highest performance. Consider adding more templates in this category.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📊 Improve Conversion Rate</h4>
            <p className="text-sm text-gray-600">
              Current conversion rate is 68.2%. Aim to reach 75% by optimizing template previews and descriptions.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">🚀 User Experience Enhancement</h4>
            <p className="text-sm text-gray-600">
              High user engagement (87.5%) suggests good UX. Focus on maintaining this while improving download rates.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
