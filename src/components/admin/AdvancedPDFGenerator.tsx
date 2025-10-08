import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Download, 
  FileText, 
  Zap, 
  Shield, 
  Palette,
  Layers,
  Clock,
  BarChart3,
  Share2,
  Save,
  Play
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { PDFTemplate, ResumeFormData } from '../../types';
import { advancedPDFService, AdvancedPDFOptions, BatchGenerationJob } from '../../services/advancedPDFService';

interface AdvancedPDFGeneratorProps {
  template: PDFTemplate;
  formData: ResumeFormData;
  onClose?: () => void;
}

export const AdvancedPDFGenerator: React.FC<AdvancedPDFGeneratorProps> = ({
  template,
  formData,
  onClose
}) => {
  const [currentTab, setCurrentTab] = useState<'options' | 'batch' | 'presets' | 'analytics'>('options');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced options state
  const [options, setOptions] = useState<Partial<AdvancedPDFOptions>>({
    outputFormat: 'pdf',
    quality: 'high',
    optimization: {
      compress: true,
      removeMetadata: false,
      optimizeImages: true,
      passwordProtect: false,
      password: ''
    },
    styling: {
      colorScheme: 'professional',
      pageSize: 'a4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 }
    },
    metadata: {
      title: '',
      author: '',
      subject: 'Professional Resume',
      keywords: [],
      creator: 'ProWrite Resume Builder'
    }
  });

  // Batch generation state
  const [batchJobs, setBatchJobs] = useState<Array<{ templateId: string; formData: ResumeFormData; options?: Partial<AdvancedPDFOptions> }>>([]);
  const [batchJob, setBatchJob] = useState<BatchGenerationJob | null>(null);
  const [batchProgress, setBatchProgress] = useState(0);

  // Presets state
  const [presets, setPresets] = useState<any>(null);
  const [customPresets, setCustomPresets] = useState<any[]>([]);

  useEffect(() => {
    loadPresets();
    loadCustomPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await advancedPDFService.getGenerationPresets();
      setPresets(data);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const loadCustomPresets = async () => {
    try {
      const data = await advancedPDFService.getCustomPresets();
      setCustomPresets(data);
    } catch (error) {
      console.error('Failed to load custom presets:', error);
    }
  };

  const handleOptionChange = (section: keyof AdvancedPDFOptions, key: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const applyPreset = (presetName: string) => {
    if (presets && presets[presetName]) {
      setOptions(prev => ({
        ...prev,
        ...presets[presetName]
      }));
    }
  };

  const saveCustomPreset = async () => {
    try {
      const presetName = prompt('Enter preset name:');
      if (presetName) {
        await advancedPDFService.saveCustomPreset(presetName, options);
        await loadCustomPresets();
      }
    } catch (error) {
      setError('Failed to save preset');
    }
  };

  const generateAdvancedPDF = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const fullOptions: AdvancedPDFOptions = {
        templateId: template.id,
        formData: formData,
        ...options
      } as AdvancedPDFOptions;
      
      const result = await advancedPDFService.generateAdvancedPDF(fullOptions);
      setGenerationResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMultipleFormats = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const formats: ('pdf' | 'docx' | 'html' | 'txt')[] = ['pdf', 'docx', 'html'];
      const results = await advancedPDFService.generateMultipleFormats(template.id, formData, formats);
      setGenerationResult(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate multiple formats');
    } finally {
      setIsGenerating(false);
    }
  };

  const startBatchGeneration = async () => {
    try {
      setError(null);
      
      // Create batch jobs for different quality levels
      const jobs = [
        { templateId: template.id, formData: formData, options: { ...options, quality: 'low' } },
        { templateId: template.id, formData: formData, options: { ...options, quality: 'medium' } },
        { templateId: template.id, formData: formData, options: { ...options, quality: 'high' } }
      ];
      
      const batchJob = await advancedPDFService.startBatchGeneration(jobs);
      setBatchJob(batchJob);
      
      // Start monitoring progress
      monitorBatchProgress(batchJob.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start batch generation');
    }
  };

  const monitorBatchProgress = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const progress = await advancedPDFService.getBatchProgress(jobId);
        setBatchJob(progress);
        setBatchProgress(progress.progress);
        
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to get batch progress:', error);
        clearInterval(interval);
      }
    }, 2000);
  };

  const cancelBatchGeneration = async () => {
    if (batchJob) {
      try {
        await advancedPDFService.cancelBatchGeneration(batchJob.id);
        setBatchJob(null);
        setBatchProgress(0);
      } catch (error) {
        setError('Failed to cancel batch generation');
      }
    }
  };

  const renderOptionsTab = () => (
    <div className="space-y-6">
      {/* Output Format & Quality */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Output Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
            <select
              value={options.outputFormat}
              onChange={(e) => handleOptionChange('outputFormat', 'outputFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="docx">Word Document</option>
              <option value="html">HTML</option>
              <option value="txt">Plain Text</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
            <select
              value={options.quality}
              onChange={(e) => handleOptionChange('quality', 'quality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low (Fast)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Best)</option>
              <option value="print">Print Ready</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Optimization Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Optimization
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Compress PDF</label>
              <p className="text-xs text-gray-500">Reduce file size</p>
            </div>
            <input
              type="checkbox"
              checked={options.optimization?.compress}
              onChange={(e) => handleOptionChange('optimization', 'compress', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Remove Metadata</label>
              <p className="text-xs text-gray-500">Privacy protection</p>
            </div>
            <input
              type="checkbox"
              checked={options.optimization?.removeMetadata}
              onChange={(e) => handleOptionChange('optimization', 'removeMetadata', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Password Protect</label>
              <p className="text-xs text-gray-500">Secure your resume</p>
            </div>
            <input
              type="checkbox"
              checked={options.optimization?.passwordProtect}
              onChange={(e) => handleOptionChange('optimization', 'passwordProtect', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          {options.optimization?.passwordProtect && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={options.optimization?.password || ''}
                onChange={(e) => handleOptionChange('optimization', 'password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Styling Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Styling
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
            <select
              value={options.styling?.colorScheme}
              onChange={(e) => handleOptionChange('styling', 'colorScheme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Default</option>
              <option value="professional">Professional</option>
              <option value="creative">Creative</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
            <select
              value={options.styling?.pageSize}
              onChange={(e) => handleOptionChange('styling', 'pageSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={generateAdvancedPDF}
          loading={isGenerating}
          icon={<Download className="h-4 w-4" />}
        >
          Generate PDF
        </Button>
        
        <Button
          onClick={generateMultipleFormats}
          loading={isGenerating}
          variant="outline"
          icon={<Layers className="h-4 w-4" />}
        >
          Multiple Formats
        </Button>
      </div>
    </div>
  );

  const renderBatchTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Batch Generation
        </h3>
        
        <p className="text-gray-600 mb-4">
          Generate multiple versions of your resume with different quality settings and formats.
        </p>
        
        {!batchJob ? (
          <Button
            onClick={startBatchGeneration}
            icon={<Play className="h-4 w-4" />}
          >
            Start Batch Generation
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Batch Job: {batchJob.status}
                </span>
                <span className="text-xs text-blue-600">
                  {batchJob.completedJobs}/{batchJob.totalJobs} completed
                </span>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-2">
                <Button
                  onClick={cancelBatchGeneration}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                
                {batchJob.status === 'completed' && (
                  <Button
                    onClick={() => setGenerationResult(batchJob.results)}
                    size="sm"
                  >
                    View Results
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderPresetsTab = () => (
    <div className="space-y-6">
      {/* Built-in Presets */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Built-in Presets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets && Object.entries(presets).map(([name, preset]) => (
            <div
              key={name}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
              onClick={() => applyPreset(name)}
            >
              <h4 className="font-medium text-gray-900 capitalize">{name}</h4>
              <p className="text-sm text-gray-600">
                Optimized for {name} use cases
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Custom Presets */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Save className="h-5 w-5 mr-2" />
            Custom Presets
          </h3>
          
          <Button
            onClick={saveCustomPreset}
            variant="outline"
            size="sm"
          >
            Save Current
          </Button>
        </div>
        
        <div className="space-y-3">
          {customPresets.map((preset) => (
            <div
              key={preset.presetId}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
              onClick={() => setOptions(preset.options)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{preset.name}</h4>
                  <p className="text-xs text-gray-500">
                    Used {preset.usageCount} times • Created {new Date(preset.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Apply
                </Button>
              </div>
            </div>
          ))}
          
          {customPresets.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No custom presets yet. Create one by configuring options and clicking "Save Current".
            </p>
          )}
        </div>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Generation Analytics
        </h3>
        
        <p className="text-gray-600 mb-4">
          Track your PDF generation performance and usage patterns.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-blue-800">PDFs Generated</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0 MB</div>
            <div className="text-sm text-green-800">Total Size</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-purple-800">Downloads</div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced PDF Generator</h1>
        <p className="text-gray-600">
          Professional PDF generation with advanced optimization and multiple format support
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          {[
            { key: 'options', label: 'Generation Options', icon: Settings },
            { key: 'batch', label: 'Batch Processing', icon: Layers },
            { key: 'presets', label: 'Presets', icon: Save },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  currentTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {currentTab === 'options' && renderOptionsTab()}
      {currentTab === 'batch' && renderBatchTab()}
      {currentTab === 'presets' && renderPresetsTab()}
      {currentTab === 'analytics' && renderAnalyticsTab()}

      {/* Generation Result */}
      {generationResult && (
        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Complete!</h3>
          
          {Array.isArray(generationResult) ? (
            <div className="space-y-3">
              {generationResult.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{result.format.toUpperCase()}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {(result.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <Button
                    onClick={() => window.open(result.downloadUrl, '_blank')}
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">
                  {generationResult.format.toUpperCase()} • {generationResult.quality}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {(generationResult.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <Button
                onClick={() => window.open(generationResult.downloadUrl, '_blank')}
                icon={<Download className="h-4 w-4" />}
              >
                Download
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="mt-8 text-center">
          <Button onClick={onClose} variant="outline">
            Close Generator
          </Button>
        </div>
      )}
    </div>
  );
};
