import React, { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { resumeTemplateCategories } from '../../data/resumeTemplates';
import { PDFTemplate } from '../../types';

interface SimpleTemplateCreatorProps {
  onSave?: (template: Partial<PDFTemplate>) => void;
  onCancel?: () => void;
}

export const SimpleTemplateCreator: React.FC<SimpleTemplateCreatorProps> = ({
  onSave,
  onCancel
}) => {
  const [templateData, setTemplateData] = useState<Partial<PDFTemplate>>({
    name: '',
    description: '',
    category: 'professional',
    tags: [],
    metadata: {
      pageCount: 1,
      orientation: 'portrait',
      pageSize: 'a4',
      colorScheme: 'professional',
      difficulty: 'beginner'
    }
  });

  const updateTemplateData = (updates: Partial<PDFTemplate>) => {
    setTemplateData(prev => ({ ...prev, ...updates }));
  };

  const addTag = (tag: string) => {
    if (tag && !templateData.tags?.includes(tag)) {
      updateTemplateData({ tags: [...(templateData.tags || []), tag] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateTemplateData({ tags: templateData.tags?.filter(tag => tag !== tagToRemove) || [] });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Template</h1>
        <p className="text-gray-600 mt-2">Add a new resume template to your collection</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
            <input
              type="text"
              value={templateData.name}
              onChange={(e) => updateTemplateData({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={templateData.description}
              onChange={(e) => updateTemplateData({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your template"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              value={templateData.category}
              onChange={(e) => updateTemplateData({ category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {resumeTemplateCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={templateData.metadata?.difficulty}
              onChange={(e) => updateTemplateData({ 
                metadata: { ...templateData.metadata, difficulty: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addTag(input.value);
                      input.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={() => {
                  const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement;
                  if (input?.value) {
                    addTag(input.value);
                    input.value = '';
                  }
                }}>
                  Add
                </Button>
              </div>
              
              {templateData.tags && templateData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {templateData.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={() => onSave?.(templateData)}
            disabled={!templateData.name || !templateData.description}
            icon={<Save className="h-4 w-4" />}
          >
            Create Template
          </Button>
        </div>
      </Card>
    </div>
  );
};
