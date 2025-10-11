import React, { useState } from 'react';
import { MessageSquare, Sparkles, Loader2, X, Copy, Check } from 'lucide-react';
import axios from 'axios';

interface ProwriteTemplateSmartPromptGeneratorProps {
  fieldType: string;
  profession?: string;
  onGenerateContent: (content: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ProwriteTemplateSmartPromptGenerator: React.FC<ProwriteTemplateSmartPromptGeneratorProps> = ({
  fieldType,
  profession,
  onGenerateContent,
  isOpen,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const fieldConfig = {
    activities: {
      title: 'Activities',
      description: 'Academic and extracurricular activities',
      examples: [
        'Write about my leadership roles in student organizations',
        'Describe my involvement in technical projects and hackathons',
        'Highlight my participation in academic competitions'
      ]
    },
    coursework: {
      title: 'Coursework',
      description: 'Relevant academic coursework and projects',
      examples: [
        'List my relevant technical courses and projects',
        'Describe my capstone project and its impact',
        'Highlight my research work and publications'
      ]
    },
    responsibilities: {
      title: 'Responsibilities',
      description: 'Job responsibilities and duties',
      examples: [
        'Write about my role in managing the development team',
        'Describe my responsibilities in project planning and execution',
        'Highlight my contributions to process improvements'
      ]
    },
    achievements: {
      title: 'Achievements',
      description: 'Professional achievements and accomplishments',
      examples: [
        'Write about my biggest project success and its impact',
        'Describe how I improved team productivity and efficiency',
        'Highlight my awards and recognition in the industry'
      ]
    }
  };

  const config = fieldConfig[fieldType as keyof typeof fieldConfig] || {
    title: fieldType,
    description: 'Field content generation',
    examples: ['Write about my experience in this field']
  };

  const professionContext = profession ? {
    software_engineer: 'Focus on technical skills, projects, and development achievements',
    marketing_manager: 'Emphasize campaigns, metrics, and brand management',
    sales_professional: 'Highlight revenue, client relationships, and sales achievements',
    healthcare_professional: 'Focus on patient care, procedures, and healthcare outcomes',
    finance_professional: 'Emphasize analysis, compliance, and financial results'
  }[profession] : '';

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt to generate content');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const response = await axios.post('/api/francisca/ai/generate-content', {
          prompt: prompt.trim(),
          field_type: fieldType,
          context: {
            profession: profession,
            profession_context: professionContext
          }
      });

      const data = response.data;

      if (data.success) {
        setGeneratedContent(data.result.generated_content);
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      alert('Content generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyContent = () => {
    if (generatedContent) {
      onGenerateContent(generatedContent);
      onClose();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Content Generator
              </h3>
              <p className="text-sm text-gray-600">
                Generate {config.title} content with AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Field Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{config.title}</h4>
            <p className="text-sm text-blue-700">{config.description}</p>
            {professionContext && (
              <p className="text-sm text-blue-600 mt-2">
                <strong>Profession Focus:</strong> {professionContext}
              </p>
            )}
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Tell AI what ${config.title.toLowerCase()} content you want to generate...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Example Prompts */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Example Prompts</h4>
            <div className="space-y-2">
              {config.examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-sm text-gray-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Content</span>
              </>
            )}
          </button>

          {/* Generated Content */}
          {generatedContent && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Generated Content</h4>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {generatedContent}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleApplyContent}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Apply to Field
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProwriteTemplateSmartPromptGenerator;














