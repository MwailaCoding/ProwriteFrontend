import React, { useState } from 'react';
import { Search, Target, CheckCircle, AlertTriangle, Brain, Zap } from 'lucide-react';
import { aiService, ATSOptimizationResult } from '../../services/aiService';

interface ATSAnalysis {
  score: number;
  keywordMatch: number;
  formattingScore: number;
  contentScore: number;
  suggestions: string[];
  missingKeywords: string[];
  foundKeywords: string[];
  industryTrends: string[];
  optimizationTips: string[];
}

interface ATSTrackerProps {
  resumeContent: string;
  targetJobTitle: string;
  onAnalysisComplete?: (analysis: ATSAnalysis) => void;
}

const ATSTracker: React.FC<ATSTrackerProps> = ({
  resumeContent,
  targetJobTitle,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeATS = async () => {
    if (!resumeContent.trim() || !targetJobTitle.trim()) {
      alert('Please provide resume content and target job title');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // REAL AI Analysis using OpenAI/Anthropic
      const atsAnalysis = await aiService.analyzeATSCompatibility(
        resumeContent, 
        targetJobTitle, 
        'Software Development' // Default industry, can be made configurable
      );
      
      setAnalysis(atsAnalysis);
      onAnalysisComplete?.(atsAnalysis);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      alert('AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Remove the old generateATSAnalysis function since we're using real AI now

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">ATS Optimization Tracker</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Job Title: {targetJobTitle}
        </label>
      </div>

      <button
        onClick={analyzeATS}
        disabled={isAnalyzing || !resumeContent.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze ATS Compatibility'}
      </button>

      {analysis && (
        <div className="mt-6 space-y-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{analysis.score}%</div>
            <div className="text-sm text-gray-600">ATS Compatibility Score</div>
            <div className="text-xs text-gray-500 mt-1">Powered by AI</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{analysis.keywordMatch}%</div>
              <div className="text-xs text-gray-600">Keyword Match</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{analysis.formattingScore}%</div>
              <div className="text-xs text-gray-600">Formatting</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{analysis.contentScore}%</div>
              <div className="text-xs text-gray-600">Content Quality</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Found Keywords ({analysis.foundKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {analysis.foundKeywords.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Missing Keywords ({analysis.missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {analysis.missingKeywords.slice(0, 5).map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI Suggestions</h4>
            <ul className="space-y-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-700">• {suggestion}</li>
              ))}
            </ul>
          </div>

          {analysis.industryTrends && analysis.industryTrends.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-600" />
                Industry Trends
              </h4>
              <ul className="space-y-1">
                {analysis.industryTrends.map((trend, index) => (
                  <li key={index} className="text-sm text-gray-700">• {trend}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.optimizationTips && analysis.optimizationTips.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-orange-600" />
                Optimization Tips
              </h4>
              <ul className="space-y-1">
                {analysis.optimizationTips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-700">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATSTracker;
