import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  File,
  FileCode,
  FileJson,
  Share2,
  ExternalLink,
  Settings,
  Copy,
  Check,
  X,
  AlertCircle,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  Target,
  BarChart3,
  Palette,
  Type,
  Layout,
  Eye
} from 'lucide-react';

interface ExportIntegrationPanelProps {
  resumeContent: any;
  isOpen: boolean;
  onClose: () => void;
}

interface ExportResult {
  export_content: string;
  export_metadata: {
    export_id: string;
    format: string;
    filename: string;
    customizations: any;
    exported_at: string;
    file_size: string;
    quality: string;
    features: string[];
  };
  download_link: string;
  preview_url: string;
}

interface PlatformIntegration {
  platform_resume: any;
  integration_metadata: {
    integration_id: string;
    platform: string;
    platform_info: any;
    integration_type: string;
    settings: any;
    integrated_at: string;
    status: string;
  };
  platform_actions: any[];
  integration_url: string;
}

interface ShareablePackage {
  package_content: {
    exports: Record<string, ExportResult>;
    preview: any;
    metadata: any;
    readme: string;
  };
  package_metadata: {
    package_id: string;
    formats_included: string[];
    created_at: string;
    expiration_date?: string;
    access_control: string;
    download_count: number;
  };
  package_download_link: string;
  individual_downloads: Record<string, string>;
}

