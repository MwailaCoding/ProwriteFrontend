import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  Save,
  ArrowLeft,
  ArrowRight,
  X,
  FileText,
  Palette,
  Target,
  Tag,
  CheckCircle,
  Download, 
  Star, 
  Filter, 
  Search, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Clock,
  Settings,
  RefreshCw,
  Archive,
  Unarchive,
  Copy,
  Share2,
  Image,
  Zap
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { resumeTemplateCategories } from '../../data/resumeTemplates';
import { PDFTemplate, PDFContentArea } from '../../types';

interface TemplateCreationWizardProps {
  onSave?: (template: Partial<PDFTemplate>) => void;
  onCancel?: () => void;
  initialTemplate?: Partial<PDFTemplate>;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const wizardSteps: WizardStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Set template name, description, and category',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'upload',
    title: 'Upload Template',
    description: 'Upload your PDF template file',
    icon: <Upload className="h-5 w-5" />
  },
  {
    id: 'styling',
    title: 'Styling & Design',
    description: 'Configure colors, fonts, and visual elements',
    icon: <Palette className="h-5 w-5" />
  },
  {
    id: 'content-areas',
    title: 'Content Areas',
    description: 'Define editable regions and form mappings',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'metadata',
    title: 'Metadata & Tags',
    description: 'Add tags, difficulty, and other metadata',
    icon: <Tag className="h-5 w-5" />
  },
  {
    id: 'preview',
    title: 'Preview & Test',
    description: 'Review and test your template',
    icon: <Eye className="h-5 w-5" />
  }
];

export const TemplateCreationWizard: React.FC<TemplateCreationWizardProps> = ({
  onSave,
  onCancel,
  initialTemplate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [templateData, setTemplateData] = useState<Partial<PDFTemplate>>(
    initialTemplate || {
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
      },
      contentAreas: []
    }
  );

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const updateTemplateData = (updates: Partial<PDFTemplate>) => {
    setTemplateData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addContentArea = () => {
    const newArea: PDFContentArea = {
      id: `area-${Date.now()}`,
      name: '',
      formField: '',
      coordinates: { x: 0, y: 0, width: 100, height: 30, page: 1 },
      styling: { fontSize: 12, fontFamily: 'Arial', fontWeight: 'normal', color: '#000000' },
      isRequired: false,
      placeholder: ''
    };
    updateTemplateData({
      contentAreas: [...(templateData.contentAreas || []), newArea]
    });
  };

  const updateContentArea = (index: number, updates: Partial<PDFContentArea>) => {
    const updatedAreas = [...(templateData.contentAreas || [])];
    updatedAreas[index] = { ...updatedAreas[index], ...updates };
    updateTemplateData({ contentAreas: updatedAreas });
  };

  const removeContentArea = (index: number) => {
    const updatedAreas = (templateData.contentAreas || []).filter((_, i) => i !== index);
    updateTemplateData({ contentAreas: updatedAreas });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(templateData);
    }
  };

  const renderStepContent = () => {
    const step = wizardSteps[currentStep];
    
    switch (step.id) {
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={templateData.name || ''}
                onChange={(e) => updateTemplateData({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter template name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={templateData.description || ''}
                onChange={(e) => updateTemplateData({ description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your template"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={templateData.category || 'professional'}
                onChange={(e) => updateTemplateData({ category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {resumeTemplateCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload PDF Template
              </h3>
              <p className="text-gray-600 mb-4">
                Choose a PDF file to use as your template
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>
            
            {uploadedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-800">
                    {uploadedFile.name} uploaded successfully
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'styling':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Scheme
              </label>
              <select
                value={templateData.metadata?.colorScheme || 'professional'}
                onChange={(e) => updateTemplateData({
                  metadata: { ...templateData.metadata, colorScheme: e.target.value }
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Size
              </label>
              <select
                value={templateData.metadata?.pageSize || 'a4'}
                onChange={(e) => updateTemplateData({
                  metadata: { ...templateData.metadata, pageSize: e.target.value }
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientation
              </label>
              <select
                value={templateData.metadata?.orientation || 'portrait'}
                onChange={(e) => updateTemplateData({
                  metadata: { ...templateData.metadata, orientation: e.target.value }
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>
        );

      case 'content-areas':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Content Areas
              </h3>
              <Button
                onClick={addContentArea}
                icon={<Plus className="h-4 w-4" />}
                size="sm"
              >
                Add Area
              </Button>
            </div>
            
            <div className="space-y-4">
              {(templateData.contentAreas || []).map((area, index) => (
                <Card key={area.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Content Area {index + 1}
                      </h4>
                      <Button
                        onClick={() => removeContentArea(index)}
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={area.name}
                          onChange={(e) => updateContentArea(index, { name: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Form Field
                        </label>
                        <input
                          type="text"
                          value={area.formField}
                          onChange={(e) => updateContentArea(index, { formField: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {templateData.contentAreas?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No content areas defined yet</p>
                <p className="text-sm">Click "Add Area" to start defining editable regions</p>
              </div>
            )}
          </div>
        );

      case 'metadata':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={templateData.tags?.join(', ') || ''}
                onChange={(e) => updateTemplateData({
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tags separated by commas"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={templateData.metadata?.difficulty || 'beginner'}
                onChange={(e) => updateTemplateData({
                  metadata: { ...templateData.metadata, difficulty: e.target.value }
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Template Preview
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{templateData.name || 'Not set'}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                  <span className="ml-2 text-gray-900">{templateData.description || 'Not set'}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-900">{templateData.category || 'Not set'}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Content Areas:</span>
                  <span className="ml-2 text-gray-900">{templateData.contentAreas?.length || 0}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">File:</span>
                  <span className="ml-2 text-gray-900">{uploadedFile?.name || 'Not uploaded'}</span>
                </div>
              </div>
            </div>
            
            {previewUrl && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  PDF Preview
                </h3>
                <iframe
                  src={previewUrl}
                  className="w-full h-96 border border-gray-300 rounded-lg"
                  title="PDF Preview"
                />
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Template Creation Wizard
        </h1>
        <p className="text-gray-600">
          Step {currentStep + 1} of {wizardSteps.length}: {wizardSteps[currentStep].title}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {wizardSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < wizardSteps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          variant="outline"
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        
        <div className="flex space-x-3">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
            >
              Cancel
            </Button>
          )}
          
          {currentStep === wizardSteps.length - 1 ? (
            <Button
              onClick={handleSave}
              icon={<Save className="h-4 w-4" />}
            >
              Create Template
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
