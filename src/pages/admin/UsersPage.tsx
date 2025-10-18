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
  XCircleIcon
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate loading users
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          isPremium: true,
          isAdmin: false,
          createdAt: '2025-01-15',
          lastLogin: '2025-01-18'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          isPremium: false,
          isAdmin: false,
          createdAt: '2025-01-16',
          lastLogin: '2025-01-17'
        },
        {
          id: 3,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          isPremium: true,
          isAdmin: true,
          createdAt: '2025-01-10',
          lastLogin: '2025-01-18'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'premium') return matchesSearch && user.isPremium;
    if (filter === 'admin') return matchesSearch && user.isAdmin;
    if (filter === 'regular') return matchesSearch && !user.isPremium && !user.isAdmin;
    
    return matchesSearch;
  });

  const handleTogglePremium = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isPremium: !user.isPremium } : user
    ));
  };

  const handleToggleAdmin = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
    ));
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and permissions
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
              <option value="regular">Regular</option>
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.isAdmin && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Admin
                        </span>
                      )}
                      {user.isPremium && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {user.createdAt} • Last login: {user.lastLogin}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePremium(user.id)}
                    className={`p-2 rounded-md ${
                      user.isPremium 
                        ? 'text-yellow-600 hover:bg-yellow-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={user.isPremium ? 'Remove Premium' : 'Make Premium'}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleToggleAdmin(user.id)}
                    className={`p-2 rounded-md ${
                      user.isAdmin 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-md">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-md">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default UsersPage;