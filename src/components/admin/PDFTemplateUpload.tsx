import React, { useState } from 'react';

interface UploadData {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  pageCount: string;
  tags: string;
  pdfFile: File | null;
  thumbnailFile: File | null;
}

export const PDFTemplateUpload: React.FC = () => {
  const [uploadData, setUploadData] = useState<UploadData>({
    name: '',
    description: '',
    category: 'Professional',
    difficulty: 'Beginner',
    pageCount: '1',
    tags: '',
    pdfFile: null,
    thumbnailFile: null
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const categories = [
    'Professional',
    'Creative',
    'Academic',
    'Technical',
    'Entry-Level',
    'Executive',
    'Modern',
    'Classic'
  ];

  const difficulties = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  const handleInputChange = (field: keyof UploadData, value: string) => {
    setUploadData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: 'pdfFile' | 'thumbnailFile', file: File | null) => {
    setUploadData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      if (!uploadData.pdfFile) {
        throw new Error('Please select a PDF file');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('pdf', uploadData.pdfFile);
      formData.append('name', uploadData.name || 'Untitled Template');
      formData.append('description', uploadData.description || 'No description');
      formData.append('category', uploadData.category);
      formData.append('difficulty', uploadData.difficulty);
      formData.append('pageCount', uploadData.pageCount);
      formData.append('tags', uploadData.tags);

      console.log('Uploading template:', {
        name: uploadData.name,
        category: uploadData.category,
        difficulty: uploadData.difficulty,
        pageCount: uploadData.pageCount,
        fileSize: uploadData.pdfFile.size
      });

      // Make API call to new clean endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/upload-template-new`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      setUploadStatus({
        type: 'success',
        message: `✅ Template uploaded successfully! ID: ${result.id}`
      });

      // Reset form
      setUploadData({
        name: '',
        description: '',
        category: 'Professional',
        difficulty: 'Beginner',
        pageCount: '1',
        tags: '',
        pdfFile: null,
        thumbnailFile: null
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: `❌ Upload failed: ${error.message}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload PDF Template</h1>
          <p className="text-gray-600">
            Add new resume templates to the system. Upload PDF files and provide metadata.
          </p>
        </div>

        {/* Status Message */}
        {uploadStatus.type && (
          <div className={`mb-6 p-4 rounded-lg ${
            uploadStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{uploadStatus.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={uploadData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Modern Professional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={uploadData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                value={uploadData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Count and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Count *
              </label>
              <input
                type="number"
                value={uploadData.pageCount}
                onChange={(e) => handleInputChange('pageCount', e.target.value)}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={uploadData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Add tags separated by commas"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={uploadData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the template design and target audience..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* PDF File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF Template File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange('pdfFile', e.target.files?.[0] || null)}
                className="hidden"
                id="pdf-upload"
                required
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {uploadData.pdfFile ? uploadData.pdfFile.name : 'Click to upload PDF'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {uploadData.pdfFile ? `File size: ${(uploadData.pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF files only, max 10MB'}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Thumbnail Upload (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('thumbnailFile', e.target.files?.[0] || null)}
                className="hidden"
                id="thumbnail-upload"
              />
              <label htmlFor="thumbnail-upload" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {uploadData.thumbnailFile ? uploadData.thumbnailFile.name : 'Click to upload image'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {uploadData.thumbnailFile ? `File size: ${(uploadData.thumbnailFile.size / 1024 / 1024).toFixed(2)} MB` : 'JPG, PNG, max 5MB'}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isUploading}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload Template'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

