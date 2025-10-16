import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, Eye, ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SharedDocumentPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [documentInfo, setDocumentInfo] = useState<any>(null);

  const pdfUrl = `https://prowrite.pythonanywhere.com/api/downloads/resume_${reference}.pdf`;
  const docxUrl = `https://prowrite.pythonanywhere.com/api/downloads/resume_${reference}.docx`;

  useEffect(() => {
    if (reference) {
      // Track view analytics
      console.log(`Document viewed: ${reference}`);
      // In real app, send analytics to backend
    }
  }, [reference]);

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `resume_${reference}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('PDF download started!');
  };

  const handleDownloadDOCX = () => {
    const link = document.createElement('a');
    link.href = docxUrl;
    link.download = `resume_${reference}.docx`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('DOCX download started!');
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy share link');
    }
  };

  if (!reference) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h1>
          <p className="text-gray-600 mb-6">The document reference is invalid.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Prowrite</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Shared Document</h1>
                <p className="text-sm text-gray-600">Reference: {reference}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in New Tab</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* PDF Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Document Preview</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>Read-only view</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {!pdfLoaded && (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading document...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={pdfUrl}
                  className="w-full h-[600px] border border-gray-200 rounded-lg"
                  onLoad={() => setPdfLoaded(true)}
                  title="Shared Document Preview"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Download Options */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Options</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadDOCX}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download DOCX</span>
                  </button>
                </div>
              </div>

              {/* Document Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">PDF/DOCX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Access:</span>
                    <span className="font-medium">Public</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Available</span>
                  </div>
                </div>
              </div>

              {/* Watermark */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Share2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">Shared by Prowrite</h4>
                  <p className="text-sm text-blue-700">
                    This document was created and shared using Prowrite AI Resume Builder
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Create Your Own →
                  </button>
                </div>
              </div>

              {/* Share Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Sharing Information</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• This is a read-only view</li>
                  <li>• You can download the document</li>
                  <li>• Share link: {window.location.href}</li>
                  <li>• No login required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 Prowrite AI Resume Builder. All rights reserved.</p>
            <p className="mt-1">This document was shared using Prowrite's secure sharing system.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SharedDocumentPage;

