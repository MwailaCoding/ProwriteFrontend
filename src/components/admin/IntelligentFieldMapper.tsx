import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  FileText, 
  Settings, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface ContentArea {
  id: string;
  type: 'field' | 'section';
  page: number;
  bbox: number[];
  text: string;
  confidence: number;
  suggested_mapping: Record<string, string>;
  priority: 'high' | 'medium' | 'low';
  field_type?: string;
}

interface FieldMapperProps {
  templateId: string;
  onMappingComplete: (mapping: Record<string, any>) => void;
}

const IntelligentFieldMapper: React.FC<FieldMapperProps> = ({ templateId, onMappingComplete }) => {
  const [contentAreas, setContentAreas] = useState<ContentArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fieldMapping, setFieldMapping] = useState<Record<string, any>>({});
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContentAreas();
  }, [templateId]);

  const loadContentAreas = async () => {
    try {
      setLoading(true);
      // Load existing content areas if available
      const response = await fetch(`http://localhost:5000/api/admin/pdf-templates/${templateId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.content_areas) {
          setContentAreas(data.content_areas);
        }
      }
    } catch (error) {
      console.error('Error loading content areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTemplate = async () => {
    try {
      setAnalyzing(true);
      const response = await fetch(`http://localhost:5000/api/admin/pdf-templates/${templateId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContentAreas(data.content_areas || []);
        alert('Template analysis completed successfully!');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing template:', error);
      alert('Template analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const updateFieldMapping = (areaId: string, fieldPath: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [areaId]: fieldPath
    }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'personal_info': return '👤';
      case 'email': return '📧';
      case 'phone': return '📱';
      case 'location': return '📍';
      case 'summary': return '📝';
      case 'experience': return '💼';
      case 'education': return '🎓';
      case 'skills': return '🛠️';
      case 'projects': return '🚀';
      case 'certifications': return '🏆';
      default: return '📄';
    }
  };

  const handleMappingComplete = () => {
    onMappingComplete(fieldMapping);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content areas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Intelligent Field Mapping</h2>
            <p className="text-gray-600 mt-1">
              AI-powered content area detection and field mapping
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={analyzeTemplate}
              disabled={analyzing}
              icon={<Zap className="h-4 w-4" />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Template'}
            </Button>
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="outline"
              icon={<Eye className="h-4 w-4" />}
            >
              {previewMode ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Areas */}
      {contentAreas.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Areas Detected</h3>
          <p className="text-gray-600 mb-4">
            Click "Analyze Template" to detect content areas using AI
          </p>
          <Button onClick={analyzeTemplate} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Areas List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Detected Content Areas</h3>
            {contentAreas.map((area) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getFieldTypeIcon(area.field_type || 'text')}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{area.text}</h4>
                      <p className="text-sm text-gray-500">
                        {area.type === 'field' ? 'Form Field' : 'Section'} • Page {area.page}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(area.priority)}`}>
                      {area.priority}
                    </span>
                    <span className={`text-sm font-medium ${getConfidenceColor(area.confidence)}`}>
                      {Math.round(area.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Field Mapping */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Map to Form Field:
                  </label>
                  <select
                    value={fieldMapping[area.id] || ''}
                    onChange={(e) => updateFieldMapping(area.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a field...</option>
                    <option value="personalInfo.firstName">First Name</option>
                    <option value="personalInfo.lastName">Last Name</option>
                    <option value="personalInfo.email">Email</option>
                    <option value="personalInfo.phone">Phone</option>
                    <option value="personalInfo.location">Location</option>
                    <option value="summary">Professional Summary</option>
                    <option value="experience">Work Experience</option>
                    <option value="education">Education</option>
                    <option value="skills">Skills</option>
                    <option value="projects">Projects</option>
                    <option value="certifications">Certifications</option>
                    <option value="static">Static Content</option>
                  </select>
                </div>

                {/* Suggested Mapping */}
                {Object.keys(area.suggested_mapping).length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-800 font-medium mb-1">AI Suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(area.suggested_mapping).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Preview Panel */}
          {previewMode && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Mapping Preview</h3>
              <Card className="p-4">
                <div className="space-y-3">
                  {Object.entries(fieldMapping).map(([areaId, fieldPath]) => {
                    const area = contentAreas.find(a => a.id === areaId);
                    if (!area) return null;

                    return (
                      <div key={areaId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <span className="text-2xl">{getFieldTypeIcon(area.field_type || 'text')}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{area.text}</p>
                          <p className="text-xs text-gray-500">{fieldPath}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-blue-600 font-medium">
                          {fieldPath.split('.').pop() || fieldPath}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Button
                onClick={handleMappingComplete}
                disabled={Object.keys(fieldMapping).length === 0}
                className="w-full bg-green-600 hover:bg-green-700"
                icon={<CheckCircle className="h-4 w-4" />}
              >
                Complete Mapping
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      {contentAreas.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contentAreas.length}</div>
              <div className="text-sm text-gray-600">Total Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {contentAreas.filter(a => a.confidence >= 0.8).length}
              </div>
              <div className="text-sm text-gray-600">High Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {contentAreas.filter(a => a.type === 'field').length}
              </div>
              <div className="text-sm text-gray-600">Form Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {contentAreas.filter(a => a.type === 'section').length}
              </div>
              <div className="text-sm text-gray-600">Sections</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default IntelligentFieldMapper;









