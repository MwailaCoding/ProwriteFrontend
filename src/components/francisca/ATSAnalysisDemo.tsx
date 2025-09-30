import React, { useState } from 'react';
import { Eye, BarChart3, Download, Target, CheckCircle, Star, TrendingUp } from 'lucide-react';

interface ATSAnalysisDemoProps {
  onStartDemo: () => void;
}

const ATSAnalysisDemo: React.FC<ATSAnalysisDemoProps> = ({ onStartDemo }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  const features = [
    {
      icon: Eye,
      title: "Preview ATS Score",
      description: "See your ATS score before downloading",
      color: "purple",
      action: "Pre-download analysis"
    },
    {
      icon: BarChart3,
      title: "Download & Analyze",
      description: "Download resume and get detailed analysis",
      color: "green",
      action: "Complete workflow"
    },
    {
      icon: Download,
      title: "Quick Download",
      description: "Download without analysis",
      color: "blue",
      action: "Standard download"
    },
    {
      icon: Target,
      title: "Analyze Resume",
      description: "Analyze your resume after downloading",
      color: "orange",
      action: "Post-download analysis"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg border border-blue-200">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Real ATS Analysis & Performance Predictor
        </h3>
        <p className="text-gray-600 mb-6">
          Get comprehensive ATS analysis with real-world performance metrics before or after downloading your resume
        </p>
        
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
        >
          <BarChart3 className="h-5 w-5" />
          <span>{showFeatures ? 'Hide Features' : 'See All Features'}</span>
        </button>
      </div>

      {showFeatures && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${getColorClasses(feature.color)}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 mb-3">
                    {feature.description}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(feature.color)}`}>
                    {feature.action}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          What You'll Get
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
            <div className="text-sm text-gray-600">Overall ATS Score</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">92%</div>
            <div className="text-sm text-gray-600">Interview Rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">6.2s</div>
            <div className="text-sm text-gray-600">Recruiter Scan Time</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onStartDemo}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
        >
          <TrendingUp className="h-5 w-5" />
          <span>Start ATS Analysis Demo</span>
        </button>
        <p className="text-sm text-gray-500 mt-3">
          Experience real ATS analysis with industry-standard metrics
        </p>
      </div>
    </div>
  );
};

export default ATSAnalysisDemo;

