import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Star, 
  Download, 
  RefreshCw, 
  X,
  Briefcase,
  GraduationCap,
  Code,
  Users,
  Lightbulb
} from 'lucide-react';

interface JobDescriptionAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeContent: string;
  profession?: string;
}

interface JobAnalysisResult {
  job_title: string;
  company: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_requirements: {
    years: number;
    text: string;
  };
  education_requirements: {
    level: string;
    text: string;
  };
  industry: string;
  key_responsibilities: string[];
  match_analysis: {
    overall_match_percentage: number;
    required_skills_match: number;
    preferred_skills_match: number;
    matched_required_skills: string[];
    matched_preferred_skills: string[];
    missing_required_skills: string[];
    missing_preferred_skills: string[];
  };
  optimization_suggestions: string[];
  keyword_gaps: string[];
  resume_optimization: {
    keyword_additions: string[];
    content_enhancements: string[];
    structure_improvements: string[];
    formatting_suggestions: string[];
  };
}

const FranciscaJobDescriptionAnalyzer: React.FC<JobDescriptionAnalyzerProps> = ({
  isOpen, onClose, resumeContent, profession
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performJobAnalysis = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/francisca/job-description-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          resume_content: resumeContent
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.result.analysis);
      } else {
        setError(data.error || 'Failed to analyze job description');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Job analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getMatchColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Job Description Analyzer</h2>
              <p className="text-sm text-gray-600">Analyze job descriptions and optimize your resume</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Input */}
          <div className="w-1/2 p-6 border-r border-gray-200 flex flex-col">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to analyze requirements and get optimization suggestions..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={performJobAnalysis}
                disabled={isLoading || !jobDescription.trim()}
                className={`flex-1 px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2 ${
                  isLoading || !jobDescription.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
                <span>{isLoading ? 'Analyzing...' : 'Analyze Job Description'}</span>
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Analyzing job description...</p>
                  <p className="text-sm text-gray-500">This may take a few moments</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Job Overview */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Job Overview</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Position:</span>
                      <p className="text-gray-900">{analysis.job_title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Company:</span>
                      <p className="text-gray-900">{analysis.company}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Industry:</span>
                      <p className="text-gray-900 capitalize">{analysis.industry}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Experience:</span>
                      <p className="text-gray-900">{analysis.experience_requirements?.text || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Match Score */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Resume Match Score</h3>
                    {getScoreIcon(analysis.match_analysis.overall_match_percentage)}
                  </div>
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.match_analysis.overall_match_percentage)}`}>
                      {Math.round(analysis.match_analysis.overall_match_percentage)}%
                    </div>
                    <p className="text-sm text-gray-600">Overall Match</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Required Skills</span>
                        <span>{Math.round(analysis.match_analysis.required_skills_match)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getMatchColor(analysis.match_analysis.required_skills_match)}`}
                          style={{ width: `${analysis.match_analysis.required_skills_match}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Preferred Skills</span>
                        <span>{Math.round(analysis.match_analysis.preferred_skills_match)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getMatchColor(analysis.match_analysis.preferred_skills_match)}`}
                          style={{ width: `${analysis.match_analysis.preferred_skills_match}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Matched Skills</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Required:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.match_analysis.matched_required_skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Preferred:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.match_analysis.matched_preferred_skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-gray-900">Missing Skills</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Required:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.match_analysis.missing_required_skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Preferred:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.match_analysis.missing_preferred_skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimization Suggestions */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-900">Optimization Suggestions</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.optimization_suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Responsibilities */}
                {analysis.key_responsibilities.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Users className="h-5 w-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">Key Responsibilities</h4>
                    </div>
                    <ul className="space-y-1">
                      {analysis.key_responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Ready to Analyze</p>
                  <p className="text-sm text-gray-500">Paste a job description and click analyze to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranciscaJobDescriptionAnalyzer;























