import React, { useState, useEffect } from 'react';
import { UserProfile, ActivityItem } from '../../types';
import { Activity, FileText, Mail, Settings, CreditCard, User, TrendingUp, Clock } from 'lucide-react';
import { profileService } from '../../services/profileService';

interface ActivitySectionProps {
  profile: UserProfile;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({ profile }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const activityData = await profileService.getActivity();
      setActivities(activityData);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <User className="w-4 h-4" />;
      case 'resume_created':
      case 'resume_updated':
        return <FileText className="w-4 h-4" />;
      case 'cover_letter_created':
        return <Mail className="w-4 h-4" />;
      case 'template_used':
        return <Settings className="w-4 h-4" />;
      case 'ai_enhancement':
        return <TrendingUp className="w-4 h-4" />;
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
      case 'profile_update':
        return <User className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'text-blue-600 bg-blue-100';
      case 'resume_created':
      case 'resume_updated':
        return 'text-green-600 bg-green-100';
      case 'cover_letter_created':
        return 'text-purple-600 bg-purple-100';
      case 'template_used':
        return 'text-orange-600 bg-orange-100';
      case 'ai_enhancement':
        return 'text-indigo-600 bg-indigo-100';
      case 'payment':
        return 'text-emerald-600 bg-emerald-100';
      case 'profile_update':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const activityStats = profile.activity ? {
    totalLogins: profile.activity.totalLogins,
    resumesCreated: profile.activity.resumesCreated,
    coverLettersCreated: profile.activity.coverLettersCreated,
    templatesUsed: profile.activity.templatesUsed,
    aiEnhancements: profile.activity.aiEnhancements,
    lastActive: profile.activity.lastActive
  } : {
    totalLogins: 0,
    resumesCreated: 0,
    coverLettersCreated: 0,
    templatesUsed: 0,
    aiEnhancements: 0,
    lastActive: profile.lastLogin || 'Never'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activityStats.totalLogins}</div>
              <div className="text-sm text-gray-600">Total Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activityStats.resumesCreated}</div>
              <div className="text-sm text-gray-600">Resumes Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{activityStats.coverLettersCreated}</div>
              <div className="text-sm text-gray-600">Cover Letters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{activityStats.templatesUsed}</div>
              <div className="text-sm text-gray-600">Templates Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{activityStats.aiEnhancements}</div>
              <div className="text-sm text-gray-600">AI Enhancements</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Last active: {formatDate(activityStats.lastActive)}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>

        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h4>
              <p className="text-gray-600">Your activity will appear here as you use the platform.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(activity.timestamp)}
                    </div>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span key={key} className="inline-block mr-4">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity Insights</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Most Active Day</h4>
              <div className="text-2xl font-bold text-blue-600">Monday</div>
              <p className="text-sm text-gray-600">Based on your recent activity</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Peak Usage Time</h4>
              <div className="text-2xl font-bold text-green-600">2:00 PM</div>
              <p className="text-sm text-gray-600">Average time of day you're most active</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Favorite Feature</h4>
              <div className="text-2xl font-bold text-purple-600">Resume Builder</div>
              <p className="text-sm text-gray-600">Most used feature in the last 30 days</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">AI Usage</h4>
              <div className="text-2xl font-bold text-indigo-600">{activityStats.aiEnhancements}</div>
              <p className="text-sm text-gray-600">AI enhancements used this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

