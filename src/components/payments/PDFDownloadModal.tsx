import React, { useState } from 'react';
import { X, Download, Share2, Users, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ShareLinkPanel from './ShareLinkPanel';
import CollaborationPanel from './CollaborationPanel';

interface PDFDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string;
  documentType: string;
}

export const PDFDownloadModal: React.FC<PDFDownloadModalProps> = ({
  isOpen,
  onClose,
  reference,
  documentType
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'share' | 'collaborate'>('preview');
  const [pdfLoaded, setPdfLoaded] = useState(false);

  const pdfUrl = `https://prowrite.pythonanywhere.com/api/downloads/resume_${reference}.pdf`;
  const docxUrl = `https://prowrite.pythonanywhere.com/api/downloads/resume_${reference}.docx`;
  const shareUrl = `https://prowrite.vercel.app/shared/${reference}`;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Your {documentType} is Ready!</h3>
                <p className="text-blue-100">Reference: {reference}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📄 Preview & Download
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'share'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🔗 Share
            </button>
            <button
              onClick={() => setActiveTab('collaborate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'collaborate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Collaborate
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* PDF Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Document Preview</h4>
                  <button
                    onClick={handleOpenInNewTab}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open in New Tab</span>
                  </button>
                </div>
                
                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  {!pdfLoaded && (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading PDF preview...</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    src={pdfUrl}
                    className="w-full h-96"
                    onLoad={() => setPdfLoaded(true)}
                    title="PDF Preview"
                  />
                </div>
              </div>

              {/* Download Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Download className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-800">Download PDF</h4>
                      <p className="text-green-600 text-sm">High-quality PDF format</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    📄 Download PDF
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Download className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800">Download DOCX</h4>
                      <p className="text-blue-600 text-sm">Editable Word document</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadDOCX}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    📝 Download DOCX
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-yellow-800 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('share')}
                    className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share Document</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('collaborate')}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Invite Collaborators</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <ShareLinkPanel reference={reference} shareUrl={shareUrl} />
          )}

          {activeTab === 'collaborate' && (
            <CollaborationPanel reference={reference} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFDownloadModal;
