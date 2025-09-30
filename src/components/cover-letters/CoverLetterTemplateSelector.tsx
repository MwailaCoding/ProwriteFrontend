import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layout, 
  Eye, 
  Check, 
  Star,
  TrendingUp,
  Palette,
  Briefcase,
  Award
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { coverLetterService } from '../../services/coverLetterService';

interface CoverLetterTemplateSelectorProps {
  industry?: string;
  roleLevel?: string;
  onTemplateSelect?: (templateId: string) => void;
  selectedTemplate?: string;
}

interface Template {
  name: string;
  description: string;
  category: string;
  characteristics: string[];
  best_for: string[];
  layout: any;
  content_structure: any;
}

export const CoverLetterTemplateSelector: React.FC<CoverLetterTemplateSelectorProps> = ({
  industry = 'general',
  roleLevel = 'entry',
  onTemplateSelect,
  selectedTemplate
}) => {
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (industry && roleLevel) {
      loadRecommendations();
    }
  }, [industry, roleLevel]);

  const loadTemplates = async () => {
    try {
      const templatesData = await coverLetterService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recommendationsData = await coverLetterService.getTemplateRecommendations(industry, roleLevel);
      setRecommendations(recommendationsData.recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadTemplatePreview = async (templateId: string) => {
    setPreviewLoading(true);
    try {
      const previewData = await coverLetterService.getTemplateDetails(templateId);
      setPreviewData(previewData);
      setPreviewTemplate(templateId);
    } catch (error) {
      console.error('Failed to load template preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional':
        return <Briefcase className="w-4 h-4" />;
      case 'creative':
        return <Palette className="w-4 h-4" />;
      case 'executive':
        return <Award className="w-4 h-4" />;
      case 'traditional':
        return <Layout className="w-4 h-4" />;
      case 'minimalist':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Layout className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'creative':
        return 'bg-purple-100 text-purple-800';
      case 'executive':
        return 'bg-gold-100 text-gold-800';
      case 'traditional':
        return 'bg-gray-100 text-gray-800';
      case 'minimalist':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Template</h2>
        <p className="text-gray-600 mt-1">
          Select a professional template that matches your industry and role level
        </p>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Based on your industry ({industry}) and role level ({roleLevel}), we recommend these templates:
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((templateId) => {
              const template = templates[templateId];
              if (!template) return null;
              
              return (
                <button
                  key={templateId}
                  onClick={() => onTemplateSelect?.(templateId)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedTemplate === templateId
                      ? 'bg-sunset-gradient text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {template.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(templates).map(([templateId, template]) => (
          <motion.div
            key={templateId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === templateId ? 'ring-2 ring-sunset-500' : ''
            }`}>
              <div className="space-y-4">
                {/* Template Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                      {getCategoryIcon(template.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                  </div>
                  {selectedTemplate === templateId && (
                    <Check className="w-5 h-5 text-sunset-500" />
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600">{template.description}</p>

                {/* Characteristics */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Characteristics:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.characteristics.slice(0, 3).map((char, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Best For */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Best for:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.best_for.slice(0, 2).map((industry, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => onTemplateSelect?.(templateId)}
                    variant={selectedTemplate === templateId ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    {selectedTemplate === templateId ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    onClick={() => loadTemplatePreview(templateId)}
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {previewData.template.name} - Preview
                  </h3>
                  <p className="text-gray-600">{previewData.template.description}</p>
                </div>
                <Button
                  onClick={() => setPreviewTemplate(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {previewLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="mt-2 text-gray-600">Loading preview...</p>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {previewData.preview_content}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setPreviewTemplate(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onTemplateSelect?.(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="bg-sunset-gradient"
                >
                  Use This Template
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};



















