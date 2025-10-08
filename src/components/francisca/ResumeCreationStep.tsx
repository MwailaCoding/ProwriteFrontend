import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Plus,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface ResumeCreationStepProps {
  onUploadResume: () => void;
  onStartBlank: () => void;
  onSkip: () => void;
}

const ResumeCreationStep: React.FC<ResumeCreationStepProps> = ({
  onUploadResume,
  onStartBlank,
  onSkip
}) => {
  const [selectedOption, setSelectedOption] = useState<'upload' | 'blank' | null>(null);

  const handleContinue = () => {
    if (selectedOption === 'upload') {
      onUploadResume();
    } else if (selectedOption === 'blank') {
      onStartBlank();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          How would you like to create your resume?
        </h2>
        <p className="text-gray-600">
          Choose the option that works best for you
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Upload Existing Resume */}
        <div 
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
            selectedOption === 'upload' 
              ? 'border-blue-500 bg-blue-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => setSelectedOption('upload')}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${
              selectedOption === 'upload' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Upload className={`h-6 w-6 ${
                selectedOption === 'upload' ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Upload Existing Resume
              </h3>
              <p className="text-gray-600 mb-4">
                Upload your current resume and we'll automatically extract all the information to fill the form for you.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Supports PDF, DOC, DOCX files</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>AI-powered data extraction</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Auto-fill all form fields</span>
                </div>
              </div>
            </div>
            {selectedOption === 'upload' && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start with Blank Form */}
        <div 
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
            selectedOption === 'blank' 
              ? 'border-green-500 bg-green-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => setSelectedOption('blank')}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${
              selectedOption === 'blank' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Plus className={`h-6 w-6 ${
                selectedOption === 'blank' ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Start with Blank Form
              </h3>
              <p className="text-gray-600 mb-4">
                Create your resume from scratch using our guided form with AI assistance and smart suggestions.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Guided step-by-step process</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>AI-powered content suggestions</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Real-time ATS analysis</span>
                </div>
              </div>
            </div>
            {selectedOption === 'blank' && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Skip for now
        </button>
        
        <div className="flex items-center space-x-3">
          {selectedOption && (
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Pro Tip
            </h4>
            <p className="text-sm text-blue-700">
              If you have an existing resume, uploading it will save you time by automatically filling most fields. 
              You can always edit the information after import.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeCreationStep;

