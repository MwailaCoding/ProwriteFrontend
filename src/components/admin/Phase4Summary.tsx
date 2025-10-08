import React, { useState } from 'react';
import { 
  Zap, 
  Layers, 
  Settings, 
  BarChart3, 
  Share2, 
  Download,
  Shield,
  Globe,
  FileText,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { AdvancedPDFGenerator } from './AdvancedPDFGenerator';
import { PDFSharingCollaboration } from './PDFSharingCollaboration';
import { PDFTemplate, ResumeFormData } from '../../types';

interface Phase4SummaryProps {
  template: PDFTemplate;
  formData: ResumeFormData;
  onClose?: () => void;
}

export const Phase4Summary: React.FC<Phase4SummaryProps> = ({
  template,
  formData,
  onClose
}) => {
  const [activeComponent, setActiveComponent] = useState<'summary' | 'generator' | 'sharing'>('summary');

  const features = [
    {
      icon: Zap,
      title: 'Advanced PDF Generation',
      description: 'Professional PDF creation with optimization, multiple formats, and quality presets',
      benefits: [
        'Multiple output formats (PDF, Word, HTML, Text)',
        'Quality optimization (Low to Print-Ready)',
        'Compression and metadata control',
        'Password protection and security'
      ]
    },
    {
      icon: Layers,
      title: 'Batch Processing',
      description: 'Generate multiple versions simultaneously with different settings',
      benefits: [
        'Parallel processing for efficiency',
        'Multiple quality levels in one job',
        'Progress tracking and monitoring',
        'Cancel and resume capabilities'
      ]
    },
    {
      icon: Settings,
      title: 'Smart Presets',
      description: 'Pre-configured settings for different use cases and custom configurations',
      benefits: [
        'Built-in professional presets',
        'Custom preset creation and saving',
        'One-click optimization',
        'Preset sharing and reuse'
      ]
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track PDF performance, usage patterns, and engagement metrics',
      benefits: [
        'View and download tracking',
        'Geographic and device analytics',
        'Popular section identification',
        'Performance optimization insights'
      ]
    },
    {
      icon: Share2,
      title: 'Advanced Sharing',
      description: 'Secure sharing with granular permissions and collaboration features',
      benefits: [
        'Password-protected links',
        'Expiration dates and view limits',
        'Download and print controls',
        'Watermarking and branding'
      ]
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Professional-grade security features for sensitive documents',
      benefits: [
        'Access control and permissions',
        'Audit trails and logging',
        'Compliance and privacy features',
        'Secure collaboration tools'
      ]
    }
  ];

  const renderSummary = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Phase 4 Complete! 🎉
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced PDF Generation & Export System with Professional Features, 
          Batch Processing, Analytics, and Enterprise Security
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg mr-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{feature.description}</p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setActiveComponent('generator')}
            size="lg"
            icon={<Zap className="h-5 w-5" />}
          >
            Try Advanced Generator
          </Button>
          
          <Button
            onClick={() => setActiveComponent('sharing')}
            variant="outline"
            size="lg"
            icon={<Share2 className="h-5 w-5" />}
          >
            Explore Sharing Features
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          Experience the full power of professional PDF generation and collaboration
        </p>
      </div>

      {/* Technical Highlights */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          🚀 Technical Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Frontend Architecture</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Advanced PDF generation service</li>
              <li>• Batch processing interface</li>
              <li>• Preset management system</li>
              <li>• Real-time analytics dashboard</li>
              <li>• Secure sharing controls</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Backend Capabilities</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Multi-format PDF generation</li>
              <li>• Advanced optimization algorithms</li>
              <li>• Batch job processing</li>
              <li>• Analytics and tracking</li>
              <li>• Security and access control</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Use Cases */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          💼 Professional Use Cases
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">HR Professionals</h4>
            <p className="text-sm text-gray-600">
              Generate multiple resume formats for different job applications
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Recruiters</h4>
            <p className="text-sm text-gray-600">
              Share candidate resumes securely with hiring teams
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Career Coaches</h4>
            <p className="text-sm text-gray-600">
              Track resume performance and optimize for better results
            </p>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          🎯 What's Next?
        </h3>
        
        <div className="text-center space-y-4">
          <p className="text-gray-700">
            The PDF template system is now complete with enterprise-grade features!
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setActiveComponent('generator')}
              variant="outline"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Explore Advanced Features
            </Button>
            
            {onClose && (
              <Button onClick={onClose} variant="ghost">
                Return to Main System
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  if (activeComponent === 'generator') {
    return (
      <AdvancedPDFGenerator
        template={template}
        formData={formData}
        onClose={() => setActiveComponent('summary')}
      />
    );
  }

  if (activeComponent === 'sharing') {
    return (
      <PDFSharingCollaboration
        pdfId="demo-pdf-id"
        pdfName={template.name}
        onClose={() => setActiveComponent('summary')}
      />
    );
  }

  return renderSummary();
};
