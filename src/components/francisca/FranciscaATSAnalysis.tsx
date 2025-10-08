import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Star,
  Download,
  RefreshCw,
  X
} from 'lucide-react';

interface ATSAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  resumeContent: string;
  profession?: string;
  jobTitle?: string;
}

interface CategoryScore {
  category: string;
  score: number;
  weight: number;
  color: string;
}

interface ATSAnalysisResult {
  overall_score: number;
  category_scores: Record<string, number>;
  recommendations: string[];
  employability_rating: string;
  ats_compatibility: string;
  keyword_analysis: {
    total_keywords_found: number;
    relevant_keywords: string[];
    missing_keywords: string[];
    keyword_density: number;
    profession_match: number;
  };
  formatting_analysis: {
    has_complex_characters: boolean;
    has_standard_sections: number;
    word_count: number;
    character_count: number;
    has_email: boolean;
    has_phone: boolean;
  };
  content_analysis: {
    action_verbs_found: string[];
    action_verb_count: number;
    has_quantifiable_results: boolean;
    professional_tone: string;
    achievement_focused: string;
  };
}

const FranciscaATSAnalysis: React.FC<ATSAnalysisProps> = ({
  isOpen,
  onClose,
  resumeContent,
  profession,
  jobTitle
}) => {
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && resumeContent) {
      performATSAnalysis();
    }
  }, [isOpen, resumeContent]);

  const performATSAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/francisca/ats-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          profession: profession,
          job_title: jobTitle
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.result.analysis);
      } else {
        throw new Error(data.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('ATS Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze resume');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Star className="h-5 w-5 text-green-600" />;
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-orange-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getEmployabilityColor = (rating: string): string => {
    if (rating.includes('Excellent')) return 'text-green-600 bg-green-100';
    if (rating.includes('Very Good')) return 'text-green-600 bg-green-50';
    if (rating.includes('Good')) return 'text-blue-600 bg-blue-100';
    if (rating.includes('Fair')) return 'text-yellow-600 bg-yellow-100';
    if (rating.includes('Poor')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const categoryData: CategoryScore[] = analysis ? [
    { category: 'Keywords', score: analysis.category_scores.keywords || 0, weight: 0.25, color: 'bg-blue-500' },
    { category: 'Content Quality', score: analysis.category_scores.content_quality || 0, weight: 0.20, color: 'bg-green-500' },
    { category: 'Formatting', score: analysis.category_scores.formatting || 0, weight: 0.15, color: 'bg-purple-500' },
    { category: 'Structure', score: analysis.category_scores.structure || 0, weight: 0.15, color: 'bg-orange-500' },
    { category: 'Completeness', score: analysis.category_scores.completeness || 0, weight: 0.15, color: 'bg-pink-500' },
    { category: 'Optimization', score: analysis.category_scores.optimization || 0, weight: 0.10, color: 'bg-indigo-500' }
  ] : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">ATS Analysis & Employability Score</h3>
              <p className="text-sm text-blue-100">How well your resume performs in automated screening systems</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Analyzing your resume...</p>
                <p className="text-sm text-gray-500">Checking ATS compatibility and employability factors</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Analysis Failed</p>
                <p className="text-sm text-gray-500">{error}</p>
                <button
                  onClick={performATSAnalysis}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Overall ATS Score</h4>
                    <p className="text-sm text-gray-600">How well your resume will perform in automated screening</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.overall_score)} px-4 py-2 rounded-lg`}>
                      {Math.round(analysis.overall_score)}%
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      {getScoreIcon(analysis.overall_score)}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {analysis.ats_compatibility}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Employability Rating */}
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-700">Employability Rating:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getEmployabilityColor(analysis.employability_rating)}`}>
                      {analysis.employability_rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Scores */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryData.map((category) => (
                    <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{category.category}</span>
                        <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                          {Math.round(category.score)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color}`}
                          style={{ width: `${category.score}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Weight: {Math.round(category.weight * 100)}%</span>
                        {getScoreIcon(category.score)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyword Analysis */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Keyword Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Found Keywords</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyword_analysis.relevant_keywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Total: {analysis.keyword_analysis.total_keywords_found} keywords found
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Missing Keywords</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyword_analysis.missing_keywords.slice(0, 8).map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    {analysis.keyword_analysis.missing_keywords.length > 8 && (
                      <p className="text-sm text-gray-500 mt-2">
                        +{analysis.keyword_analysis.missing_keywords.length - 8} more missing
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(analysis.keyword_analysis.profession_match * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Profession Match</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.keyword_analysis.keyword_density.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Keyword Density</div>
                  </div>
                </div>
              </div>

              {/* Content Quality */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Content Quality</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.content_analysis.action_verb_count}
                    </div>
                    <div className="text-sm text-gray-600">Action Verbs</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.content_analysis.has_quantifiable_results ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Quantifiable Results</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {analysis.content_analysis.professional_tone}
                    </div>
                    <div className="text-sm text-gray-600">Professional Tone</div>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Achievement Focus</h5>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.content_analysis.achievement_focused === 'Achievement-Focused' 
                      ? 'bg-green-100 text-green-800'
                      : analysis.content_analysis.achievement_focused === 'Some Achievements'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {analysis.content_analysis.achievement_focused}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Improvement Recommendations</h4>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formatting Analysis */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Formatting Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-700">
                      {analysis.formatting_analysis.word_count}
                    </div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-700">
                      {analysis.formatting_analysis.has_standard_sections}/3
                    </div>
                    <div className="text-sm text-gray-600">Sections</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-700">
                      {analysis.formatting_analysis.has_email ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Email</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-700">
                      {analysis.formatting_analysis.has_phone ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Phone</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Analysis based on industry-standard ATS compatibility criteria
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranciscaATSAnalysis;























