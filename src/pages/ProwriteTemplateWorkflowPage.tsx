import React, { useState } from 'react';
import ResumeWorkflow from '../components/prowrite-template/ResumeWorkflow';
import ProwriteTemplateDynamicForm from '../components/ProwriteTemplateDynamicForm';

const ProwriteTemplateWorkflowPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'workflow' | 'form'>('workflow');
  const [importedData, setImportedData] = useState<any>(null);

  const handleResumeImported = (data: any) => {
    setImportedData(data);
    setCurrentView('form');
  };

  const handleStartBlankForm = () => {
    setImportedData(null);
    setCurrentView('form');
  };

  const handleSkipWorkflow = () => {
    setImportedData(null);
    setCurrentView('form');
  };

  const handleBackToWorkflow = () => {
    setCurrentView('workflow');
  };

  if (currentView === 'workflow') {
    return (
      <ResumeWorkflow
        onResumeImported={handleResumeImported}
        onStartBlankForm={handleStartBlankForm}
        onSkip={handleSkipWorkflow}
      />
    );
  }

  return (
    <div>
      {/* Back to Workflow Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBackToWorkflow}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
        >
          ← Back to Workflow
        </button>
      </div>

      {/* Render the form */}
      <ProwriteTemplateDynamicForm 
        initialData={importedData} 
      />
    </div>
  );
};

export default ProwriteTemplateWorkflowPage;

