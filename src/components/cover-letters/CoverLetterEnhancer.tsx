import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Palette, 
  BarChart3, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { coverLetterService } from '../../services/coverLetterService';
import { CoverLetter } from '../../types';

interface CoverLetterEnhancerProps {
  coverLetter: CoverLetter;
  jobDescription?: string;
  onContentUpdate?: (newContent: string) => void;
}

interface ATSAnalysis {
  keyword_score: number;
  keyword_matches: string[];
  readability_score: number;
  structure_score: number;
  overall_score: number;
  suggestions: string[];
}

interface ToneOption {
  name: string;
  description: string;
  characteristics: string[];
  example_phrases: string[];
}

export const CoverLetterEnhancer: React.FC<CoverLetterEnhancerProps> = ({
  coverLetter,
  jobDescription = '',
  onContentUpdate
}) => {
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [toneOptions, setToneOptions] = useState<Record<string, ToneOption>>({});
  const [industries, setIndustries] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showATS, setShowATS] = useState(false);

  useEffect(() => {
    loadEnhancementOptions();
  }, []);

  const loadEnhancementOptions = async () => {
    try {
      const options = await coverLetterService.getEnhancementOptions();
      setToneOptions(options.tones);
      setIndustries(options.industries);
    } catch (error) {
      console.error('Failed to load enhancement options:', error);
    }
  };

  const analyzeATS = async () => {
    if (!jobDescription.trim()) {
      alert('Please provide a job description to analyze ATS compatibility.');
      return;
    }

    setLoading(true);
    try {
      const analysis = await coverLetterService.analyzeATS(coverLetter.cover_letter_id, jobDescription);
      setAtsAnalysis(analysis);
      setShowATS(true);
    } catch (error) {
      console.error('ATS analysis failed:', error);
      alert('Failed to analyze ATS compatibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const enhanceTone = async () => {
    setEnhancing(true);
    try {
      const result = await coverLetterService.enhanceTone(
        coverLetter.cover_letter_id, 
        selectedTone, 
        selectedIndustry || undefined
      );
      
      if (onContentUpdate) {
        onContentUpdate(result.enhanced_content);
      }
      
      alert('Cover letter enhanced successfully!');
    } catch (error) {
      console.error('Tone enhancement failed:', error);
      alert('Failed to enhance cover letter. Please try again.');
    } finally {
      setEnhancing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhance Your Cover Letter</h2>
          <p className="text-gray-600 mt-1">
            Optimize for ATS systems and customize the tone to match your target role
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={analyzeATS}
            loading={loading}
            disabled={!jobDescription.trim()}
            icon={<BarChart3 className="w-4 h-4" />}
            variant="outline"
          >
            Analyze ATS
          </Button>
          <Button
            onClick={enhanceTone}
            loading={enhancing}
            icon={<Zap className="w-4 h-4" />}
            className="bg-sunset-gradient"
          >
            Enhance Tone
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATS Analysis */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">ATS Compatibility</h3>
          </div>
          
          {!showATS ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Analyze your cover letter's compatibility with Applicant Tracking Systems
              </p>
              <Button
                onClick={analyzeATS}
                loading={loading}
                disabled={!jobDescription.trim()}
                icon={<BarChart3 className="w-4 h-4" />}
                variant="outline"
              >
                Start Analysis
              </Button>
            </div>
          ) : atsAnalysis ? (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall ATS Score</span>
                  {getScoreIcon(atsAnalysis.overall_score)}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        atsAnalysis.overall_score >= 80 ? 'bg-green-500' :
                        atsAnalysis.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${atsAnalysis.overall_score}%` }}
                    />
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(atsAnalysis.overall_score)}`}>
                    {Math.round(atsAnalysis.overall_score)}%
                  </span>
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(atsAnalysis.keyword_score)}%</div>
                  <div className="text-sm text-gray-600">Keywords</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{Math.round(atsAnalysis.readability_score)}%</div>
                  <div className="text-sm text-gray-600">Readability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(atsAnalysis.structure_score)}%</div>
                  <div className="text-sm text-gray-600">Structure</div>
                </div>
              </div>

              {/* Keyword Matches */}
              {atsAnalysis.keyword_matches.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {atsAnalysis.keyword_matches.slice(0, 10).map((keyword, index) => (
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
              {atsAnalysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
                  <ul className="space-y-1">
                    {atsAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </Card>

        {/* Tone Customization */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tone Customization</h3>
          </div>

          <div className="space-y-4">
            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tone
              </label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              >
                {Object.entries(toneOptions).map(([key, tone]) => (
                  <option key={key} value={key}>
                    {tone.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone Description */}
            {selectedTone && toneOptions[selectedTone] && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {toneOptions[selectedTone].name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {toneOptions[selectedTone].description}
                </p>
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1">Characteristics:</h5>
                  <div className="flex flex-wrap gap-1">
                    {toneOptions[selectedTone].characteristics.map((char, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Industry Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry (Optional)
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              >
                <option value="">Select Industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry.charAt(0).toUpperCase() + industry.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhancement Button */}
            <Button
              onClick={enhanceTone}
              loading={enhancing}
              icon={<Zap className="w-4 h-4" />}
              className="w-full bg-sunset-gradient"
            >
              Enhance Cover Letter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};



















