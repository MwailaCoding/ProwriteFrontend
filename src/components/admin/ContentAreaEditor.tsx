import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { PDFContentArea } from '../../types';

interface ContentAreaEditorProps {
  templateId: string;
  contentAreas: PDFContentArea[];
  onSave: (contentAreas: PDFContentArea[]) => void;
  onProcess: () => Promise<void>;
}

export const ContentAreaEditor: React.FC<ContentAreaEditorProps> = ({
  templateId,
  contentAreas,
  onSave,
  onProcess
}) => {
  const [areas, setAreas] = useState<PDFContentArea[]>(contentAreas);
  const [selectedArea, setSelectedArea] = useState<PDFContentArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAreas(contentAreas);
  }, [contentAreas]);

  const handleAreaSelect = (area: PDFContentArea) => {
    setSelectedArea(area);
  };

  const handleAreaUpdate = (areaId: string, updates: Partial<PDFContentArea>) => {
    setAreas(prev => prev.map(area => 
      area.id === areaId ? { ...area, ...updates } : area
    ));
    
    if (selectedArea?.id === areaId) {
      setSelectedArea(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(areas);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await onProcess();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Area Editor</h2>
            <p className="text-gray-600">Map PDF template areas to form fields</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleProcess}
              loading={isProcessing}
              variant="outline"
            >
              Process PDF
            </Button>
            <Button
              onClick={handleSave}
              loading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Areas List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content Areas</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {areas.map((area) => (
                <div
                  key={area.id}
                  onClick={() => handleAreaSelect(area)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedArea?.id === area.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">{area.name}</div>
                  <div className="text-xs text-gray-500">{area.formField}</div>
                </div>
              ))}
              
              {areas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No content areas found</p>
                  <p className="text-sm">Click "Process PDF" to extract areas</p>
                </div>
              )}
            </div>
          </div>

          {/* Area Editor */}
          <div className="lg:col-span-2">
            {selectedArea ? (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Edit: {selectedArea.name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area Name
                    </label>
                    <input
                      type="text"
                      value={selectedArea.name}
                      onChange={(e) => handleAreaUpdate(selectedArea.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form Field
                    </label>
                    <select
                      value={selectedArea.formField}
                      onChange={(e) => handleAreaUpdate(selectedArea.id, { formField: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="personalInfo.firstName">First Name</option>
                      <option value="personalInfo.lastName">Last Name</option>
                      <option value="personalInfo.email">Email</option>
                      <option value="personalInfo.phone">Phone</option>
                      <option value="resumeObjective">Resume Objective</option>
                      <option value="workExperience">Work Experience</option>
                      <option value="education">Education</option>
                      <option value="skills">Skills</option>
                      <option value="custom">Custom Field</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={selectedArea.placeholder}
                    onChange={(e) => handleAreaUpdate(selectedArea.id, { placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Text to show when area is empty"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Area Selected</h3>
                <p>Select a content area from the list to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
