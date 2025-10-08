import React, { useState } from 'react';
import { Shield, Loader2, CheckCircle, X, Download, RotateCcw, Target, TrendingUp } from 'lucide-react';
import api from '../../config/api';

interface ATSDocumentEnhancerProps {
  resumeData: any;
  profession?: string;
  jobTitle?: string;
  onEnhance: (enhancedData: any) => void;
  onRevert?: () => void;
  className?: string;
}

interface ATSEnhancementResult {
  success: boolean;
  original_data: any;
  enhanced_data: any;
  overall_ats_score: number;
  profession?: string;
  job_title?: string;
  ats_improvements: string[];
}

const ATSDocumentEnhancer: React.FC<ATSDocumentEnhancerProps> = ({
  resumeData,
  profession,
  jobTitle,
  onEnhance,
  onRevert,
  className = ''
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<ATSEnhancementResult | null>(null);
  const [copied, setCopied] = useState(false);

  const enhanceDocument = async () => {
    if (!resumeData) {
      alert('Please provide resume data to enhance');
      return;
    }

    setIsEnhancing(true);
    setShowPreview(false);
    setEnhancementResult(null);

    try {
      const response = await api.post('/francisca/ai/enhance-ats-compliance', {
        resume_data: resumeData,
        profession: profession,
        job_title: jobTitle
      });

      const data = response.data;

      if (data.success) {
        setEnhancementResult(data.result);
        setShowPreview(true);
      } else {
        throw new Error(data.error || 'ATS enhancement failed');
      }
    } catch (error) {
      console.error('ATS enhancement failed:', error);
      alert('ATS enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyEnhancement = () => {
    if (enhancementResult) {
      onEnhance(enhancementResult.enhanced_data);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderFieldComparison = (fieldName: string, original: any, enhanced: any) => {
    if (typeof original === 'string' && typeof enhanced === 'string') {
      return (
        <div key={fieldName} className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 capitalize">{fieldName.replace('_', ' ')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">Original</h5>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">{original}</p>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">Enhanced</h5>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-800">{enhanced}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      {/* ATS Enhancement Button */}
      <button
        onClick={enhanceDocument}
        disabled={isEnhancing}
        className={`
          w-full p-4 rounded-lg transition-all duration-200
          ${isEnhancing 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-lg'
          }
          transform hover:scale-105 active:scale-95
        `}
        title="Enhance entire document for ATS compliance"
      >
        <div className="flex items-center justify-center space-x-2">
          {isEnhancing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Shield className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isEnhancing ? 'Enhancing for ATS...' : 'Enhance for ATS Compliance'}
          </span>
        </div>
      </button>

      {/* Enhancement Preview Modal */}
      {showPreview && enhancementResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    ATS Compliance Enhancement
                  </h3>
                  <p className="text-sm text-gray-600">
                    Document optimized for Applicant Tracking Systems
                  </p>
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
              {/* ATS Score */}
              <div className={`p-4 rounded-lg ${getScoreBgColor(enhancementResult.overall_ats_score)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span className="text-lg font-medium text-gray-700">Overall ATS Score</span>
                  </div>
                  <span className={`text-2xl font-bold ${getScoreColor(enhancementResult.overall_ats_score)}`}>
                    {enhancementResult.overall_ats_score}%
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {enhancementResult.overall_ats_score >= 80 
                    ? 'Excellent ATS compatibility' 
                    : enhancementResult.overall_ats_score >= 60 
                    ? 'Good ATS compatibility' 
                    : 'Needs improvement for ATS compatibility'
                  }
                </div>
              </div>

              {/* ATS Improvements */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  ATS Improvements Made
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enhancementResult.ats_improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Comparisons */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Enhanced Fields</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.keys(enhancementResult.enhanced_data).map(fieldName => {
                    const original = enhancementResult.original_data[fieldName];
                    const enhanced = enhancementResult.enhanced_data[fieldName];
                    return renderFieldComparison(fieldName, original, enhanced);
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(enhancementResult.enhanced_data, null, 2))}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy Data'}
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
                  className="px-6 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                >
                  Apply ATS Enhancement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSDocumentEnhancer;

