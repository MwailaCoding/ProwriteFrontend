import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Check, Eye, Download } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Template, ResumeFormData } from '../../types';

interface TemplateSelectorProps {
  templates: Template[];
  resumeData: ResumeFormData;
  onTemplateSelect: (template: Template) => void;
  onPreview: (template: Template) => void;
  onBack: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  resumeData,
  onTemplateSelect,
  onPreview,
  onBack
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    onPreview(template);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
    }
  };

  const renderTemplatePreview = (template: Template) => {
    // This would generate a preview of how the resume looks with the selected template
    // For now, we'll show a mock preview
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
          </h2>
          <p className="text-gray-600">{resumeData.personalInfo.email}</p>
          <p className="text-gray-600">{resumeData.personalInfo.phone}</p>
        </div>

        {resumeData.resumeObjective && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h3>
            <p className="text-gray-700">{resumeData.resumeObjective}</p>
          </div>
        )}

        {resumeData.workExperience.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
            {resumeData.workExperience.map((exp, index) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{exp.jobTitle}</h4>
                  <span className="text-sm text-gray-600">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-gray-700 font-medium mb-1">{exp.employer}</p>
                <p className="text-gray-600 text-sm mb-2">{exp.city}, {exp.country}</p>
                <p className="text-gray-700 text-sm">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {resumeData.education.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                  <span className="text-sm text-gray-600">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </span>
                </div>
                <p className="text-gray-700 font-medium mb-1">{edu.institution}</p>
                <p className="text-gray-600 text-sm mb-2">{edu.city}, {edu.country}</p>
                {edu.description && <p className="text-gray-700 text-sm">{edu.description}</p>}
              </div>
            ))}
          </div>
        )}

        {resumeData.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill.name} ({skill.level})
                </span>
              ))}
            </div>
          </div>
        )}

        {resumeData.interests && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Interests</h3>
            <p className="text-gray-700">{resumeData.interests}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-t-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Select Template</h1>
          <p className="text-green-100 text-lg">
            Choose the perfect template for your resume. Your content will be automatically applied.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-green-600 border-2 border-white">
              <Check className="h-6 w-6" />
            </div>
            <div className="w-16 h-1 mx-2 bg-white" />
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-green-600 border-2 border-white">
              <FileText className="h-6 w-6" />
            </div>
            <div className="w-16 h-1 mx-2 bg-white bg-opacity-30" />
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-white text-white">
              <Download className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Templates</h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.template_id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTemplate?.template_id === template.template_id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{template.name}</h4>
                        <p className="text-sm text-gray-600 truncate">{template.description}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                            {template.category}
                          </span>
                          {template.is_premium && (
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full ml-2">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTemplate && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Selected Template</h4>
                  <p className="text-green-700 text-sm mb-3">{selectedTemplate.name}</p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handlePreview(selectedTemplate)}
                      variant="outline"
                      size="sm"
                      icon={<Eye className="h-4 w-4" />}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={handleConfirmSelection}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      icon={<Check className="h-4 w-4" />}
                    >
                      Use This Template
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Navigation */}
          <div className="mt-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              ← Back to Form
            </Button>
          </div>
        </div>

        {/* Template Preview */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                {selectedTemplate ? `Preview: ${selectedTemplate.name}` : 'Template Preview'}
              </h3>
              
              {selectedTemplate ? (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  {renderTemplatePreview(selectedTemplate)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Template Selected</h3>
                  <p className="text-gray-600 mb-6">
                    Choose a template from the left panel to see how your resume will look
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>• Your content will be automatically formatted</p>
                    <p>• Preview the final result before applying</p>
                    <p>• Templates ensure professional appearance</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};





































