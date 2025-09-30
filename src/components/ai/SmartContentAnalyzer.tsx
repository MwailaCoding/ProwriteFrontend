import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Info,
  BarChart3,
  Zap
} from 'lucide-react';

interface ContentAnalysis {
  score: number;
  suggestions: string[];
  keywords: string[];
  readability: 'excellent' | 'good' | 'fair' | 'poor';
  impact: 'high' | 'medium' | 'low';
  industryMatch: number;
}

interface SmartContentAnalyzerProps {
  content: string;
  fieldType: 'summary' | 'experience' | 'skills' | 'education';
  onAnalysisComplete?: (analysis: ContentAnalysis) => void;
}

const SmartContentAnalyzer: React.FC<SmartContentAnalyzerProps> = ({
  content,
  fieldType,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (content.trim().length > 10) {
      analyzeContent();
    }
  }, [content, fieldType]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newAnalysis = generateAnalysis(content, fieldType);
    setAnalysis(newAnalysis);
    onAnalysisComplete?.(newAnalysis);
    setIsAnalyzing(false);
  };

  const generateAnalysis = (text: string, type: string): ContentAnalysis => {
    const words = text.toLowerCase().split(/\s+/);
    const charCount = text.length;
    const wordCount = words.length;
    
    // Calculate basic metrics
    let score = 0;
    const suggestions: string[] = [];
    const keywords: string[] = [];
    
    // Field-specific analysis
    if (type === 'summary') {
      // Summary analysis
      if (wordCount < 20) {
        suggestions.push('Consider expanding your summary to provide more context');
        score += 20;
      } else if (wordCount > 100) {
        suggestions.push('Your summary might be too long. Aim for 50-100 words');
        score += 30;
      } else {
        score += 40;
      }
      
      // Check for action verbs
      const actionVerbs = ['developed', 'implemented', 'managed', 'led', 'created', 'designed'];
      const hasActionVerbs = actionVerbs.some(verb => text.toLowerCase().includes(verb));
      if (hasActionVerbs) {
        score += 25;
        keywords.push('Action-oriented language');
      } else {
        suggestions.push('Use strong action verbs to make your summary more impactful');
      }
      
      // Check for quantifiable achievements
      const hasNumbers = /\d+/.test(text);
      if (hasNumbers) {
        score += 20;
        keywords.push('Quantifiable achievements');
      } else {
        suggestions.push('Include specific numbers and metrics to demonstrate impact');
      }
      
    } else if (type === 'experience') {
      // Experience analysis
      if (wordCount < 30) {
        suggestions.push('Provide more detail about your responsibilities and achievements');
        score += 15;
      } else if (wordCount > 150) {
        suggestions.push('Consider condensing your experience description');
        score += 25;
      } else {
        score += 35;
      }
      
      // Check for STAR method elements
      const hasContext = /at|with|for/.test(text.toLowerCase());
      const hasAction = /developed|implemented|managed|led|created/.test(text.toLowerCase());
      const hasResult = /result|improved|increased|decreased|achieved/.test(text.toLowerCase());
      
      if (hasContext && hasAction && hasResult) {
        score += 30;
        keywords.push('STAR method');
      } else {
        suggestions.push('Use the STAR method: Situation, Task, Action, Result');
      }
      
    } else if (type === 'skills') {
      // Skills analysis
      const skillCount = text.split(',').length;
      if (skillCount < 5) {
        suggestions.push('Consider adding more relevant skills to showcase your expertise');
        score += 20;
      } else if (skillCount > 15) {
        suggestions.push('Focus on the most relevant skills for your target role');
        score += 25;
      } else {
        score += 35;
      }
      
      // Check for skill categorization
      if (text.includes('(') || text.includes(':')) {
        score += 20;
        keywords.push('Organized skills');
      } else {
        suggestions.push('Group skills by category (e.g., "Programming: JavaScript, Python")');
      }
      
    } else if (type === 'education') {
      // Education analysis
      if (wordCount < 15) {
        suggestions.push('Include relevant coursework, projects, or achievements');
        score += 20;
      } else {
        score += 30;
      }
      
      // Check for relevant details
      const hasDegree = /bachelor|master|phd|associate|diploma/i.test(text);
      const hasInstitution = /university|college|school|institute/i.test(text);
      const hasYear = /\b(19|20)\d{2}\b/.test(text);
      
      if (hasDegree && hasInstitution && hasYear) {
        score += 25;
        keywords.push('Complete information');
      } else {
        suggestions.push('Include degree, institution, and graduation year');
      }
    }
    
    // General content quality
    if (charCount > 0) {
      const avgWordLength = charCount / wordCount;
      if (avgWordLength > 3 && avgWordLength < 8) {
        score += 15;
      } else {
        suggestions.push('Use clear, concise language');
      }
    }
    
    // Cap score at 100
    score = Math.min(score, 100);
    
    // Determine readability and impact
    let readability: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
    if (score >= 90) readability = 'excellent';
    else if (score >= 75) readability = 'good';
    else if (score >= 50) readability = 'fair';
    else readability = 'poor';
    
    let impact: 'high' | 'medium' | 'low' = 'medium';
    if (score >= 80) impact = 'high';
    else if (score >= 60) impact = 'medium';
    else impact = 'low';
    
    // Calculate industry match (simulated)
    const industryMatch = Math.min(score + Math.random() * 20, 100);
    
    return {
      score,
      suggestions,
      keywords,
      readability,
      impact,
      industryMatch: Math.round(industryMatch)
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-blue-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getReadabilityIcon = (readability: string) => {
    switch (readability) {
      case 'excellent': return '🎯';
      case 'good': return '✅';
      case 'fair': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return '🚀';
      case 'medium': return '📈';
      case 'low': return '📊';
      default: return '❓';
    }
  };

  if (!content.trim() || content.trim().length < 10) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h4 className="font-semibold text-gray-900">Smart Content Analysis</h4>
        </div>
        
        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {/* Score Display */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"
        >
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </div>
            <div className="text-xs text-gray-600">Overall Score</div>
          </div>
          
          {/* Readability */}
          <div className="text-center">
            <div className="text-2xl">{getReadabilityIcon(analysis.readability)}</div>
            <div className="text-xs text-gray-600 capitalize">{analysis.readability}</div>
          </div>
          
          {/* Impact */}
          <div className="text-center">
            <div className="text-2xl">{getImpactIcon(analysis.impact)}</div>
            <div className="text-xs text-gray-600 capitalize">{analysis.impact}</div>
          </div>
          
          {/* Industry Match */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analysis.industryMatch}%</div>
            <div className="text-xs text-gray-600">Industry Match</div>
          </div>
        </motion.div>
      )}

      {/* Analysis Details */}
      {analysis && (
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Keywords */}
              {analysis.keywords.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-green-600" />
                    Strengths
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                    Improvement Suggestions
                  </h5>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content Stats */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{content.length}</div>
                  <div className="text-xs text-gray-600">Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{content.split(/\s+/).length}</div>
                  <div className="text-xs text-gray-600">Words</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Toggle Details Button */}
      {analysis && (
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <Zap className="h-4 w-4" />
            <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
          </button>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="h-4 w-4 text-blue-600" />
          <h6 className="font-medium text-blue-800">Quick Tips</h6>
        </div>
        <div className="text-xs text-blue-700">
          {fieldType === 'summary' && 'Keep it concise, use action verbs, and include quantifiable achievements'}
          {fieldType === 'experience' && 'Use the STAR method and focus on results and impact'}
          {fieldType === 'skills' && 'Group by category and include proficiency levels'}
          {fieldType === 'education' && 'Highlight relevant coursework and academic achievements'}
        </div>
      </div>
    </div>
  );
};

export default SmartContentAnalyzer;









