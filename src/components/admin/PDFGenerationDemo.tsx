import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { PDFTemplatePreview } from './PDFTemplatePreview';
import { pdfGenerationService } from '../../services/pdfGenerationService';
import { PDFTemplate, ResumeFormData } from '../../types';

interface PDFGenerationDemoProps {
  template: PDFTemplate;
  formData: ResumeFormData;
  onClose?: () => void;
}

export const PDFGenerationDemo: React.FC<PDFGenerationDemoProps> = ({
  template,
  formData,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<'compatibility' | 'preview' | 'generation' | 'complete'>('compatibility');
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    testCompatibility();
  }, []);

  const testCompatibility = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pdfGenerationService.testTemplateCompatibility(template.id, formData);
      setCompatibilityResult(result);
      
      if (result.isCompatible) {
        setCurrentStep('preview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test compatibility');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentStep('generation');
      
      const result = await pdfGenerationService.generatePDF({
        templateId: template.id,
        formData: formData,
        outputFormat: 'pdf',
        quality: 'high'
      });
      
      setGenerationResult(result);
      setCurrentStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  if (showPreview) {
    return (
      <PDFTemplatePreview
        template={template}
        formData={formData}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Generation Demo</h1>
        <p className="text-gray-600">
          See the complete workflow from form data to final PDF
        </p>
      </div>

      {/* Step Content */}
      {currentStep === 'compatibility' && (
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Template Compatibility Check
            </h3>
            
            {isLoading ? (
              <div>Checking compatibility...</div>
            ) : compatibilityResult ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  compatibilityResult.isCompatible 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={compatibilityResult.isCompatible ? 'text-green-800' : 'text-yellow-800'}>
                    {compatibilityResult.isCompatible 
                      ? '✅ Template is compatible!' 
                      : '⚠️ Template has compatibility issues'
                    }
                  </p>
                </div>
                
                {compatibilityResult.isCompatible && (
                  <Button onClick={() => setCurrentStep('preview')}>
                    Continue to Preview
                  </Button>
                )}
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </Card>
      )}

      {currentStep === 'preview' && (
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Preview Your Resume
            </h3>
            <p className="text-gray-600 mb-6">
              See how your form data will look in the selected template
            </p>
            
            <div className="flex justify-center space-x-3">
              <Button onClick={() => setShowPreview(true)}>
                View Preview
              </Button>
              <Button onClick={generatePDF}>
                Generate PDF
              </Button>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 'generation' && (
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Generating Your PDF
            </h3>
            <p className="text-gray-600">
              Please wait while we create your professional resume...
            </p>
          </div>
        </Card>
      )}

      {currentStep === 'complete' && (
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              PDF Generated Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your professional resume is ready for download
            </p>
            
            <Button onClick={() => setShowPreview(true)}>
              View Final Result
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {onClose && (
        <div className="mt-8 text-center">
          <Button onClick={onClose} variant="outline">
            Close Demo
          </Button>
        </div>
      )}
    </div>
  );
};
