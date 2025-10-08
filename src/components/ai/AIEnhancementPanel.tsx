import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BarChart3,
  FileText,
  Zap,
  Target,
  TrendingUp,
  Brain,
  Wand2
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useApiMutation } from '../../hooks/useApi';
import { resumeService } from '../../services/resumeService';
import { jobDescriptionService } from '../../services/jobDescriptionService';

interface AIEnhancementPanelProps {
  resumeId: number;
  onEnhancementComplete?: (enhancements: string[]) => void;
  onATSScoreUpdate?: (score: any) => void;
}

export const AIEnhancementPanel: React.FC<AIEnhancementPanelProps> = ({
  resumeId,
  onEnhancementComplete,
  onATSScoreUpdate
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [selectedTone, setSelectedTone] = useState('formal');
  const [activeTab, setActiveTab] = useState<'enhance' | 'analyze' | 'job'>('enhance');

  const { execute: enhanceSection, loading: enhancing } = useApiMutation(
    (data: any) => resumeService.enhanceResume(resumeId, data.sectionId, data.jobDescription, data.tone),
    {
      onSuccess: (result) => {
        onEnhancementComplete?.(result.enhancements);
      }
    }
  );

  const { execute: analyzeResume, loading: analyzing } = useApiMutation(
    (data: any) => resumeService.analyzeResume(resumeId, data.jobDescription),
    {
      onSuccess: (result) => {
        onATSScoreUpdate?.(result.score);
      }
    }
  );

  const { execute: analyzeJobDescription, loading: analyzingJob } = useApiMutation(
    (data: any) => jobDescriptionService.analyzeJobDescription(data.description, data.url),
    {
      onSuccess: (result) => {
        setJobDescription(result.keywords);
      }
    }
  );

  const handleEnhanceSection = async (sectionId: number) => {
    await enhanceSection({
      sectionId,
      jobDescription: jobDescription || undefined,
      tone: selectedTone
    });
  };

  const handleAnalyzeResume = async () => {
    await analyzeResume({
      jobDescription: jobDescription || undefined
    });
  };

  const handleAnalyzeJobDescription = async () => {
    if (jobUrl) {
      await analyzeJobDescription({ url: jobUrl });
    } else if (jobDescription) {
      await analyzeJobDescription({ description: jobDescription });
    }
  };

  const tones = [
    { value: 'formal', label: 'Formal', icon: FileText },
    { value: 'casual', label: 'Casual', icon: Sparkles },
    { value: 'confident', label: 'Confident', icon: Target },
    { value: 'creative', label: 'Creative', icon: Wand2 }
  ];

  return (
    <Card className="h-full">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="h-5 w-5 text-sunset-600 mr-2" />
            AI Assistant
          </h3>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            {[
              { id: 'enhance', label: 'Enhance', icon: Sparkles },
              { id: 'analyze', label: 'Analyze', icon: BarChart3 },
              { id: 'job', label: 'Job Match', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-sunset-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Job Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description (Optional)
          </label>
          <div className="space-y-3">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for tailored suggestions..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent resize-none text-sm"
            />
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Or</span>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="Paste job posting URL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyzeJobDescription}
                loading={analyzingJob}
                disabled={!jobUrl && !jobDescription}
              >
                Extract
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'enhance' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enhancement Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tones.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedTone === tone.value
                        ? 'border-sunset-500 bg-sunset-50 text-sunset-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <tone.icon className="h-4 w-4" />
                    <span>{tone.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleEnhanceSection(1)} // This would be dynamic based on selected section
                loading={enhancing}
                className="w-full bg-sunset-gradient"
                icon={<Zap className="h-4 w-4" />}
              >
                Enhance Selected Section
              </Button>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Improves language and impact</p>
                <p>• Adds action verbs and metrics</p>
                <p>• Tailors content to job requirements</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analyze' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Button
              onClick={handleAnalyzeResume}
              loading={analyzing}
              className="w-full bg-sunset-gradient"
              icon={<BarChart3 className="h-4 w-4" />}
            >
              Analyze ATS Score
            </Button>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Checks keyword optimization</p>
              <p>• Evaluates structure and format</p>
              <p>• Provides improvement suggestions</p>
              <p>• Scores against ATS systems</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'job' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-gradient-to-br from-sunset-50 to-coral-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 text-sunset-600 mr-2" />
                Job Matching
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Get personalized suggestions based on the job requirements
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!jobDescription}
              >
                Generate Job-Specific Tips
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Identifies missing keywords</p>
              <p>• Suggests relevant skills</p>
              <p>• Recommends content improvements</p>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">AI Usage Today</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-sunset-600">3</div>
              <div className="text-gray-600">Enhancements</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-coral-600">1</div>
              <div className="text-gray-600">ATS Scans</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};