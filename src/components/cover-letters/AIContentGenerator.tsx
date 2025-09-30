import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Sparkles, 
  Lightbulb, 
  Edit3, 
  Wand2, 
  RefreshCw, 
  Copy, 
  CheckCircle2,
  HelpCircle,
  Target,
  Users,
  Building,
  Heart,
  Star,
  Zap,
  Brain,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface AIContentGeneratorProps {
  paragraphType: 'introduction' | 'experience' | 'companyFit' | 'closing';
  currentContent: string;
  onContentUpdate: (content: string) => void;
  jobTitle: string;
  companyName: string;
  userData: {
    name: string;
    experience: string;
    skills: string[];
    achievements: string[];
    motivation: string;
  };
  onClose: () => void;
}

interface AISuggestion {
  id: string;
  content: string;
  reasoning: string;
  tone: string;
  keywords: string[];
}

const paragraphGuidance = {
  introduction: {
    title: 'Opening Paragraph',
    icon: Heart,
    description: 'Express your interest and position yourself as the ideal candidate',
    tips: [
      'Start with enthusiasm and specific interest in the role',
      'Mention how you found the job posting',
      'Briefly state your most relevant qualification',
      'Keep it concise (2-3 sentences)',
      'Use action words and confident language'
    ],
    aiPrompt: 'Write an engaging opening paragraph that expresses genuine interest in the [JOB_TITLE] position at [COMPANY_NAME]. Include how you discovered the opportunity and highlight your most relevant qualification in 2-3 sentences.'
  },
  experience: {
    title: 'Experience Paragraph',
    icon: Star,
    description: 'Highlight your most relevant experience and achievements',
    tips: [
      'Focus on 1-2 most relevant experiences',
      'Use specific examples and quantifiable results',
      'Connect your experience to job requirements',
      'Show progression and growth',
      'Use the STAR method (Situation, Task, Action, Result)'
    ],
    aiPrompt: 'Write a compelling experience paragraph for a [JOB_TITLE] position. Highlight your most relevant work experience, include specific achievements with numbers, and connect your skills to the job requirements. Use the STAR method.'
  },
  companyFit: {
    title: 'Company Fit Paragraph',
    icon: Building,
    description: 'Demonstrate knowledge of the company and cultural fit',
    tips: [
      'Show research about the company',
      'Mention specific company values or mission',
      'Connect your values to theirs',
      'Reference recent company news or projects',
      'Express genuine enthusiasm for their work'
    ],
    aiPrompt: 'Write a company fit paragraph that demonstrates your knowledge of [COMPANY_NAME] and shows how your values align with theirs. Include specific details about the company and express genuine enthusiasm for their mission.'
  },
  closing: {
    title: 'Closing Paragraph',
    icon: CheckCircle2,
    description: 'End with a strong call to action and professional closing',
    tips: [
      'Summarize your key qualifications briefly',
      'Express confidence in your ability',
      'Request an interview or next steps',
      'Thank them for their consideration',
      'End with a professional closing'
    ],
    aiPrompt: 'Write a strong closing paragraph for a cover letter. Summarize your key qualifications, express confidence in your ability to contribute, and request an interview. End professionally.'
  }
};

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  paragraphType,
  currentContent,
  onContentUpdate,
  jobTitle,
  companyName,
  userData,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showGuidance, setShowGuidance] = useState(true);
  const [userPrompt, setUserPrompt] = useState('');
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);
  const [copiedSuggestion, setCopiedSuggestion] = useState<string | null>(null);

  const guidance = paragraphGuidance[paragraphType];
  const IconComponent = guidance.icon;

  const generateAISuggestions = async (customPrompt?: string) => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        // If no token, show mock suggestions instead of failing
        console.log('No authentication token found, using mock suggestions');
        const mockSuggestions: AISuggestion[] = [
          {
            id: '1',
            content: `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. Having discovered this opportunity through [job board/company website], I am excited about the chance to contribute my expertise in ${userData.skills?.slice(0, 2).join(' and ') || 'relevant skills'} to your innovative team. With my proven track record in ${userData.experience || 'relevant experience'}, I am confident that I can make a meaningful impact in this role.`,
            reasoning: 'Professional tone with specific details and confidence',
            tone: 'Professional',
            keywords: ['interest', 'expertise', 'proven track record', 'meaningful impact']
          },
          {
            id: '2',
            content: `I am thrilled to apply for the ${jobTitle} position at ${companyName}. Your company's commitment to [specific company value] resonates deeply with my professional values and career aspirations. My experience in ${userData.experience || 'relevant field'} has equipped me with the skills necessary to excel in this role and contribute to your team's continued success.`,
            reasoning: 'Enthusiastic tone with company research and value alignment',
            tone: 'Enthusiastic',
            keywords: ['thrilled', 'commitment', 'resonates', 'equipped', 'excel']
          },
          {
            id: '3',
            content: `I am excited to submit my application for the ${jobTitle} role at ${companyName}. Having followed your company's recent achievements in [specific area], I am impressed by your innovative approach and would be honored to contribute my ${userData.skills?.[0] || 'expertise'} to your dynamic team.`,
            reasoning: 'Concise and focused with company knowledge',
            tone: 'Confident',
            keywords: ['excited', 'achievements', 'innovative', 'honored', 'expertise']
          }
        ];
        setSuggestions(mockSuggestions);
        setIsGenerating(false);
        return;
      }
      
      const response = await fetch('/api/ai/paragraph-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paragraph_type: paragraphType,
          job_title: jobTitle,
          company_name: companyName,
          user_data: userData,
          custom_prompt: customPrompt || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to generate suggestions: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data.suggestions);
      } else {
        throw new Error(data.message || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Fallback to mock suggestions if API fails
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          content: `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. Having discovered this opportunity through [job board/company website], I am excited about the chance to contribute my expertise in ${userData.skills.slice(0, 2).join(' and ')} to your innovative team. With my proven track record in ${userData.experience}, I am confident that I can make a meaningful impact in this role.`,
          reasoning: 'Professional tone with specific details and confidence',
          tone: 'Professional',
          keywords: ['interest', 'expertise', 'proven track record', 'meaningful impact']
        },
        {
          id: '2',
          content: `I am thrilled to apply for the ${jobTitle} position at ${companyName}. Your company's commitment to [specific company value] resonates deeply with my professional values and career aspirations. My experience in ${userData.experience} has equipped me with the skills necessary to excel in this role and contribute to your team's continued success.`,
          reasoning: 'Enthusiastic tone with company research and value alignment',
          tone: 'Enthusiastic',
          keywords: ['thrilled', 'commitment', 'resonates', 'equipped', 'excel']
        },
        {
          id: '3',
          content: `I am excited to submit my application for the ${jobTitle} role at ${companyName}. Having followed your company's recent achievements in [specific area], I am impressed by your innovative approach and would be honored to contribute my ${userData.skills[0]} expertise to your dynamic team.`,
          reasoning: 'Concise and focused with company knowledge',
          tone: 'Confident',
          keywords: ['excited', 'achievements', 'innovative', 'honored', 'expertise']
        }
      ];
      setSuggestions(mockSuggestions);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    setSelectedSuggestion(suggestion.id);
    onContentUpdate(suggestion.content);
  };

  const handleCopySuggestion = (suggestionId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSuggestion(suggestionId);
    setTimeout(() => setCopiedSuggestion(null), 2000);
  };

  const handleCustomPrompt = () => {
    if (userPrompt.trim()) {
      generateAISuggestions(userPrompt);
      setIsCustomPrompt(false);
    }
  };

  const handleRegenerate = () => {
    generateAISuggestions();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconComponent className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">{guidance.title}</h2>
                <p className="text-blue-100">{guidance.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Authentication Notice */}
        {!localStorage.getItem('token') && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <HelpCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> You're not logged in, so you're seeing sample suggestions. 
                  <a href="/login" className="underline ml-1">Log in</a> to get personalized AI-powered suggestions.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Guidance and Current Content */}
            <div className="space-y-6">
              {/* Writing Guidance */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    Writing Guidance
                  </h3>
                  <button
                    onClick={() => setShowGuidance(!showGuidance)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showGuidance ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showGuidance && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Key Tips:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {guidance.tips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Current Content Editor */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-blue-500" />
                  Your Paragraph
                </h3>
                <textarea
                  value={currentContent}
                  onChange={(e) => onContentUpdate(e.target.value)}
                  placeholder={`Write your ${guidance.title.toLowerCase()} here...`}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                <div className="mt-2 text-sm text-gray-500">
                  {currentContent.length} characters
                </div>
              </Card>
            </div>

            {/* Right Column - AI Suggestions */}
            <div className="space-y-6">
              {/* AI Generation Controls */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  AI Content Generator
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Prompt (Optional)
                    </label>
                    <textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Describe what you want the AI to focus on in this paragraph..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => generateAISuggestions()}
                      disabled={isGenerating}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate AI Suggestions
                        </>
                      )}
                    </Button>
                    
                    {userPrompt.trim() && (
                      <Button
                        onClick={handleCustomPrompt}
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Use Custom Prompt
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">AI Suggestions</h3>
                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                  
                  {suggestions.map((suggestion) => (
                    <Card
                      key={suggestion.id}
                      className={`p-4 transition-all ${
                        selectedSuggestion === suggestion.id
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {suggestion.tone}
                              </span>
                              <span className="text-sm text-gray-500">
                                {suggestion.keywords.length} keywords
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {suggestion.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 italic">
                              {suggestion.reasoning}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleSuggestionSelect(suggestion)}
                            size="sm"
                            className="flex-1"
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Use This
                          </Button>
                          <Button
                            onClick={() => handleCopySuggestion(suggestion.id, suggestion.content)}
                            variant="outline"
                            size="sm"
                          >
                            {copiedSuggestion === suggestion.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Paragraph
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
