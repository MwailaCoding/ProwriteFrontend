import React, { useState } from 'react';
import { Brain, Target, TrendingUp, Zap } from 'lucide-react';
import ATSTracker from './ATSTracker';
import MarketInsights from './MarketInsights';

interface AIDashboardProps {
  resumeContent: string;
  targetJobTitle: string;
  targetIndustry: string;
  location?: string;
}

type DashboardTab = 'overview' | 'ats' | 'insights';

const AIDashboard: React.FC<AIDashboardProps> = ({
  resumeContent,
  targetJobTitle,
  targetIndustry,
  location = 'Global'
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [atsScore, setAtsScore] = useState<number | null>(null);

  const handleATSAnalysisComplete = (analysis: any) => {
    setAtsScore(analysis.score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        {atsScore ? (
          <>
            <div className={`text-6xl font-bold ${getScoreColor(atsScore)} mb-4`}>
              {atsScore}%
            </div>
            <div className="text-xl text-gray-700 mb-2">AI-Powered Resume Score</div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-400 mb-4">--</div>
            <div className="text-xl text-gray-700 mb-2">AI-Powered Resume Score</div>
            <div className="text-gray-500">Complete ATS analysis to get your score</div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('ats')}
          className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
        >
          <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">ATS Analysis</h3>
          <p className="text-sm text-gray-600">Check resume compatibility</p>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
        >
          <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Market Insights</h3>
          <p className="text-sm text-gray-600">Get industry trends</p>
        </button>

        <div className="p-6 bg-white border border-gray-200 rounded-lg text-center">
          <Zap className="h-8 w-8 text-orange-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">AI Enhancement</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'ats':
        return (
          <ATSTracker
            resumeContent={resumeContent}
            targetJobTitle={targetJobTitle}
            onAnalysisComplete={handleATSAnalysisComplete}
          />
        );
      case 'insights':
        return (
          <MarketInsights
            industry={targetIndustry}
            jobTitle={targetJobTitle}
            location={location}
          />
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Resume Dashboard</h1>
          <p className="text-gray-600">Optimize your resume with AI-driven insights</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-2 mb-6">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: Brain },
              { id: 'ats', label: 'ATS Tracker', icon: Target },
              { id: 'insights', label: 'Market Insights', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="transition-opacity duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
