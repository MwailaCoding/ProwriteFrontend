import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Wand2, 
  Lightbulb, 
  Copy, 
  Check, 
  Loader2,
  ArrowRight,
  Star,
  Zap,
  Brain,
  TrendingUp
} from 'lucide-react';
import { Button } from '../common/Button';
import { aiService } from '../../services/aiService';

interface RealAIEnhancerProps {
  fieldType: 'summary' | 'experience' | 'skills' | 'education';
  currentValue: string;
  onEnhance: (enhancedValue: string) => void;
  industry: string;
  placeholder?: string;
}

interface EnhancementResult {
  id: string;
  enhancedContent: string;
  improvements: string[];
  suggestions: string[];
  confidence: number;
  reasoning: string;
}

const RealAIEnhancer: React.FC<RealAIEnhancerProps> = ({ 
  fieldType, 
  currentValue, 
  onEnhance, 
  industry,
  placeholder 
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const fieldConfig = {
    summary: {
      title: 'Professional Summary',
      icon: '📝',
      description: 'AI-powered summary enhancement with industry-specific keywords'
    },
    experience: {
      title: 'Work Experience',
      icon: '💼',
      description: 'AI-enhanced experience descriptions with quantifiable achievements'
    },
    skills: {
      title: 'Skills & Technologies',
      icon: '🛠️',
      description: 'AI-optimized skills with trending technologies and proficiency levels'
    },
    education: {
      title: 'Education',
      icon: '🎓',
      description: 'AI-enhanced education section with relevant achievements and projects'
    }
  };

  const config = fieldConfig[fieldType];

  const enhanceContent = async () => {
    if (!currentValue.trim()) {
      alert('Please enter some content to enhance');
      return;
    }

    setIsEnhancing(true);
    setShowResult(false);
    
    try {
      // REAL AI enhancement using OpenAI/Anthropic
      const result = await aiService.enhanceContent(currentValue, fieldType, industry);
      
      const enhancement: EnhancementResult = {
        id: `enhancement_${Date.now()}`,
        enhancedContent: result.enhancedContent,
        improvements: result.improvements,
        suggestions: result.suggestions,
        confidence: result.confidence,
        reasoning: `AI analyzed your ${fieldType} and made ${result.improvements.length} specific improvements with ${Math.round(result.confidence * 100)}% confidence.`
      };
      
      setEnhancementResult(enhancement);
      setShowResult(true);
    } catch (error) {
      console.error('AI enhancement failed:', error);
      alert('AI enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(false);
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

  const applyEnhancement = () => {
    if (enhancementResult) {
      onEnhance(enhancementResult.enhancedContent);
      setShowResult(false);
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
    <div className="relative">
      {/* AI Enhancement Button */}
      <div className="flex items-center space-x-2 mb-3">
        <Button
          onClick={enhanceContent}
          disabled={isEnhancing || !currentValue.trim()}
          variant="outline"
          size="sm"
          icon={isEnhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
        >
          {isEnhancing ? 'AI Enhancing...' : 'AI Enhance'}
        </Button>
        
        {currentValue.trim() && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>{config.icon}</span>
            <span>{config.title}</span>
          </div>
        )}
      </div>

      {/* Enhancement Result */}
      <AnimatePresence>
        {showResult && enhancementResult && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-500" />
                AI Enhancement Results
              </h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBgColor(enhancementResult.confidence)} ${getConfidenceColor(enhancementResult.confidence)}`}>
                  {Math.round(enhancementResult.confidence * 100)}% Confidence
                </span>
                <Button
                  onClick={() => setShowResult(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Enhanced Content:</h5>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {enhancementResult.enhancedContent}
                </p>
              </div>
            </div>

            {/* Improvements Made */}
            {enhancementResult.improvements.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Improvements Made:
                </h5>
                <ul className="space-y-1">
                  {enhancementResult.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Suggestions */}
            {enhancementResult.suggestions.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                  Additional Suggestions:
                </h5>
                <ul className="space-y-1">
                  {enhancementResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">💡</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Reasoning */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                AI Analysis:
              </h5>
              <p className="text-sm text-blue-700">{enhancementResult.reasoning}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                onClick={() => copyToClipboard(enhancementResult.enhancedContent)}
                variant="ghost"
                size="sm"
                icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                className="text-gray-600 hover:text-gray-800"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              
              <Button
                onClick={applyEnhancement}
                size="sm"
                icon={<ArrowRight className="h-4 w-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Enhancement
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Field Description */}
      <div className="text-xs text-gray-500 mt-2">
        {config.description}
      </div>
    </div>
  );
};

export default RealAIEnhancer;









