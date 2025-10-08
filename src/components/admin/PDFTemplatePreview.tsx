import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { PDFTemplate, PDFContentArea, ResumeFormData } from '../../types';

interface PDFTemplatePreviewProps {
  template: PDFTemplate;
  formData: ResumeFormData;
  onClose?: () => void;
}

export const PDFTemplatePreview: React.FC<PDFTemplatePreviewProps> = ({
  template,
  formData,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showContentAreas, setShowContentAreas] = useState(true);

  // Get form field value
  const getFormFieldValue = (formField: string): string => {
    if (!formData) return '';
    
    const fieldPath = formField.split('.');
    let current: any = formData;
    
    for (const field of fieldPath) {
      if (current && typeof current === 'object' && field in current) {
        current = current[field];
      } else {
        return '';
      }
    }
    
    if (Array.isArray(current)) {
      return current.map(item => {
        if (typeof item === 'object' && item.title) {
          return item.title;
        }
        return String(item);
      }).join(', ');
    }
    
    return current ? String(current) : '';
  };

  // Filter content areas by current page
  const currentPageAreas = template.contentAreas?.filter(
    area => area.coordinates.page === currentPage
  ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Preview</h2>
            <p className="text-gray-600">{template.name}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant={showContentAreas ? 'primary' : 'outline'}
              onClick={() => setShowContentAreas(!showContentAreas)}
            >
              {showContentAreas ? 'Hide' : 'Show'} Areas
            </Button>
            <Button variant="outline">Download</Button>
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex h-full">
          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 p-6 overflow-auto">
            <div className="flex justify-center">
              <div className="bg-white shadow-lg relative">
                {/* Template Image */}
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="max-w-none"
                />

                {/* Content Areas Overlay */}
                {showContentAreas && (
                  <div className="absolute inset-0">
                    {currentPageAreas.map((area) => {
                      const value = getFormFieldValue(area.formField);
                      const displayValue = value || area.placeholder;
                      
                      if (!displayValue) return null;

                      return (
                        <div
                          key={area.id}
                          className="absolute bg-yellow-100 border border-red-300 rounded px-2 py-1 text-xs"
                          style={{
                            left: area.coordinates.x,
                            top: area.coordinates.y,
                            width: area.coordinates.width,
                            height: area.coordinates.height,
                            fontSize: area.styling.fontSize || 12,
                            fontFamily: area.styling.fontFamily || 'Arial',
                            color: area.styling.color || '#000000',
                            textAlign: area.styling.alignment || 'left' as any,
                            fontWeight: area.styling.fontWeight || 'normal',
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                          }}
                          title={`${area.name}: ${displayValue}`}
                        >
                          {displayValue}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            {/* Content Areas List */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Content Areas</h3>
              <div className="space-y-2">
                {currentPageAreas.map((area) => {
                  const value = getFormFieldValue(area.formField);
                  return (
                    <div
                      key={area.id}
                      className="p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {area.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        Field: {area.formField}
                      </div>
                      <div className="text-sm text-gray-600">
                        {value || (
                          <span className="text-gray-400 italic">
                            {area.placeholder || 'No value'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {currentPageAreas.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No content areas on this page</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Data Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Form Data</h3>
              <div className="space-y-3">
                {formData.personalInfo && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-2">Personal Info</div>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div>Name: {formData.personalInfo.firstName} {formData.personalInfo.lastName}</div>
                      <div>Email: {formData.personalInfo.email}</div>
                      <div>Phone: {formData.personalInfo.phone}</div>
                    </div>
                  </div>
                )}

                {formData.workExperience && formData.workExperience.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-900 mb-2">Work Experience</div>
                    <div className="text-xs text-green-800">
                      {formData.workExperience.length} position(s)
                    </div>
                  </div>
                )}

                {formData.education && formData.education.length > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-900 mb-2">Education</div>
                    <div className="text-xs text-purple-800">
                      {formData.education.length} degree(s)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