const FranciscaExportIntegrationPanel: React.FC<ExportIntegrationPanelProps> = ({
  resumeContent,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'platforms' | 'packages' | 'optimization'>('export');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export state
  const [exportResults, setExportResults] = useState<Record<string, ExportResult>>({});
  const [exportSettings, setExportSettings] = useState({
    format: 'pdf',
    filename: `resume_${new Date().toISOString().split('T')[0]}`,
    customizations: {
      styling: {
        font: 'Arial',
        color: 'professional_blue',
        layout: 'traditional'
      },
      sections: {
        required: ['contact_info', 'summary', 'experience', 'education'],
        optional: ['skills', 'projects', 'certifications']
      },
      formatting: {
        page_size: 'A4',
        margins: 'standard',
        spacing: '1.15'
      }
    }
  });

  // Platform integration state
  const [platformIntegrations, setPlatformIntegrations] = useState<Record<string, PlatformIntegration>>({});
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [integrationSettings, setIntegrationSettings] = useState({
    auto_optimize: true,
    include_metadata: true,
    sync_frequency: 'manual'
  });

  // Package state
  const [shareablePackages, setShareablePackages] = useState<ShareablePackage[]>([]);
  const [packageSettings, setPackageSettings] = useState({
    formats: ['pdf', 'docx', 'txt'],
    include_preview: true,
    include_metadata: true,
    expiration_date: '',
    access_control: 'public'
  });

  // Optimization state
  const [optimizationResults, setOptimizationResults] = useState<Record<string, any>>({});
  const [targetPlatform, setTargetPlatform] = useState('linkedin');

  // Export formats configuration
  const exportFormats = [
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Professional PDF format' },
    { id: 'docx', label: 'DOCX', icon: File, description: 'Microsoft Word document' },
    { id: 'txt', label: 'TXT', icon: FileCode, description: 'Plain text format' },
    { id: 'html', label: 'HTML', icon: FileCode, description: 'Web-ready HTML format' },
    { id: 'json', label: 'JSON', icon: FileJson, description: 'Structured data format' }
  ];

  // Platform integrations configuration
  const platformIntegrationsConfig = [
    { id: 'linkedin', label: 'LinkedIn', icon: Globe, description: 'Professional networking' },
    { id: 'indeed', label: 'Indeed', icon: Target, description: 'Job search platform' },
    { id: 'glassdoor', label: 'Glassdoor', icon: BarChart3, description: 'Company reviews' },
    { id: 'monster', label: 'Monster', icon: Zap, description: 'Career platform' },
    { id: 'ziprecruiter', label: 'ZipRecruiter', icon: Smartphone, description: 'AI-powered matching' }
  ];

  // Export resume
  const exportResume = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/francisca/export/export-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          export_settings: exportSettings
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setExportResults({
          ...exportResults,
          [exportSettings.format]: data.result
        });
      } else {
        setError(data.error || 'Failed to export resume');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Integrate with platform
  const integrateWithPlatform = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/francisca/export/integrate-platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          platform: selectedPlatform,
          integration_settings: integrationSettings
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPlatformIntegrations({
          ...platformIntegrations,
          [selectedPlatform]: data.result
        });
      } else {
        setError(data.error || 'Failed to integrate with platform');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Generate shareable package
  const generateShareablePackage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/francisca/export/shareable-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          package_settings: packageSettings
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShareablePackages([...shareablePackages, data.result]);
      } else {
        setError(data.error || 'Failed to generate shareable package');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Optimize for platform
  const optimizeForPlatform = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/francisca/export/optimize-platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          target_platform: targetPlatform
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOptimizationResults({
          ...optimizationResults,
          [targetPlatform]: data.result
        });
      } else {
        setError(data.error || 'Failed to optimize for platform');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Export & Integration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'export', label: 'Export', icon: Download },
            { id: 'platforms', label: 'Platforms', icon: Globe },
            { id: 'packages', label: 'Packages', icon: Share2 },
            { id: 'optimization', label: 'Optimization', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Export Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
                  
                  {/* Format Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Export Format</label>
                    <div className="grid grid-cols-2 gap-2">
                      {exportFormats.map((format) => (
                        <button
                          key={format.id}
                          onClick={() => setExportSettings({
                            ...exportSettings,
                            format: format.id
                          })}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            exportSettings.format === format.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <format.icon size={16} />
                            <span className="font-medium">{format.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{format.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filename */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Filename</label>
                    <input
                      type="text"
                      value={exportSettings.filename}
                      onChange={(e) => setExportSettings({
                        ...exportSettings,
                        filename: e.target.value
                      })}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  {/* Customization Options */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Styling</label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={exportSettings.customizations.styling.font}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            customizations: {
                              ...exportSettings.customizations,
                              styling: {
                                ...exportSettings.customizations.styling,
                                font: e.target.value
                              }
                            }
                          })}
                          className="p-2 border rounded text-sm"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Calibri">Calibri</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                        <select
                          value={exportSettings.customizations.styling.color}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            customizations: {
                              ...exportSettings.customizations,
                              styling: {
                                ...exportSettings.customizations.styling,
                                color: e.target.value
                              }
                            }
                          })}
                          className="p-2 border rounded text-sm"
                        >
                          <option value="professional_blue">Professional Blue</option>
                          <option value="corporate_gray">Corporate Gray</option>
                          <option value="modern_black">Modern Black</option>
                          <option value="creative_colorful">Creative Colorful</option>
                        </select>
                        <select
                          value={exportSettings.customizations.styling.layout}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            customizations: {
                              ...exportSettings.customizations,
                              styling: {
                                ...exportSettings.customizations.styling,
                                layout: e.target.value
                              }
                            }
                          })}
                          className="p-2 border rounded text-sm"
                        >
                          <option value="traditional">Traditional</option>
                          <option value="modern">Modern</option>
                          <option value="creative">Creative</option>
                          <option value="minimalist">Minimalist</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={exportResume}
                    disabled={loading}
                    className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Exporting...' : 'Export Resume'}
                  </button>
                </div>

                {/* Export Results */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Export Results</h3>
                  <div className="space-y-3">
                    {Object.entries(exportResults).map(([format, result]) => (
                      <div key={format} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const formatConfig = exportFormats.find(f => f.id === format);
                              const IconComponent = formatConfig?.icon;
                              return IconComponent ? <IconComponent size={16} /> : null;
                            })()}
                            <span className="font-medium uppercase">{format}</span>
                          </div>
                          <span className="text-xs text-gray-500">{result.export_metadata.file_size}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{result.export_metadata.filename}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(result.download_link, '_blank')}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            <Download size={14} />
                            Download
                          </button>
                          <button
                            onClick={() => window.open(result.preview_url, '_blank')}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                          >
                            <Eye size={14} />
                            Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platforms Tab */}
          {activeTab === 'platforms' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Platform Integration</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Platform</label>
                    <div className="grid grid-cols-1 gap-2">
                      {platformIntegrationsConfig.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setSelectedPlatform(platform.id)}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            selectedPlatform === platform.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <platform.icon size={16} />
                            <span className="font-medium">{platform.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{platform.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto_optimize"
                        checked={integrationSettings.auto_optimize}
                        onChange={(e) => setIntegrationSettings({
                          ...integrationSettings,
                          auto_optimize: e.target.checked
                        })}
                      />
                      <label htmlFor="auto_optimize">Auto-optimize for platform</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="include_metadata"
                        checked={integrationSettings.include_metadata}
                        onChange={(e) => setIntegrationSettings({
                          ...integrationSettings,
                          include_metadata: e.target.checked
                        })}
                      />
                      <label htmlFor="include_metadata">Include metadata</label>
                    </div>
                  </div>

                  <button
                    onClick={integrateWithPlatform}
                    disabled={loading}
                    className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Integrating...' : 'Integrate with Platform'}
                  </button>
                </div>

                {/* Integration Results */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Integration Status</h3>
                  <div className="space-y-3">
                    {Object.entries(platformIntegrations).map(([platform, integration]) => (
                      <div key={platform} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const platformConfig = platformIntegrationsConfig.find(p => p.id === platform);
                              const IconComponent = platformConfig?.icon;
                              return IconComponent ? <IconComponent size={16} /> : null;
                            })()}
                            <span className="font-medium capitalize">{platform}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            integration.integration_metadata.status === 'success' ? 'bg-green-100 text-green-700' :
                            integration.integration_metadata.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {integration.integration_metadata.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {integration.integration_metadata.platform_info.description}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(integration.integration_url, '_blank')}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            <ExternalLink size={14} />
                            Open Platform
                          </button>
                          <button
                            onClick={() => copyToClipboard(integration.integration_url)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                          >
                            <Copy size={14} />
                            Copy Link
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Package Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Shareable Package</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Include Formats</label>
                    <div className="grid grid-cols-2 gap-2">
                      {exportFormats.map((format) => (
                        <label key={format.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={packageSettings.formats.includes(format.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPackageSettings({
                                  ...packageSettings,
                                  formats: [...packageSettings.formats, format.id]
                                });
                              } else {
                                setPackageSettings({
                                  ...packageSettings,
                                  formats: packageSettings.formats.filter(f => f !== format.id)
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{format.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="include_preview"
                        checked={packageSettings.include_preview}
                        onChange={(e) => setPackageSettings({
                          ...packageSettings,
                          include_preview: e.target.checked
                        })}
                      />
                      <label htmlFor="include_preview">Include preview</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="include_metadata"
                        checked={packageSettings.include_metadata}
                        onChange={(e) => setPackageSettings({
                          ...packageSettings,
                          include_metadata: e.target.checked
                        })}
                      />
                      <label htmlFor="include_metadata">Include metadata</label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Access Control</label>
                    <select
                      value={packageSettings.access_control}
                      onChange={(e) => setPackageSettings({
                        ...packageSettings,
                        access_control: e.target.value
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="password_protected">Password Protected</option>
                    </select>
                  </div>

                  <button
                    onClick={generateShareablePackage}
                    disabled={loading}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Shareable Package'}
                  </button>
                </div>

                {/* Package Results */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Generated Packages</h3>
                  <div className="space-y-3">
                    {shareablePackages.map((pkg, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Package {index + 1}</span>
                          <span className="text-xs text-gray-500">
                            {pkg.package_metadata.formats_included.length} formats
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Created: {new Date(pkg.package_metadata.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(pkg.package_download_link, '_blank')}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                          >
                            <Download size={14} />
                            Download Package
                          </button>
                          <button
                            onClick={() => copyToClipboard(pkg.package_download_link)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                          >
                            <Copy size={14} />
                            Copy Link
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Optimization Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Platform Optimization</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Target Platform</label>
                    <div className="grid grid-cols-1 gap-2">
                      {platformIntegrationsConfig.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setTargetPlatform(platform.id)}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            targetPlatform === platform.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <platform.icon size={16} />
                            <span className="font-medium">{platform.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{platform.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={optimizeForPlatform}
                    disabled={loading}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading ? 'Optimizing...' : 'Optimize for Platform'}
                  </button>
                </div>

                {/* Optimization Results */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Optimization Results</h3>
                  <div className="space-y-3">
                    {Object.entries(optimizationResults).map(([platform, result]) => (
                      <div key={platform} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const platformConfig = platformIntegrationsConfig.find(p => p.id === platform);
                              const IconComponent = platformConfig?.icon;
                              return IconComponent ? <IconComponent size={16} /> : null;
                            })()}
                            <span className="font-medium capitalize">{platform}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            Score: {result.optimization_report?.platform_compatibility?.compatibility_score || 'N/A'}%
                          </span>
                        </div>
                        <div className="space-y-1">
                          {result.optimization_report?.optimization_changes && (
                            <div>
                              <p className="text-sm font-medium">Changes Made:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {Object.entries(result.optimization_report.optimization_changes).map(([key, value]) => (
                                  <li key={key}>{value as string}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              // Apply optimized content
                              console.log('Apply optimized content:', result.optimized_content);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            <Check size={14} />
                            Apply Changes
                          </button>
                          <button
                            onClick={() => {
                              // View detailed report
                              console.log('View detailed report:', result.optimization_report);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            <BarChart3 size={14} />
                            View Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FranciscaExportIntegrationPanel;



