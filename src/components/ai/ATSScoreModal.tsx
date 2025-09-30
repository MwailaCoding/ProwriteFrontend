import React from 'react';
import { motion } from 'framer-motion';
import { X, BarChart3, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { ATSScore } from '../../types';

interface ATSScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: ATSScore;
}

export const ATSScoreModal: React.FC<ATSScoreModalProps> = ({
  isOpen,
  onClose,
  score
}) => {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (score >= 60) return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    return <XCircle className="h-6 w-6 text-red-500" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sunset-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-sunset-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ATS Score Analysis</h2>
                <p className="text-gray-600">Applicant Tracking System Compatibility</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Overall Score */}
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="8"
                  strokeDasharray={`${(score.overall_score / 100) * 314} 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(score.overall_score)}`}>
                    {score.overall_score}
                  </div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-2">
              {getScoreIcon(score.overall_score)}
              <h3 className="text-xl font-semibold text-gray-900">
                {getScoreLabel(score.overall_score)}
              </h3>
            </div>
            
            <p className="text-gray-600">
              Your resume scores {score.overall_score}% for ATS compatibility
            </p>
          </div>

          {/* Criteria Breakdown */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Score Breakdown</h4>
            <div className="space-y-4">
              {Object.entries(score.criteria).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      value >= 8 ? 'bg-green-500' : 
                      value >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-gray-700 capitalize font-medium">
                      {key.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          value >= 8 ? 'bg-green-500' : 
                          value >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {value}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Recommendations</h4>
            <div className="space-y-3">
              {score.feedback.filter(Boolean).map((feedback, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-sunset-50 rounded-lg">
                  <div className="w-2 h-2 bg-sunset-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">{feedback}</p>
                </div>
              ))}
              
              {score.feedback.filter(Boolean).length === 0 && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 text-sm">
                    Great job! Your resume is well-optimized for ATS systems.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-sunset-gradient"
              onClick={() => {
                // TODO: Implement enhancement suggestions
                onClose();
              }}
            >
              Apply Suggestions
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};