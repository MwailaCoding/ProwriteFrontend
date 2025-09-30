import React, { useState } from 'react';
import { ResumeFormBuilder } from '../components/common/ResumeFormBuilder';
import { ResumeFormData } from '../types';

export const FormBuilderDemo: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);

  const handleSave = (data: ResumeFormData) => {
    console.log('Form data saved:', data);
    setResumeData(data);
  };

  const handlePreview = () => {
    console.log('Preview requested');
    alert('Preview functionality would be implemented here!');
  };

  const handleNextStep = () => {
    console.log('Form completed, moving to template selection');
    alert('Form completed! You would now be taken to template selection.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Resume Builder Demo
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Test the advanced form builder with all features working
          </p>
        </div>

        <ResumeFormBuilder
          initialData={resumeData || undefined}
          onSave={handleSave}
          onPreview={handlePreview}
          onNextStep={handleNextStep}
        />

        {/* Debug Info */}
        {resumeData && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Form Data</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};


















