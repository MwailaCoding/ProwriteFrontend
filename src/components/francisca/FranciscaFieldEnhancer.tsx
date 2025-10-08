import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, X, Copy, RotateCcw } from 'lucide-react';
import api from '../../config/api';

interface ProwriteTemplateFieldEnhancerProps {
  fieldType: string;
  currentValue: string;
  profession?: string;
  onEnhance: (enhancedValue: string) => void;
  onRevert?: () => void;
  className?: string;
  atsFocus?: boolean; // New prop for ATS focus
}

interface EnhancementResult {
  success: boolean;
  original_content: string;
  enhanced_content: string;
  field_type: string;
  profession?: string;
  improvements: string[];
  confidence: number;
  ats_score?: number;
  ats_focus?: boolean;
}

const ProwriteTemplateFieldEnhancer: React.FC<ProwriteTemplateFieldEnhancerProps> = ({
  fieldType,
  currentValue,
  profession,
  onEnhance,
  onRevert,
  className = '',
  atsFocus = true // Default to ATS focus
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [copied, setCopied] = useState(false);

  const fieldConfig = {
    activities: {
      title: 'Activities',
      description: 'Academic and extracurricular activities',
      icon: '🎓'
    },
    coursework: {
      title: 'Coursework',
      description: 'Relevant academic coursework and projects',
      icon: '📚'
    },
    degree: {
      title: 'Degree',
      description: 'Academic degree and major',
      icon: '🎯'
    },
    institution: {
      title: 'Institution',
      description: 'Educational institution name',
      icon: '🏛️'
    },
    responsibilities: {
      title: 'Responsibilities',
      description: 'Job responsibilities and duties',
      icon: '💼'
    },
    position: {
      title: 'Position',
      description: 'Job title and role',
      icon: '👔'
    },
    company: {
      title: 'Company',
      description: 'Company or organization name',
      icon: '🏢'
    },
    achievements: {
      title: 'Achievements',
      description: 'Professional achievements and accomplishments',
      icon: '🏆'
    },
    role: {
      title: 'Role',
      description: 'Leadership role and position',
      icon: '👑'
    },
    organization: {
      title: 'Organization',
      description: 'Organization or group name',
      icon: '🤝'
    }
  };

  const config = fieldConfig[fieldType as keyof typeof fieldConfig] || {
    title: fieldType,
    description: 'Field enhancement',
    icon: '✨'
  };

  const enhanceField = async () => {
    if (!currentValue.trim()) {
      alert('Please enter some content to enhance');
      return;
    }

    setIsEnhancing(true);
    setShowPreview(false);
    setEnhancementResult(null);

    try {
      const response = await api.post('/prowrite-template/ai/enhance-field', {
        content: currentValue,
        field_type: fieldType,
        profession: profession,
        ats_focus: atsFocus
      });

      const data = response.data;

      if (data.success) {
        setEnhancementResult(data.result);
        setShowPreview(true);
      } else {
        throw new Error(data.error || 'Enhancement failed');
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
      alert('AI enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyEnhancement = () => {
    if (enhancementResult) {
      onEnhance(enhancementResult.enhanced_content);
      setShowPreview(false);
      setEnhancementResult(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100';
    if (confidence >= 0.7) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`relative ${className}`}>
      {/* AI Enhancement Button */}
      <button
        onClick={enhanceField}
        disabled={isEnhancing}
        className={`
          absolute top-2 right-2 p-2 rounded-lg transition-all duration-200
          ${isEnhancing 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:shadow-lg'
          }
          transform hover:scale-105 active:scale-95
        `}
        title={`Enhance ${config.title} with AI${atsFocus ? ' (ATS Focused)' : ''}`}
      >
        {isEnhancing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </button>

      {/* Enhancement Preview Modal */}
      {showPreview && enhancementResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Enhanced {config.title}
                  </h3>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Confidence Score and ATS Score */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${getConfidenceBgColor(enhancementResult.confidence)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">AI Confidence</span>
                    <span className={`text-sm font-bold ${getConfidenceColor(enhancementResult.confidence)}`}>
                      {Math.round(enhancementResult.confidence * 100)}%
                    </span>
                  </div>
                </div>
                
                {enhancementResult.ats_score !== undefined && (
                  <div className={`p-3 rounded-lg ${getConfidenceBgColor(enhancementResult.ats_score / 100)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">ATS Score</span>
                      <span className={`text-sm font-bold ${getConfidenceColor(enhancementResult.ats_score / 100)}`}>
                        {enhancementResult.ats_score}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Original vs Enhanced */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Original</h4>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">{enhancementResult.original_content}</p>
                  </div>
                </div>

                {/* Enhanced */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Enhanced</h4>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-800">{enhancementResult.enhanced_content}</p>
                  </div>
                </div>
              </div>

              {/* Improvements */}
              {enhancementResult.improvements && enhancementResult.improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Improvements Made</h4>
                  <ul className="space-y-1">
                    {enhancementResult.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(enhancementResult.enhanced_content)}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {onRevert && (
                  <button
                    onClick={onRevert}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Revert
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyEnhancement}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                >
                  Apply Enhancement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProwriteTemplateFieldEnhancer;



