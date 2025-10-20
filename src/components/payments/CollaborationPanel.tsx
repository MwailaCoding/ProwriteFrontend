import React, { useState } from 'react';
import { Users, Mail, UserPlus, Trash2, Eye, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Collaborator {
  id: string;
  email: string;
  permission: 'view' | 'edit';
  status: 'pending' | 'accepted';
  invitedAt: string;
}

interface CollaborationPanelProps {
  reference: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  reference
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    // Mock data - in real app, this would come from API
    {
      id: '1',
      email: 'john.doe@example.com',
      permission: 'edit',
      status: 'accepted',
      invitedAt: '2025-10-09T10:00:00Z'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      permission: 'view',
      status: 'pending',
      invitedAt: '2025-10-09T11:00:00Z'
    }
  ]);

  const handleInviteCollaborator = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - replace with actual API
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        email: email.trim(),
        permission,
        status: 'pending',
        invitedAt: new Date().toISOString()
      };

      setCollaborators(prev => [...prev, newCollaborator]);
      setEmail('');
      toast.success(`Invitation sent to ${email}`);
      
      // In real app, make API call:
      // await fetch(`/api/documents/${reference}/invite`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email.trim(), permission })
      // });
      
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Invite error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== id));
    toast.success('Collaborator removed');
  };

  const handlePermissionChange = (id: string, newPermission: 'view' | 'edit') => {
    setCollaborators(prev => 
      prev.map(c => 
        c.id === id ? { ...c, permission: newPermission } : c
      )
    );
    toast.success('Permission updated');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPermissionIcon = (permission: string) => {
    return permission === 'edit' ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Invite New Collaborator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-blue-800">Invite Collaborators</h4>
            <p className="text-blue-600 text-sm">Add people to view or edit your document</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission Level
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="view"
                  checked={permission === 'view'}
                  onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                  className="mr-2"
                />
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">View Only</span>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="edit"
                  checked={permission === 'edit'}
                  onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                  className="mr-2"
                />
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Can Edit</span>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleInviteCollaborator}
            disabled={isLoading || !email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 inline mr-2" />
                Send Invitation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Collaborators */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">Current Collaborators</h4>
            <p className="text-gray-600 text-sm">{collaborators.length} people have access</p>
          </div>
        </div>

        {collaborators.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No collaborators yet</p>
            <p className="text-sm text-gray-500">Invite people to collaborate on your document</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{collaborator.email}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collaborator.status)}`}>
                        {collaborator.status}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-600">
                        {getPermissionIcon(collaborator.permission)}
                        <span className="text-xs">{collaborator.permission}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={collaborator.permission}
                    onChange={(e) => handlePermissionChange(collaborator.id, e.target.value as 'view' | 'edit')}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Can Edit</option>
                  </select>
                  <button
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove collaborator"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collaboration Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">How Collaboration Works</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>View Only:</strong> Collaborators can view and download the document</li>
          <li>• <strong>Can Edit:</strong> Collaborators can view, download, and suggest edits</li>
          <li>• <strong>Invitations:</strong> Sent via email with secure access links</li>
          <li>• <strong>Real-time:</strong> Changes are synced automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default CollaborationPanel;




