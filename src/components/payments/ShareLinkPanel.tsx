import React, { useState } from 'react';
import { Copy, Check, Share2, QrCode, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareLinkPanelProps {
  reference: string;
  shareUrl: string;
}

export const ShareLinkPanel: React.FC<ShareLinkPanelProps> = ({
  reference,
  shareUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenShareLink = () => {
    window.open(shareUrl, '_blank');
  };

  const generateQRCode = () => {
    // Simple QR code generation using a service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    return qrUrl;
  };

  return (
    <div className="space-y-6">
      {/* Share Link Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Share2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-blue-800">Share Your Document</h4>
            <p className="text-blue-600 text-sm">Anyone with this link can view your document</p>
          </div>
        </div>

        {/* Share Link Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Share Link
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 inline mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 inline mr-2" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleOpenShareLink}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Share Link</span>
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <QrCode className="h-4 w-4" />
            <span>{showQR ? 'Hide' : 'Show'} QR Code</span>
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      {showQR && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">QR Code for Mobile Sharing</h4>
          <div className="text-center">
            <img
              src={generateQRCode()}
              alt="QR Code for sharing"
              className="mx-auto border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-600 mt-3">
              Scan this QR code with your phone to open the share link
            </p>
          </div>
        </div>
      )}

      {/* Share Options */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-yellow-800 mb-4">Share Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h5 className="font-semibold text-gray-800 mb-2">📧 Email</h5>
            <p className="text-sm text-gray-600 mb-3">
              Copy the link and paste it in your email
            </p>
            <button
              onClick={handleCopyLink}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Copy Link for Email
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h5 className="font-semibold text-gray-800 mb-2">💬 Social Media</h5>
            <p className="text-sm text-gray-600 mb-3">
              Share on WhatsApp, LinkedIn, or other platforms
            </p>
            <button
              onClick={handleCopyLink}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Copy Link for Social
            </button>
          </div>
        </div>
      </div>

      {/* Link Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Link Information</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Reference:</strong> {reference}</li>
          <li>• <strong>Access:</strong> Anyone with the link can view</li>
          <li>• <strong>Format:</strong> Read-only PDF viewer</li>
          <li>• <strong>Expiration:</strong> Link doesn't expire</li>
        </ul>
      </div>
    </div>
  );
};

export default ShareLinkPanel;

