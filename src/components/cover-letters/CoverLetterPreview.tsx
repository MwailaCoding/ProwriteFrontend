import React from 'react';
import { Download, Share2, Edit } from 'lucide-react';
import { Button } from '../common/Button';
import { CoverLetter } from '../../types';

interface CoverLetterPreviewProps {
  coverLetter: CoverLetter;
  onDownload?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
}

export const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({
  coverLetter,
  onDownload,
  onEdit,
  onShare
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sunset-500 to-coral-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{coverLetter.title}</h2>
            <p className="text-sunset-100">
              Created {new Date(coverLetter.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-white hover:bg-white hover:bg-opacity-20"
                icon={<Edit className="w-4 h-4" />}
              >
                Edit
              </Button>
            )}
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="text-white hover:bg-white hover:bg-opacity-20"
                icon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
            )}
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
                className="text-white hover:bg-white hover:bg-opacity-20"
                icon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cover Letter Content */}
      <div className="p-8">
        <div className="prose prose-sm max-w-none">
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="font-medium">Cover Letter Content:</div>
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {coverLetter.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
