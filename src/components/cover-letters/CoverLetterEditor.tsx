import React, { useState } from 'react';
import { Save, X, RotateCcw } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useApiMutation } from '../../hooks/useApi';
import { coverLetterService } from '../../services/coverLetterService';
import { CoverLetter } from '../../types';

interface CoverLetterEditorProps {
  coverLetter: CoverLetter;
  onSave?: (updatedContent: string) => void;
  onCancel?: () => void;
  onReset?: () => void;
}

export const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  coverLetter,
  onSave,
  onCancel,
  onReset
}) => {
  const [content, setContent] = useState(coverLetter.content);
  const [hasChanges, setHasChanges] = useState(false);

  const { execute: updateCoverLetter, loading } = useApiMutation(
    async (updatedContent: string) => {
      const response = await coverLetterService.updateCoverLetter(
        coverLetter.cover_letter_id,
        { content: updatedContent }
      );
      return response;
    },
    {
      onSuccess: () => {
        setHasChanges(false);
        onSave?.(content);
      }
    }
  );

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== coverLetter.content);
  };

  const handleSave = async () => {
    await updateCoverLetter(content);
  };

  const handleReset = () => {
    setContent(coverLetter.content);
    setHasChanges(false);
    onReset?.();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Cover Letter</h2>
          <p className="text-gray-600">Make changes to your cover letter content</p>
        </div>
        <div className="flex space-x-3">
          {onReset && (
            <Button
              variant="outline"
              onClick={handleReset}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
          )}
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              icon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={!hasChanges}
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Editor */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter Content
            </label>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent resize-none"
              placeholder="Enter your cover letter content..."
            />
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                You have unsaved changes. Click "Save Changes" to preserve your edits.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Character Count */}
      <div className="text-sm text-gray-500 text-center">
        {content.length} characters
      </div>
    </div>
  );
};
