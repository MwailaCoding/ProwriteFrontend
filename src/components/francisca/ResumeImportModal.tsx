import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye,
  Download,
  RefreshCw,
  File,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (data: any) => void;
}

interface ParsedResume {
  id: string;
  filename: string;
  parsed_data: any;
  raw_text: string;
  parsed_at: string;
  file_type: string;
}

const ResumeImportModal: React.FC<ResumeImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedResumes, setParsedResumes] = useState<ParsedResume[]>([]);
  const [selectedResume, setSelectedResume] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc']
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    
    try {
      // Validate file type
      const fileType = file.type;
      if (!Object.keys(acceptedFileTypes).includes(fileType)) {
        throw new Error('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Show parsing state
      setParsing(true);
      
      // Upload and parse file using API service with extended timeout
      const response = await api.post('/api/francisca/import-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for file upload and parsing
      });
      
      const result = response.data;
      
      if (result.success) {
        const newResume: ParsedResume = {
          id: result.resume_id,
          filename: file.name,
          parsed_data: result.parsed_data,
          raw_text: result.raw_text,
          parsed_at: result.parsed_at,
          file_type: result.file_type
        };
        
        setParsedResumes(prev => [newResume, ...prev]);
        setSelectedResume(newResume);
        setPreviewMode(true);
      } else {
        throw new Error(result.error || 'Failed to parse resume');
      }
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Upload timeout. The file is taking too long to process. Please try with a smaller file or check your connection.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleImport = () => {
    if (selectedResume) {
      onImportSuccess(selectedResume.parsed_data);
      onClose();
    }
  };

  const handlePreview = (resume: ParsedResume) => {
    setSelectedResume(resume);
    setPreviewMode(true);
  };

  const handleBackToList = () => {
    setPreviewMode(false);
    setSelectedResume(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Import Existing Resume</h3>
              <p className="text-sm text-blue-100">
                {previewMode ? 'Preview and import resume data' : 'Upload your resume to auto-fill the form'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!previewMode ? (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {uploading ? (parsing ? 'Parsing your resume...' : 'Uploading file...') : 'Drop your resume here'}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {uploading ? 'Please wait while we process your file' : 'or click to browse files'}
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {parsing ? 'Parsing Resume...' : 'Uploading...'}
                        </>
                      ) : (
                        'Choose File'
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, and DOCX files (max 10MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Previously Parsed Resumes */}
              {parsedResumes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Previously Imported Resumes
                  </h4>
                  <div className="space-y-3">
                    {parsedResumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getFileIcon(resume.file_type)}</span>
                          <div>
                            <p className="font-medium text-gray-800">{resume.filename}</p>
                            <p className="text-sm text-gray-500">
                              Parsed {new Date(resume.parsed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePreview(resume)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToList}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Resume Preview
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedResume?.filename}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Import to Form</span>
                </button>
              </div>

              {/* Parsed Data Preview */}
              {selectedResume && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="text-lg font-semibold text-gray-800 mb-4">
                    Extracted Information
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div>
                      <h6 className="font-medium text-gray-700 mb-3">Personal Information</h6>
                      <div className="space-y-2">
                        {(selectedResume.parsed_data.personalInfo || selectedResume.parsed_data.personal_info) && Object.entries(selectedResume.parsed_data.personalInfo || selectedResume.parsed_data.personal_info).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {key.replace('_', ' ')}:
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {value as string}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedResume.parsed_data.summary && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-3">Summary</h6>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {selectedResume.parsed_data.summary}
                        </p>
                      </div>
                    )}

                    {/* Experience */}
                    {(selectedResume.parsed_data.professionalExperience || selectedResume.parsed_data.experience) && (selectedResume.parsed_data.professionalExperience || selectedResume.parsed_data.experience).length > 0 && (
                      <div className="md:col-span-2">
                        <h6 className="font-medium text-gray-700 mb-3">Experience</h6>
                        <div className="space-y-3">
                          {(selectedResume.parsed_data.professionalExperience || selectedResume.parsed_data.experience).map((exp: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h7 className="font-medium text-gray-800">{exp.title || exp.position}</h7>
                                <span className="text-sm text-gray-500">{exp.duration}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                              {exp.description && (
                                <p className="text-sm text-gray-500">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {selectedResume.parsed_data.education && selectedResume.parsed_data.education.length > 0 && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-3">Education</h6>
                        <div className="space-y-2">
                          {selectedResume.parsed_data.education.map((edu: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <h7 className="font-medium text-gray-800">{edu.degree}</h7>
                              <p className="text-sm text-gray-600">{edu.institution}</p>
                              {edu.graduation_year && (
                                <p className="text-sm text-gray-500">{edu.graduation_year}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {selectedResume.parsed_data.skills && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-3">Skills</h6>
                        {typeof selectedResume.parsed_data.skills === 'object' ? (
                          <div className="space-y-4">
                            {/* Technical Skills */}
                            {selectedResume.parsed_data.skills.technical && selectedResume.parsed_data.skills.technical.length > 0 && (
                              <div>
                                <h7 className="text-sm font-medium text-gray-600 mb-2">Technical Skills</h7>
                                <div className="flex flex-wrap gap-2">
                                  {selectedResume.parsed_data.skills.technical.map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Soft Skills */}
                            {selectedResume.parsed_data.skills.soft && selectedResume.parsed_data.skills.soft.length > 0 && (
                              <div>
                                <h7 className="text-sm font-medium text-gray-600 mb-2">Soft Skills</h7>
                                <div className="flex flex-wrap gap-2">
                                  {selectedResume.parsed_data.skills.soft.map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Languages */}
                            {selectedResume.parsed_data.skills.languages && selectedResume.parsed_data.skills.languages.length > 0 && (
                              <div>
                                <h7 className="text-sm font-medium text-gray-600 mb-2">Languages</h7>
                                <div className="flex flex-wrap gap-2">
                                  {selectedResume.parsed_data.skills.languages.map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedResume.parsed_data.skills.map((skill: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Projects */}
                    {selectedResume.parsed_data.projects && selectedResume.parsed_data.projects.length > 0 && (
                      <div className="md:col-span-2">
                        <h6 className="font-medium text-gray-700 mb-3">Projects</h6>
                        <div className="space-y-3">
                          {selectedResume.parsed_data.projects.map((project: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <h7 className="font-medium text-gray-800">{project.name}</h7>
                              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.technologies.map((tech: string, techIndex: number) => (
                                    <span
                                      key={techIndex}
                                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {selectedResume.parsed_data.certifications && selectedResume.parsed_data.certifications.length > 0 && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-3">Certifications</h6>
                        <div className="space-y-2">
                          {selectedResume.parsed_data.certifications.map((cert: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <h7 className="font-medium text-gray-800">
                                {typeof cert === 'string' ? cert : cert.name}
                              </h7>
                              {typeof cert === 'object' && cert.issuer && (
                                <p className="text-sm text-gray-600">{cert.issuer}</p>
                              )}
                              {typeof cert === 'object' && cert.date && (
                                <p className="text-sm text-gray-500">{cert.date}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {selectedResume.parsed_data.achievements && selectedResume.parsed_data.achievements.length > 0 && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-3">Achievements</h6>
                        <div className="space-y-2">
                          {selectedResume.parsed_data.achievements.map((achievement: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <div className="text-sm text-gray-700">{achievement}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {previewMode 
                ? 'Review the extracted information and click "Import to Form" to continue'
                : 'Upload your resume to automatically fill the form with your information'
              }
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              {previewMode && (
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Import to Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeImportModal;
