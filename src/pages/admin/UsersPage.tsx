import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CrownIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';
import type { AdminUser, UserFilters } from '../../types/admin';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadUsers();
  }, [searchTerm, filter, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: UserFilters = {
        search: searchTerm || undefined,
        role: filter === 'all' ? undefined : filter as any,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await adminService.getUsers(filters);
      setUsers(response.users);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.total_pages
      }));
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
      
      // Set fallback data for demo purposes
      setUsers([
        {
          user_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          is_premium: true,
          is_admin: false,
          created_at: '2025-01-15T10:30:00Z',
          last_login: '2025-01-18T14:20:00Z',
          status: 'active',
          phone: '+1234567890',
          country: 'US'
        },
        {
          user_id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          is_premium: false,
          is_admin: false,
          created_at: '2025-01-16T09:15:00Z',
          last_login: '2025-01-17T16:45:00Z',
          status: 'active',
          phone: '+1234567891',
          country: 'CA'
        },
        {
          user_id: 3,
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          is_premium: true,
          is_admin: true,
          created_at: '2025-01-10T08:00:00Z',
          last_login: '2025-01-18T12:30:00Z',
          status: 'active',
          phone: '+1234567892',
          country: 'US'
        }
      ]);
      setPagination(prev => ({ ...prev, total: 3, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.user_id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      setBulkActionLoading(true);
      await adminService.bulkActionUser(selectedUsers, action);
      setSelectedUsers([]);
      setShowBulkActions(false);
      loadUsers();
    } catch (err: any) {
      console.error('Error performing bulk action:', err);
      alert('Failed to perform bulk action. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleTogglePremium = async (userId: number) => {
    try {
      const user = users.find(u => u.user_id === userId);
      if (!user) return;

      if (user.is_premium) {
        await adminService.demoteFromPremium(userId);
      } else {
        await adminService.promoteToPremium(userId);
      }
      loadUsers();
    } catch (err: any) {
      console.error('Error toggling premium status:', err);
      alert('Failed to update premium status. Please try again.');
    }
  };

  const handleToggleAdmin = async (userId: number) => {
    try {
      const user = users.find(u => u.user_id === userId);
      if (!user) return;

      await adminService.updateUser(userId, {
        is_admin: !user.is_admin
      });
      loadUsers();
    } catch (err: any) {
      console.error('Error toggling admin status:', err);
      alert('Failed to update admin status. Please try again.');
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      await adminService.suspendUser(userId);
      loadUsers();
    } catch (err: any) {
      console.error('Error suspending user:', err);
      alert('Failed to suspend user. Please try again.');
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      await adminService.activateUser(userId);
      loadUsers();
    } catch (err: any) {
      console.error('Error activating user:', err);
      alert('Failed to activate user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        loadUsers();
      } catch (err: any) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Active' },
      suspended: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Suspended' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: 'Pending' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'premium') return matchesSearch && user.is_premium;
    if (filter === 'admin') return matchesSearch && user.is_admin;
    if (filter === 'regular') return matchesSearch && !user.is_premium && !user.is_admin;
    
    return matchesSearch;
  });

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts and permissions ({pagination.total} total users)
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
              <option value="regular">Regular</option>
            </select>
            <button className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('promote')}
                disabled={bulkActionLoading}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md disabled:opacity-50"
              >
                Promote to Premium
              </button>
              <button
                onClick={() => handleBulkAction('demote')}
                disabled={bulkActionLoading}
                className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md disabled:opacity-50"
              >
                Demote from Premium
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                disabled={bulkActionLoading}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md disabled:opacity-50"
              >
                Suspend
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={() => handleSelectUser(user.user_id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.first_name[0]}{user.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {user.is_admin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      )}
                      {user.is_premium && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          <CrownIcon className="h-3 w-3 mr-1" />
                          Premium
                        </span>
                      )}
                      {!user.is_admin && !user.is_premium && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300">
                          <UserIcon className="h-3 w-3 mr-1" />
                          Regular
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.last_login ? (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(user.last_login).toLocaleDateString()}
                      </div>
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePremium(user.user_id)}
                        className={`p-2 rounded-md transition-colors ${
                          user.is_premium 
                            ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                            : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        title={user.is_premium ? 'Remove Premium' : 'Make Premium'}
                      >
                        <CrownIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleAdmin(user.user_id)}
                        className={`p-2 rounded-md transition-colors ${
                          user.is_admin 
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                            : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      >
                        <ShieldCheckIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No users match your search criteria.
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;