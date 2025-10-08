import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Link, 
  Mail, 
  Lock, 
  Eye, 
  Download, 
  Clock, 
  Users,
  BarChart3,
  Settings,
  Copy,
  QrCode,
  Shield,
  Globe
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { advancedPDFService } from '../../services/advancedPDFService';

interface PDFSharingCollaborationProps {
  pdfId: string;
  pdfName: string;
  onClose?: () => void;
}

export const PDFSharingCollaboration: React.FC<PDFSharingCollaborationProps> = ({
  pdfId,
  pdfName,
  onClose
}) => {
  const [currentTab, setCurrentTab] = useState<'share' | 'collaboration' | 'analytics' | 'security'>('share');
  const [shareOptions, setShareOptions] = useState({
    expiresAt: '',
    password: '',
    allowDownload: true,
    allowPrint: true,
    maxViews: 0,
    watermark: false,
    watermarkText: '',
    notifyOnAccess: false,
    emailNotifications: false
  });
  const [shareLinks, setShareLinks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadShareLinks();
    loadAnalytics();
  }, [pdfId]);

  const loadShareLinks = async () => {
    try {
      // This would be implemented in the backend
      // For now, we'll use mock data
      setShareLinks([
        {
          id: '1',
          shareUrl: 'https://example.com/share/abc123',
          expiresAt: '2024-12-31',
          accessCount: 5,
          maxViews: 10,
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('Failed to load share links:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await advancedPDFService.getPDFAnalytics(pdfId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const createShareLink = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await advancedPDFService.createShareableLink(pdfId, shareOptions);
      
      setShareLinks(prev => [result, ...prev]);
      setSuccess('Share link created successfully!');
      
      // Reset form
      setShareOptions({
        expiresAt: '',
        password: '',
        allowDownload: true,
        allowPrint: true,
        maxViews: 0,
        watermark: false,
        watermarkText: '',
        notifyOnAccess: false,
        emailNotifications: false
      });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create share link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };

  const deactivateLink = async (linkId: string) => {
    try {
      setShareLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, isActive: false } : link
      ));
      setSuccess('Link deactivated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to deactivate link');
    }
  };

  const renderShareTab = () => (
    <div className="space-y-6">
      {/* Create Share Link */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Create Share Link
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expires At</label>
            <input
              type="datetime-local"
              value={shareOptions.expiresAt}
              onChange={(e) => setShareOptions(prev => ({ ...prev, expiresAt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password (Optional)</label>
            <input
              type="password"
              value={shareOptions.password}
              onChange={(e) => setShareOptions(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty for no password"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Views</label>
            <input
              type="number"
              value={shareOptions.maxViews}
              onChange={(e) => setShareOptions(prev => ({ ...prev, maxViews: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0 = unlimited"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Text</label>
            <input
              type="text"
              value={shareOptions.watermarkText}
              onChange={(e) => setShareOptions(prev => ({ ...prev, watermarkText: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Optional watermark text"
            />
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Download</label>
              <p className="text-xs text-gray-500">Users can download the PDF</p>
            </div>
            <input
              type="checkbox"
              checked={shareOptions.allowDownload}
              onChange={(e) => setShareOptions(prev => ({ ...prev, allowDownload: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Print</label>
              <p className="text-xs text-gray-500">Users can print the PDF</p>
            </div>
            <input
              type="checkbox"
              checked={shareOptions.allowPrint}
              onChange={(e) => setShareOptions(prev => ({ ...prev, allowPrint: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Add Watermark</label>
              <p className="text-xs text-gray-500">Overlay watermark on shared PDFs</p>
            </div>
            <input
              type="checkbox"
              checked={shareOptions.watermark}
              onChange={(e) => setShareOptions(prev => ({ ...prev, watermark: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <Button
          onClick={createShareLink}
          loading={isLoading}
          icon={<Link className="h-4 w-4" />}
        >
          Create Share Link
        </Button>
      </Card>

      {/* Active Share Links */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Link className="h-5 w-5 mr-2" />
          Active Share Links
        </h3>
        
        <div className="space-y-3">
          {shareLinks.map((link) => (
            <div key={link.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Share Link</span>
                  {link.isActive ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => copyToClipboard(link.shareUrl)}
                    variant="ghost"
                    size="sm"
                    icon={<Copy className="h-4 w-4" />}
                  >
                    Copy
                  </Button>
                  
                  {link.isActive && (
                    <Button
                      onClick={() => deactivateLink(link.id)}
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="h-4 w-4" />}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">URL:</span> {link.shareUrl}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                <div>
                  <Clock className="h-3 w-3 inline mr-1" />
                  Expires: {link.expiresAt || 'Never'}
                </div>
                <div>
                  <Eye className="h-3 w-3 inline mr-1" />
                  Views: {link.accessCount}/{link.maxViews || '∞'}
                </div>
                <div>
                  <Download className="h-3 w-3 inline mr-1" />
                  Downloads: {link.allowDownload ? 'Allowed' : 'Blocked'}
                </div>
                <div>
                  <Users className="h-3 w-3 inline mr-1" />
                  Status: {link.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))}
          
          {shareLinks.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No share links created yet. Create one above to get started.
            </p>
          )}
        </div>
      </Card>
    </div>
  );

  const renderCollaborationTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Team Collaboration
        </h3>
        
        <p className="text-gray-600 mb-6">
          Invite team members to collaborate on this PDF with different permission levels.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Team collaboration features are coming soon! This will include:
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Invite team members with specific permissions</li>
            <li>• Real-time commenting and feedback</li>
            <li>• Version control and change tracking</li>
            <li>• Approval workflows</li>
            <li>• Team activity dashboard</li>
          </ul>
        </div>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          PDF Analytics
        </h3>
        
        {analytics ? (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.views}</div>
                <div className="text-sm text-blue-800">Total Views</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.downloads}</div>
                <div className="text-sm text-green-800">Downloads</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analytics.shares}</div>
                <div className="text-sm text-purple-800">Shares</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(analytics.averageViewTime / 60)}m
                </div>
                <div className="text-sm text-orange-800">Avg. View Time</div>
              </div>
            </div>
            
            {/* Popular Sections */}
            {analytics.popularSections && analytics.popularSections.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Most Viewed Sections</h4>
                <div className="space-y-2">
                  {analytics.popularSections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{section}</span>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Device Types */}
            {analytics.deviceTypes && Object.keys(analytics.deviceTypes).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Device Types</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.deviceTypes).map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 capitalize">{device}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No analytics data available yet.</p>
            <p className="text-sm">Analytics will appear after the PDF is shared and viewed.</p>
          </div>
        )}
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security Settings
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Security Recommendations</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Use strong passwords for sensitive documents</li>
                  <li>• Set expiration dates for temporary access</li>
                  <li>• Limit download and print permissions</li>
                  <li>• Monitor access patterns regularly</li>
                  <li>• Use watermarks for brand protection</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Access Control</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Password protection available</div>
                <div>• View count limitations</div>
                <div>• Expiration date settings</div>
                <div>• Permission restrictions</div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Monitoring</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Real-time access tracking</div>
                <div>• Geographic location data</div>
                <div>• Device type analytics</div>
                <div>• Usage pattern insights</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Sharing & Collaboration</h1>
        <p className="text-gray-600">
          Share your resume securely and collaborate with team members
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          {[
            { key: 'share', label: 'Share Links', icon: Share2 },
            { key: 'collaboration', label: 'Collaboration', icon: Users },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
            { key: 'security', label: 'Security', icon: Shield }
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
      {currentTab === 'share' && renderShareTab()}
      {currentTab === 'collaboration' && renderCollaborationTab()}
      {currentTab === 'analytics' && renderAnalyticsTab()}
      {currentTab === 'security' && renderSecurityTab()}

      {/* Success/Error Messages */}
      {success && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <span className="text-green-800">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="mt-8 text-center">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      )}
    </div>
  );
};
