import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { coverLetterService } from '../../services/coverLetterService';
import { CoverLetterEditor } from '../../components/cover-letters/CoverLetterEditor';
import { CoverLetterPreview } from '../../components/cover-letters/CoverLetterPreview';
import { CoverLetterEnhancer } from '../../components/cover-letters/CoverLetterEnhancer';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';

export const EditCoverLetterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const { data: coverLetter, loading, execute: refetchCoverLetter } = useApi(
    () => coverLetterService.getCoverLetter(parseInt(id!))
  );

  const handleSave = (updatedContent: string) => {
    // Update the local state to reflect changes
    if (coverLetter) {
      coverLetter.content = updatedContent;
    }
    setIsPreviewMode(true);
  };

  const handleContentUpdate = (newContent: string) => {
    if (coverLetter) {
      coverLetter.content = newContent;
    }
  };

  const handleCancel = () => {
          navigate('/app/cover-letters');
  };

  const handleDownload = async () => {
    if (coverLetter) {
      try {
        const blob = await coverLetterService.downloadCoverLetterById(coverLetter.cover_letter_id, 'pdf');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cover-letter-${coverLetter.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cover Letter Not Found</h2>
          <p className="text-gray-600 mb-6">
            The cover letter you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <button
            onClick={() => navigate('/app/cover-letters')}
            className="bg-sunset-gradient text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Back to Cover Letters
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Cover Letter</h1>
              <p className="text-gray-600 mt-2">
                {coverLetter.title} - Created {new Date(coverLetter.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEnhancer(!showEnhancer)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {showEnhancer ? 'Hide Enhancer' : 'Show Enhancer'}
              </button>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
              <button
                onClick={() => navigate('/app/cover-letters')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Library
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {showEnhancer && (
          <div className="mb-8">
            <CoverLetterEnhancer
              coverLetter={coverLetter}
              jobDescription={jobDescription}
              onContentUpdate={handleContentUpdate}
            />
          </div>
        )}

        {isPreviewMode ? (
          <CoverLetterPreview
            coverLetter={coverLetter}
            onDownload={handleDownload}
            onEdit={() => setIsPreviewMode(false)}
          />
        ) : (
          <CoverLetterEditor
            coverLetter={coverLetter}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};
