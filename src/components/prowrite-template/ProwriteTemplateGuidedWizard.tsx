import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Sparkles, 
  Loader2,
  AlertCircle,
  Check,
  X,
  RotateCcw
} from 'lucide-react';
import prowriteTemplateQuestionService, { 
  QuestionStep, 
  Progress, 
  Enhancement, 
  ResumeData 
} from '../../services/prowriteTemplateQuestionService';

interface ProwriteTemplateGuidedWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (resumeData: ResumeData) => void;
  onAutoFill: (resumeData: ResumeData) => void;
}

const ProwriteTemplateGuidedWizard: React.FC<ProwriteTemplateGuidedWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  onAutoFill
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionStep | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [enhancements, setEnhancements] = useState<Record<string, Enhancement>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEnhancement, setShowEnhancement] = useState<Record<string, boolean>>({});
  const [isEnhancing, setIsEnhancing] = useState<Record<string, boolean>>({});

  // Initialize the question flow
  useEffect(() => {
    if (isOpen) {
      startQuestionFlow();
    }
  }, [isOpen]);

  const startQuestionFlow = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { question, progress } = await prowriteTemplateQuestionService.startQuestionFlow();
      setCurrentQuestion(question);
      setProgress(progress);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = async (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    
    // Auto-enhance after user stops typing
    if (value.trim()) {
      setIsEnhancing(prev => ({ ...prev, [field]: true }));
      try {
        const enhancement = await prowriteTemplateQuestionService.enhanceAnswer(
          field, 
          value, 
          { profession: answers.profession || 'Professional' }
        );
        setEnhancements(prev => ({ ...prev, [field]: enhancement }));
      } catch (err) {
        console.error('Enhancement failed:', err);
      } finally {
        setIsEnhancing(prev => ({ ...prev, [field]: false }));
      }
    }
  };

  const handleSubmitAnswer = async (field: string) => {
    const answer = answers[field];
    if (!answer?.trim()) return;

    try {
      setIsLoading(true);
      const response = await prowriteTemplateQuestionService.submitAnswer(
        field,
        answer,
        { profession: answers.profession || 'Professional' }
      );

      setEnhancements(prev => ({ ...prev, [field]: response.enhancement }));
      setProgress(response.progress);

      // If there's a next question, move to it
      if (response.next_question) {
        setCurrentQuestion(response.next_question);
      } else {
        // Flow is complete
        handleComplete();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      setIsLoading(true);
      const { question, progress } = await prowriteTemplateQuestionService.getNextQuestion();
      setCurrentQuestion(question);
      setProgress(progress);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = async () => {
    try {
      setIsLoading(true);
      const { question, progress } = await prowriteTemplateQuestionService.getPreviousQuestion();
      setCurrentQuestion(question);
      setProgress(progress);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const { resume_data } = await prowriteTemplateQuestionService.getResumeData();
      onComplete(resume_data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAutoFill = async () => {
    try {
      const { resume_data } = await prowriteTemplateQuestionService.getResumeData();
      onAutoFill(resume_data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleEnhancement = (field: string) => {
    setShowEnhancement(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const acceptEnhancement = (field: string) => {
    const enhancement = enhancements[field];
    if (enhancement) {
      setAnswers(prev => ({ ...prev, [field]: enhancement.enhanced }));
      setShowEnhancement(prev => ({ ...prev, [field]: false }));
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                ProwriteTemplate AI Resume Builder
              </h2>
              <p className="text-purple-100 mt-1">Guided resume creation with AI enhancement</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress: {progress.progress_percentage.toFixed(1)}%</span>
                <span>Step {progress.current_step + 1} of {progress.total_steps}</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress_percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Processing...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {currentQuestion && !isLoading && (
            <div>
              {/* Step Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentQuestion.title}
                </h3>
                <p className="text-gray-600 mt-1">{currentQuestion.description}</p>
              </div>

              {/* Fields */}
              <div className="space-y-6">
                {currentQuestion.fields.map((field) => (
                  <div key={field.field} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.question}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {/* Input Field */}
                    <div className="relative">
                      {field.type === 'textarea' ? (
                        <textarea
                          value={answers[field.field] || ''}
                          onChange={(e) => handleAnswerChange(field.field, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          rows={4}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={answers[field.field] || ''}
                          onChange={(e) => handleAnswerChange(field.field, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'tags' ? (
                        <input
                          type="text"
                          value={answers[field.field] || ''}
                          onChange={(e) => handleAnswerChange(field.field, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={answers[field.field] || ''}
                          onChange={(e) => handleAnswerChange(field.field, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      )}

                      {/* Enhancement Indicator */}
                      {isEnhancing[field.field] && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        </div>
                      )}
                    </div>

                    {/* Enhancement Hint */}
                    <p className="text-sm text-gray-500">{field.enhancement_hint}</p>

                    {/* Enhancement Display */}
                    {enhancements[field.field] && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              AI Enhancement
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getQualityBgColor(enhancements[field.field].quality_score)} ${getQualityColor(enhancements[field.field].quality_score)}`}>
                              {enhancements[field.field].quality_score}% Quality
                            </span>
                          </div>
                          <button
                            onClick={() => toggleEnhancement(field.field)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {showEnhancement[field.field] ? 'Hide' : 'Show'} Enhancement
                          </button>
                        </div>

                        {showEnhancement[field.field] && (
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Enhanced Version:</p>
                              <div className="bg-white border border-blue-200 rounded p-3">
                                <p className="text-gray-900">{enhancements[field.field].enhanced}</p>
                              </div>
                            </div>

                            {enhancements[field.field].suggestions.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Suggestions:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {enhancements[field.field].suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <Check className="w-3 h-3 text-green-600" />
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => acceptEnhancement(field.field)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                <Check className="w-3 h-3" />
                                Accept Enhancement
                              </button>
                              <button
                                onClick={() => setShowEnhancement(prev => ({ ...prev, [field.field]: false }))}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                              >
                                <X className="w-3 h-3" />
                                Keep Original
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button for this field */}
                    {answers[field.field] && (
                      <button
                        onClick={() => handleSubmitAnswer(field.field)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isLoading ? 'Processing...' : 'Submit Answer'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion State */}
          {progress?.is_complete && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Resume Building Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                Your resume has been built with AI-enhanced content. You can now review and auto-fill the form.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleAutoFill}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Auto-fill Resume Form
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Review Resume Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentQuestion && !progress?.is_complete && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={!progress || progress.current_step === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {progress && Array.from({ length: progress.total_steps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < progress.current_step
                      ? 'bg-green-500'
                      : index === progress.current_step
                      ? 'bg-purple-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProwriteTemplateGuidedWizard;









