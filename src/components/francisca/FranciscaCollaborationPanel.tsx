import React, { useState, useEffect } from 'react';
import {
  Share2,
  Users,
  MessageSquare,
  GitBranch,
  Download,
  Copy,
  QrCode,
  Eye,
  Lock,
  Calendar,
  Star,
  ThumbsUp,
  ThumbsDown,
  History,
  BarChart3,
  Settings,
  Plus,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface CollaborationPanelProps {
  resumeContent: any;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareableLink {
  shareable_link: string;
  share_id: string;
  sharing_metadata: {
    is_public: boolean;
    password_protected: boolean;
    view_only: boolean;
    expiration_date?: string;
  };
  qr_code: string;
  embed_code: string;
}

interface Collaborator {
  collaborator_id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  status: string;
  invitation_link: string;
}

interface Feedback {
  feedback_id: string;
  type: string;
  category: string;
  focus_area: string;
  reviewer_role: string;
  ai_feedback: string;
  manual_feedback: string;
  rating: number;
  priority: string;
  suggestions: string[];
  timestamp: string;
}

interface Version {
  version_id: string;
  version_number: number;
  version_name: string;
  description: string;
  state: string;
  created_at: string;
  created_by: string;
  approval_status: string;
}

const FranciscaCollaborationPanel: React.FC<CollaborationPanelProps> = ({
  resumeContent,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'sharing' | 'collaborators' | 'feedback' | 'versions'>('sharing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sharing state
  const [shareableLink, setShareableLink] = useState<ShareableLink | null>(null);
  const [sharingSettings, setSharingSettings] = useState({
    is_public: false,
    password_protected: false,
    password: '',
    expiration_date: '',
    view_only: true
  });

  // Collaborators state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaborator, setNewCollaborator] = useState({
    email: '',
    name: '',
    role: 'viewer'
  });

  // Feedback state
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'general',
    category: 'content_quality',
    focus: 'overall_improvement',
    reviewer_role: 'professional',
    manual_feedback: '',
    rating: 5
  });

  // Version control state
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionForm, setVersionForm] = useState({
    version_name: '',
    description: '',
    state: 'draft'
  });

  // Create shareable link
  const createShareableLink = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/francisca/collaboration/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          sharing_settings: {
            ...sharingSettings,
            created_by: 'current_user'
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShareableLink(data.result);
      } else {
        setError(data.error || 'Failed to create shareable link');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add collaborator
  const addCollaborator = async () => {
    if (!newCollaborator.email || !newCollaborator.name) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/francisca/collaboration/add-collaborator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: 'current_resume_id',
          collaborator_info: newCollaborator,
          role: newCollaborator.role
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCollaborators([...collaborators, data.result.collaborator]);
        setNewCollaborator({ email: '', name: '', role: 'viewer' });
      } else {
        setError(data.error || 'Failed to add collaborator');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Provide feedback
  const provideFeedback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/francisca/collaboration/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_content: JSON.stringify(resumeContent),
          feedback_data: feedbackForm
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFeedbackHistory([...feedbackHistory, data.result.feedback]);
        setFeedbackForm({
          type: 'general',
          category: 'content_quality',
          focus: 'overall_improvement',
          reviewer_role: 'professional',
          manual_feedback: '',
          rating: 5
        });
      } else {
        setError(data.error || 'Failed to provide feedback');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create version
  const createVersion = async () => {
    if (!versionForm.version_name) {
      setError('Please provide a version name');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/francisca/collaboration/version-control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          version_info: {
            ...versionForm,
            version_number: versions.length + 1,
            created_by: 'current_user'
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setVersions([...versions, data.result.version]);
        setVersionForm({ version_name: '', description: '', state: 'draft' });
      } else {
        setError(data.error || 'Failed to create version');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Collaboration & Sharing</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'sharing', label: 'Sharing', icon: Share2 },
            { id: 'collaborators', label: 'Collaborators', icon: Users },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
            { id: 'versions', label: 'Versions', icon: GitBranch }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Sharing Tab */}
          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Sharing Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={sharingSettings.is_public}
                      onChange={(e) => setSharingSettings({
                        ...sharingSettings,
                        is_public: e.target.checked
                      })}
                    />
                    <label htmlFor="is_public">Public Link</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="password_protected"
                      checked={sharingSettings.password_protected}
                      onChange={(e) => setSharingSettings({
                        ...sharingSettings,
                        password_protected: e.target.checked
                      })}
                    />
                    <label htmlFor="password_protected">Password Protected</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="view_only"
                      checked={sharingSettings.view_only}
                      onChange={(e) => setSharingSettings({
                        ...sharingSettings,
                        view_only: e.target.checked
                      })}
                    />
                    <label htmlFor="view_only">View Only</label>
                  </div>
                </div>
                {sharingSettings.password_protected && (
                  <div className="mt-4">
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={sharingSettings.password}
                      onChange={(e) => setSharingSettings({
                        ...sharingSettings,
                        password: e.target.value
                      })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                <div className="mt-4">
                  <input
                    type="date"
                    value={sharingSettings.expiration_date}
                    onChange={(e) => setSharingSettings({
                      ...sharingSettings,
                      expiration_date: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    placeholder="Expiration date (optional)"
                  />
                </div>
                <button
                  onClick={createShareableLink}
                  disabled={loading}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Shareable Link'}
                </button>
              </div>

              {shareableLink && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Shareable Link Created</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shareableLink.shareable_link}
                        readOnly
                        className="flex-1 p-2 border rounded bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(shareableLink.shareable_link)}
                        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
                        <QrCode size={16} />
                        QR Code
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded text-sm">
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collaborators Tab */}
          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Add Collaborator</h3>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={newCollaborator.email}
                    onChange={(e) => setNewCollaborator({
                      ...newCollaborator,
                      email: e.target.value
                    })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={newCollaborator.name}
                    onChange={(e) => setNewCollaborator({
                      ...newCollaborator,
                      name: e.target.value
                    })}
                    className="p-2 border rounded"
                  />
                  <select
                    value={newCollaborator.role}
                    onChange={(e) => setNewCollaborator({
                      ...newCollaborator,
                      role: e.target.value
                    })}
                    className="p-2 border rounded"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <button
                  onClick={addCollaborator}
                  disabled={loading}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Collaborator'}
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Current Collaborators</h3>
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.collaborator_id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{collaborator.name}</p>
                        <p className="text-sm text-gray-500">{collaborator.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{collaborator.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          collaborator.status === 'active' ? 'bg-green-100 text-green-700' :
                          collaborator.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {collaborator.status}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Provide Feedback</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <select
                    value={feedbackForm.type}
                    onChange={(e) => setFeedbackForm({
                      ...feedbackForm,
                      type: e.target.value
                    })}
                    className="p-2 border rounded"
                  >
                    <option value="general">General</option>
                    <option value="content">Content</option>
                    <option value="formatting">Formatting</option>
                    <option value="structure">Structure</option>
                  </select>
                  <select
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm({
                      ...feedbackForm,
                      category: e.target.value
                    })}
                    className="p-2 border rounded"
                  >
                    <option value="content_quality">Content Quality</option>
                    <option value="structure_formatting">Structure & Formatting</option>
                    <option value="professional_presentation">Professional Presentation</option>
                    <option value="strategic_alignment">Strategic Alignment</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackForm({
                          ...feedbackForm,
                          rating: star
                        })}
                        className={`p-1 ${feedbackForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star size={20} fill={feedbackForm.rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Additional feedback (optional)"
                  value={feedbackForm.manual_feedback}
                  onChange={(e) => setFeedbackForm({
                    ...feedbackForm,
                    manual_feedback: e.target.value
                  })}
                  className="w-full p-2 border rounded h-24"
                />
                <button
                  onClick={provideFeedback}
                  disabled={loading}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Feedback History</h3>
                <div className="space-y-4">
                  {feedbackHistory.map((feedback) => (
                    <div key={feedback.feedback_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">{feedback.category.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-500">{feedback.reviewer_role}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={feedback.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{feedback.ai_feedback}</p>
                      {feedback.manual_feedback && (
                        <p className="text-sm text-gray-600 italic">"{feedback.manual_feedback}"</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          feedback.priority === 'high' ? 'bg-red-100 text-red-700' :
                          feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {feedback.priority} priority
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Create New Version</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Version name"
                    value={versionForm.version_name}
                    onChange={(e) => setVersionForm({
                      ...versionForm,
                      version_name: e.target.value
                    })}
                    className="p-2 border rounded"
                  />
                  <select
                    value={versionForm.state}
                    onChange={(e) => setVersionForm({
                      ...versionForm,
                      state: e.target.value
                    })}
                    className="p-2 border rounded"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <textarea
                  placeholder="Version description (optional)"
                  value={versionForm.description}
                  onChange={(e) => setVersionForm({
                    ...versionForm,
                    description: e.target.value
                  })}
                  className="w-full p-2 border rounded h-20"
                />
                <button
                  onClick={createVersion}
                  disabled={loading}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Version'}
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Version History</h3>
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div key={version.version_id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{version.version_name}</p>
                        <p className="text-sm text-gray-500">{version.description}</p>
                        <p className="text-xs text-gray-400">
                          Created by {version.created_by} on {new Date(version.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          version.state === 'published' ? 'bg-green-100 text-green-700' :
                          version.state === 'approved' ? 'bg-blue-100 text-blue-700' :
                          version.state === 'review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {version.state}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <History size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FranciscaCollaborationPanel;























