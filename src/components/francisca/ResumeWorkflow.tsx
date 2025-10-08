import React, { useState } from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import ResumeCreationStep from './ResumeCreationStep';
import ResumeImportModal from './ResumeImportModal';

interface ResumeWorkflowProps {
  onResumeImported: (data: any) => void;
  onStartBlankForm: () => void;
  onSkip: () => void;
}

type WorkflowStep = 'creation' | 'template' | 'form' | 'generate';

const ResumeWorkflow: React.FC<ResumeWorkflowProps> = ({
  onResumeImported,
  onStartBlankForm,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('creation');
  const [showImportModal, setShowImportModal] = useState(false);

  const steps = [
    { id: 'creation', title: 'Choose Method', description: 'Upload or start blank' },
    { id: 'template', title: 'Template Selected', description: 'Choose your template' },
    { id: 'form', title: 'Fill Form', description: 'Complete your information' },
    { id: 'generate', title: 'Generate PDF', description: 'Create your resume' }
  ];

  const handleUploadResume = () => {
    setShowImportModal(true);
  };

  const handleStartBlank = () => {
    setCurrentStep('template');
  };

  const handleResumeImported = (data: any) => {
    setShowImportModal(false);
    setCurrentStep('form');
    onResumeImported(data);
  };

  const handleTemplateSelected = () => {
    setCurrentStep('form');
    onStartBlankForm();
  };

  const handleSkip = () => {
    setCurrentStep('form');
    onSkip();
  };

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (stepId: string) => {
    const status = getStepStatus(stepId);
    
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'current') {
      return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">
          {steps.findIndex(step => step.id === stepId) + 1}
        </span>
      </div>;
    } else {
      return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStepColor = (stepId: string) => {
    const status = getStepStatus(stepId);
    
    if (status === 'completed') return 'text-green-600';
    if (status === 'current') return 'text-blue-600';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">Create Your Resume</h1>
              <div className="hidden md:block text-sm text-gray-500">
                Step {steps.findIndex(step => step.id === currentStep) + 1} of {steps.length}
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center space-x-2">
                    {getStepIcon(step.id)}
                    <div className="hidden sm:block">
                      <div className={`text-sm font-medium ${getStepColor(step.id)}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentStep === 'creation' && (
          <ResumeCreationStep
            onUploadResume={handleUploadResume}
            onStartBlank={handleStartBlank}
            onSkip={handleSkip}
          />
        )}

        {currentStep === 'template' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Template Selected
              </h2>
              <p className="text-gray-600 mb-6">
                You've chosen to start with a blank form. The ProwriteTemplate template has been selected for you.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ProwriteTemplate Template Ready
                </h3>
                <p className="text-green-700">
                  This professional template is optimized for ATS systems and includes AI-powered features.
                </p>
              </div>
              <button
                onClick={handleTemplateSelected}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue to Form
              </button>
            </div>
          </div>
        )}

        {currentStep === 'form' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Resume Form
              </h2>
              <p className="text-gray-600 mb-6">
                The form will be loaded here based on your selection
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  Form content will be rendered here...
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'generate' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Generate PDF
              </h2>
              <p className="text-gray-600">
                PDF generation will happen here...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resume Import Modal */}
      <ResumeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleResumeImported}
      />
    </div>
  );
};

export default ResumeWorkflow;
