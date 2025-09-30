import React from 'react';
import { 
  Star, 
  Eye, 
  Download, 
  Heart, 
  Clock, 
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Palette,
  Target,
  Tag,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Grid,
  List,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface TemplateFeaturesSummaryProps {
  onNavigateToFeature?: (feature: string) => void;
}

export const TemplateFeaturesSummary: React.FC<TemplateFeaturesSummaryProps> = ({
  onNavigateToFeature
}) => {
  const features = [
    {
      id: 'showcase',
      title: 'Template Showcase',
      description: 'Comprehensive showcase of templates organized by categories with detailed information',
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      path: '/admin/template-showcase',
      highlights: ['Category Organization', 'Template Details', 'Popularity Ratings', 'Difficulty Levels']
    },
    {
      id: 'management',
      title: 'Template Management',
      description: 'Admin dashboard for managing templates with bulk operations and analytics',
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      path: '/admin/template-management',
      highlights: ['Bulk Operations', 'Grid & Table Views', 'Analytics Dashboard', 'Template Statistics']
    },
    {
      id: 'analytics',
      title: 'Template Analytics',
      description: 'Detailed insights into template performance, usage, and user engagement',
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      path: '/admin/template-analytics',
      highlights: ['Performance Metrics', 'Usage Statistics', 'Category Analysis', 'Recommendations']
    },
    {
      id: 'creation',
      title: 'Template Creation',
      description: 'Simple wizard for creating new templates with metadata and content areas',
      icon: <Plus className="h-8 w-8 text-orange-600" />,
      path: '/admin/template-creation',
      highlights: ['Simple Form', 'Metadata Setup', 'Tag Management', 'Category Selection']
    },
    {
      id: 'enhanced-selector',
      title: 'Enhanced Template Selector',
      description: 'Advanced template selection interface with filtering, sorting, and previews',
      icon: <Grid className="h-8 w-8 text-indigo-600" />,
      path: '/admin/enhanced-selector',
      highlights: ['Advanced Filtering', 'Sorting Options', 'View Modes', 'Template Previews']
    }
  ];

  const stats = [
    { label: 'Total Templates', value: '25+', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Categories', value: '5', icon: <Grid className="h-5 w-5" /> },
    { label: 'Avg. Popularity', value: '87%', icon: <Star className="h-5 w-5" /> },
    { label: 'Beginner Friendly', value: '12', icon: <CheckCircle className="h-5 w-5" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 Template Management System</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive suite of tools for managing, showcasing, and analyzing resume templates
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {features.map((feature) => (
          <Card key={feature.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                
                <div className="space-y-2 mb-4">
                  {feature.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => onNavigateToFeature?.(feature.path)}
                  variant="outline"
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconRight
                  className="w-full"
                >
                  Explore {feature.title}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Key Benefits */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">User Experience</h3>
            <p className="text-sm text-gray-600">
              Intuitive interfaces for browsing, selecting, and managing templates
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
            <p className="text-sm text-gray-600">
              Comprehensive data on template performance and user engagement
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Design & Customization</h3>
            <p className="text-sm text-gray-600">
              Flexible template creation and management with rich metadata
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-4">

          <Button 
            onClick={() => onNavigateToFeature?.('/admin/template-creation')}
            icon={<Plus className="h-4 w-4" />}
            variant="outline"
            size="lg"
          >
            Create Template
          </Button>
          <Button 
            onClick={() => onNavigateToFeature?.('/admin/template-analytics')}
            icon={<BarChart3 className="h-4 w-4" />}
            variant="outline"
            size="lg"
          >
            View Analytics
          </Button>
        </div>
      </div>

      {/* Feature Comparison */}
      <Card className="p-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Management Dashboard
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Analytics
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Template Browsing
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Search & Filtering
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Bulk Operations
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-gray-400">—</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-gray-400">—</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Performance Analytics
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-gray-400">—</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-gray-400">—</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
