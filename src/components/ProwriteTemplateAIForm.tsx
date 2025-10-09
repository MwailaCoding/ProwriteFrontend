import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { pdfTemplateService } from '../services/pdfTemplateService';

interface AIFormProps {
  onSubmit: (data: any) => void;
  onAIEnhanced: (enhancedData: any) => void;
}

const ProwriteTemplateAIForm: React.FC<AIFormProps> = ({ onSubmit, onAIEnhanced }) => {
  const { register, handleSubmit, watch } = useForm();
  const [useAI, setUseAI] = useState(false);
  const [theme, setTheme] = useState('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<any>(null);

  const onFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Add AI and theme settings to the data
      const enhancedData = {
        ...data,
        use_ai: useAI,
        theme: theme
      };

      // Generate resume
      const result = await pdfTemplateService.generateProwriteTemplateResume(enhancedData);

      if (result.success) {
        // Handle AI analysis if available
        if (result.enhanced_data) {
          setAIAnalysis({
            skills_analysis: result.skills_analysis,
            job_keywords: result.job_keywords,
            design_recommendations: result.design_recommendations
          });
          onAIEnhanced(result.enhanced_data);
        }

        // Trigger parent's onSubmit
        onSubmit(result);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* AI Enhancement Toggle */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">Enable AI Enhancement</span>
          </label>
        </div>

        {/* Theme Selection */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="professional">Professional (Blue)</option>
            <option value="modern">Modern (Green)</option>
            <option value="corporate">Corporate (Red)</option>
          </select>
        </div>

        {/* AI-specific fields */}
        {useAI && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description (for AI targeting)
              </label>
              <textarea
                {...register('job_description')}
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="Paste the job description here for better AI targeting..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                {...register('industry')}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="e.g., Technology, Healthcare, Finance..."
              />
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                {...register('personalInfo.firstName')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                {...register('personalInfo.lastName')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register('personalInfo.email')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                {...register('personalInfo.phone')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                {...register('personalInfo.city')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                {...register('personalInfo.country')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Generating...' : 'Generate Resume'}
          </button>
        </div>
      </form>

      {/* AI Analysis Display */}
      {aiAnalysis && (
        <div className="mt-8 space-y-6">
          {/* Skills Gap Analysis */}
          {aiAnalysis.skills_analysis && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Gap Analysis</h3>
              <div className="space-y-4">
                {aiAnalysis.skills_analysis.missing_skills && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700">Missing Skills</h4>
                    <ul className="list-disc pl-5 mt-2">
                      {aiAnalysis.skills_analysis.missing_skills.map((skill: string, index: number) => (
                        <li key={index} className="text-gray-600">{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiAnalysis.skills_analysis.recommendations && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700">Recommendations</h4>
                    <ul className="list-disc pl-5 mt-2">
                      {aiAnalysis.skills_analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-gray-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job Keywords */}
          {aiAnalysis.job_keywords && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Important Job Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.job_keywords.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Design Recommendations */}
          {aiAnalysis.design_recommendations && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Design Recommendations</h3>
              <ul className="list-disc pl-5 space-y-2">
                {aiAnalysis.design_recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProwriteTemplateAIForm;

