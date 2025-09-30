import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { templateService } from '../../services/templateService';

interface TemplateSection {
  section_id: number;
  section_type: string;
  section_name: string;
  content: string;
  display_order: number;
}

interface Template {
  template_id: number;
  name: string;
  description: string;
  industry: string;
  category: string;
  is_premium: boolean;
  price: number;
  thumbnail_url?: string;
  sections: TemplateSection[];
}

interface TemplatePreviewProps {
  templateId: number;
  isOpen: boolean;
  onClose: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ templateId, isOpen, onClose }) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && templateId) {
      fetchTemplate();
    }
  }, [isOpen, templateId]);

  const fetchTemplate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const templateData = await templateService.getTemplate(templateId);
      setTemplate(templateData);
    } catch (err) {
      setError('Failed to load template preview');
      console.error('Error fetching template:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Preview</h2>
            {template && (
              <p className="text-gray-600 mt-1">
                {template.name} • {template.industry} • {template.category}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 text-lg">{error}</p>
              <button
                onClick={fetchTemplate}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {template && !loading && (
            <div className="space-y-6">
              {/* Template Header */}
              <div className="text-center border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {template.industry}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    {template.category}
                  </span>
                  {template.is_premium && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                      Premium - KES {template.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Template Sections */}
              <div className="space-y-8">
                {template.sections && template.sections.length > 0 ? (
                  template.sections
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((section, index) => (
                      <div key={section.section_id} className="border-l-4 border-blue-500 pl-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 capitalize">
                          {section.section_name}
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          {section.content ? (
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                              {section.content}
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">
                              [Section content will be filled by user]
                            </div>
                          )}
                        </div>
                        
                        {/* Section Type Badge */}
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {section.section_type}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>No sections found for this template</p>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="bg-gray-50 rounded-lg p-4 mt-8">
                <h4 className="font-medium text-gray-900 mb-2">Template Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Total Sections:</span> {template.sections?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Template ID:</span> {template.template_id}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {template.category}
                  </div>
                  <div>
                    <span className="font-medium">Industry:</span> {template.industry}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            This preview shows the exact template structure and styling
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                // Navigate to create resume with this template
                window.location.href = `/resumes/create?template=${templateId}`;
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;

























