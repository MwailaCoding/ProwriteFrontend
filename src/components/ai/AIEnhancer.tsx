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
  Zap
} from 'lucide-react';
import { Button } from '../common/Button';

interface AIEnhancerProps {
  fieldType: 'summary' | 'experience' | 'skills' | 'education';
  currentValue: string;
  onEnhance: (enhancedValue: string) => void;
  placeholder?: string;
}

interface EnhancementSuggestion {
  id: string;
  text: string;
  type: 'improvement' | 'alternative' | 'expansion';
  confidence: number;
  reasoning: string;
}

const AIEnhancer: React.FC<AIEnhancerProps> = ({ 
  fieldType, 
  currentValue, 
  onEnhance, 
  placeholder 
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fieldConfig = {
    summary: {
      title: 'Professional Summary',
      icon: '📝',
      prompt: 'Enhance this professional summary to be more compelling and impactful',
      examples: [
        'Add quantifiable achievements',
        'Include industry-specific keywords',
        'Make it more action-oriented'
      ]
    },
    experience: {
      title: 'Work Experience',
      icon: '💼',
      prompt: 'Improve this work experience description with specific achievements and metrics',
      examples: [
        'Add quantifiable results',
        'Use action verbs',
        'Include specific technologies used'
      ]
    },
    skills: {
      title: 'Skills & Technologies',
      icon: '🛠️',
      prompt: 'Enhance this skills section with relevant technologies and proficiency levels',
      examples: [
        'Group by category',
        'Add proficiency levels',
        'Include trending technologies'
      ]
    },
    education: {
      title: 'Education',
      icon: '🎓',
      prompt: 'Enhance this education section with relevant details and achievements',
      examples: [
        'Add relevant coursework',
        'Include academic achievements',
        'Mention relevant projects'
      ]
    }
  };

  const config = fieldConfig[fieldType];

  const enhanceContent = async () => {
    if (!currentValue.trim()) {
      alert('Please enter some content to enhance');
      return;
    }

    setIsEnhancing(true);
    try {
      // Simulate AI enhancement API call
      const enhancedSuggestions = await generateEnhancements(currentValue, fieldType);
      setSuggestions(enhancedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error enhancing content:', error);
      alert('Failed to enhance content. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateEnhancements = async (content: string, type: string): Promise<EnhancementSuggestion[]> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock enhancements based on field type
    const enhancements: EnhancementSuggestion[] = [];

    if (type === 'summary') {
      enhancements.push(
        {
          id: '1',
          text: content.replace(/I am/g, 'Results-driven professional with').replace(/\.$/, '') + ', consistently delivering measurable results and driving organizational success.',
          type: 'improvement',
          confidence: 0.95,
          reasoning: 'Added action-oriented language and quantifiable impact'
        },
        {
          id: '2',
          text: content + ' Leveraging cutting-edge technologies and industry best practices to solve complex challenges and exceed business objectives.',
          type: 'expansion',
          confidence: 0.88,
          reasoning: 'Expanded with technology focus and business impact'
        }
      );
    } else if (type === 'experience') {
      enhancements.push(
        {
          id: '1',
          text: content.replace(/\.$/, '') + ', resulting in 25% improvement in efficiency and $50K cost savings.',
          type: 'improvement',
          confidence: 0.92,
          reasoning: 'Added quantifiable achievements and metrics'
        },
        {
          id: '2',
          text: 'Led cross-functional team to ' + content.toLowerCase().replace(/^./, content[0].toLowerCase()),
          type: 'alternative',
          confidence: 0.85,
          reasoning: 'Reframed with leadership focus and team collaboration'
        }
      );
    } else if (type === 'skills') {
      const skillList = content.split(',').map(s => s.trim());
      const enhancedSkills = skillList.map(skill => {
        if (skill.includes('JavaScript')) return 'JavaScript (ES6+, React, Node.js)';
        if (skill.includes('Python')) return 'Python (Django, Flask, Data Analysis)';
        if (skill.includes('SQL')) return 'SQL (MySQL, PostgreSQL, Database Design)';
        return skill;
      });
      
      enhancements.push(
        {
          id: '1',
          text: enhancedSkills.join(', '),
          type: 'improvement',
          confidence: 0.90,
          reasoning: 'Added specific frameworks and proficiency context'
        }
      );
    }

    return enhancements;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const applyEnhancement = (suggestion: EnhancementSuggestion) => {
    onEnhance(suggestion.text);
    setShowSuggestions(false);
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
          {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
        </Button>
        
        {currentValue.trim() && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>{config.icon}</span>
            <span>{config.title}</span>
          </div>
        )}
      </div>

      {/* Enhancement Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Wand2 className="h-4 w-4 mr-2 text-purple-500" />
                AI Enhancement Suggestions
              </h4>
              <Button
                onClick={() => setShowSuggestions(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.type === 'improvement' ? 'bg-green-100 text-green-800' :
                        suggestion.type === 'alternative' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {suggestion.type === 'improvement' ? '✨ Improvement' :
                         suggestion.type === 'alternative' ? '🔄 Alternative' :
                         '📈 Expansion'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-800 mb-2">{suggestion.text}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 italic">
                      💡 {suggestion.reasoning}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => copyToClipboard(suggestion.text, suggestion.id)}
                        variant="ghost"
                        size="sm"
                        icon={copiedId === suggestion.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {copiedId === suggestion.id ? 'Copied!' : 'Copy'}
                      </Button>
                      
                      <Button
                        onClick={() => applyEnhancement(suggestion)}
                        size="sm"
                        icon={<ArrowRight className="h-4 w-4" />}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhancement Tips */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Enhancement Tips
              </h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                {config.examples.map((tip, index) => (
                  <li key={index} className="flex items-center">
                    <Zap className="h-3 w-3 mr-2 text-yellow-600" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIEnhancer;









