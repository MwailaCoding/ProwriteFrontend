import React, { useState } from 'react';
import { pdfTemplateService } from '../../services/pdfTemplateService';

const AITestComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAIIntegration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test the AI processing
      const templateId = "2eeafed1-2dbc-48ae-95c5-47a4ff383c48"; // Pro Template ID
      
      console.log('Testing AI integration...');
      
      // Test 1: Get templates
      const templates = await pdfTemplateService.getPDFTemplates();
      console.log('Templates loaded:', templates.length);
      
      // Test 2: Process template with AI
      const processedTemplate = await pdfTemplateService.processTemplateWithAI(templateId);
      console.log('Template processed:', processedTemplate);
      
      // Test 3: Test content replacement
      const testData = {
        personalInfo: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "123-456-7890"
        },
        resumeTitle: "Software Engineer Resume",
        experience: [
          {
            company: "Tech Corp",
            position: "Senior Developer",
            startDate: "2020-01",
            endDate: "2023-12",
            description: "Led development of web applications"
          }
        ]
      };
      
      const replacementResult = await pdfTemplateService.testContentReplacement(templateId, testData);
      console.log('Content replacement test:', replacementResult);
      
      setResult({
        templates: templates.length,
        processed: processedTemplate,
        replacement: replacementResult
      });
      
    } catch (err: any) {
      console.error('AI test failed:', err);
      setError(err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🤖 AI Integration Test
      </h2>
      
      <button
        onClick={testAIIntegration}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Testing...' : 'Test AI Integration'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">❌ Error: {error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ AI Integration Test Results
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Templates Loaded:</strong> {result.templates}</p>
            <p><strong>Template Processed:</strong> {result.processed ? 'Yes' : 'No'}</p>
            <p><strong>Content Replacement:</strong> {result.replacement ? 'Success' : 'Failed'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITestComponent;


























