/**
 * UserProfile Component - Engineering Forge V1.0
 *
 * This is the main component that combines all user management features.
 */

import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import AvatarUpload from './AvatarUpload';
import UserPreferences from './UserPreferences';
import UserProfileForm from './UserProfileForm';
import UserStatistics from './UserStatistics';

interface UserProfileProps {
  className?: string;
}

type ActiveTab = 'profile' | 'preferences' | 'statistics';

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, loading, error } = useUser();
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'statistics', name: 'Statistics', icon: '📊' }
  ] as const;

  const handleSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading profile</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-gray-600">No user data available</p>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">Profile updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <AvatarUpload currentAvatar={user.avatar} onAvatarChange={handleSuccess} size="xl" />

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">@{user.username}</p>

            {/* User Stats */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{user.statistics.level}</p>
                <p className="text-sm text-gray-500">Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{user.statistics.totalXP}</p>
                <p className="text-sm text-gray-500">XP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {user.statistics.projectsCompleted}
                </p>
                <p className="text-sm text-gray-500">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {user.statistics.achievementsUnlocked}
                </p>
                <p className="text-sm text-gray-500">Achievements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === 'profile' && <UserProfileForm onSuccess={handleSuccess} />}

        {activeTab === 'preferences' && <UserPreferences onSuccess={handleSuccess} />}

        {activeTab === 'statistics' && <UserStatistics />}
      </div>
    </div>
  );
};

export default UserProfile;
