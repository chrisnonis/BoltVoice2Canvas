import React, { useState, useRef } from 'react';
import { useSupabase } from '../lib/supabase-provider';
import { User, Settings, LogOut, Grid, Clock, Heart, Award, Upload, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock user data - in a real app, this would come from your database
const mockUser = {
  id: 'user-123',
  name: 'Jamie Smith',
  email: 'jamie.smith@example.com',
  avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
  createdAt: '2025-01-15T10:30:00Z',
  bio: 'Digital artist and nature lover. Creating landscapes and abstract art through the power of voice.',
  artworksCount: 24,
  likedCount: 56,
  awardsCount: 3,
};

// Mock statistics
const mockStats = [
  { label: 'Artworks', value: 24, icon: <Grid className="h-5 w-5" /> },
  { label: 'Likes Received', value: 128, icon: <Heart className="h-5 w-5" /> },
  { label: 'Days Active', value: 37, icon: <Clock className="h-5 w-5" /> },
  { label: 'Awards', value: 3, icon: <Award className="h-5 w-5" /> },
];

type TabType = 'profile' | 'account' | 'preferences';

const ProfilePage = () => {
  const { signOut } = useSupabase();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(mockUser);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    await signOut();
    // Redirect would happen automatically through auth state change
  };

  const handleUpdateProfile = () => {
    setIsEditing(false);
    // In a real app, you would save the profile data to the backend here
    console.log('Profile updated:', userData);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      
      // Update the avatar immediately for better UX
      setUserData(prev => ({ ...prev, avatar: previewUrl }));

      // In a real app, you would upload to your storage service here
      // For now, we'll simulate an upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful upload with a placeholder service
      // In production, you'd upload to Supabase Storage or similar
      const uploadedUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg`;
      
      setUserData(prev => ({ ...prev, avatar: uploadedUrl }));
      
      console.log('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
      // Revert to original avatar on error
      setUserData(prev => ({ ...prev, avatar: mockUser.avatar }));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
    { id: 'account', label: 'Account', icon: <Settings className="h-5 w-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="h-5 w-5" /> },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Your Profile</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Manage your account and view your creations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white shadow-md dark:bg-gray-800">
            {/* User Info */}
            <div className="flex flex-col items-center p-6">
              <div className="relative mb-4">
                <div 
                  className={cn(
                    "h-24 w-24 overflow-hidden rounded-full",
                    isEditing && "cursor-pointer hover:opacity-75 transition-opacity"
                  )}
                  onClick={handleAvatarClick}
                >
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="h-full w-full object-cover"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Change profile picture"
                  >
                    {isUploadingAvatar ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
                {userData.name}
              </h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {userData.email}
              </p>
              <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
                {userData.bio}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member since {formatDate(userData.createdAt)}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 border-t border-gray-200 p-6 dark:border-gray-700">
              {mockStats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center justify-center p-2 text-center">
                  <div className="mb-1 text-gray-500 dark:text-gray-400">
                    {stat.icon}
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      "flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                    onClick={() => setActiveTab(tab.id as TabType)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
                <button
                  className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-sm font-medium text-error-600 transition-colors hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="name"
                          value={userData.name}
                          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{userData.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          id="email"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{userData.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        rows={3}
                        value={userData.bio}
                        onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Tell us about yourself and your artistic interests..."
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">{userData.bio}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Profile Picture
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={userData.avatar}
                            alt={userData.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          {isUploadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button 
                            onClick={handleAvatarClick}
                            disabled={isUploadingAvatar}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {isUploadingAvatar ? 'Uploading...' : 'Change Picture'}
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                  Account Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="current-password"
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="new-password"
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirm-password"
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Account Deletion</h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="rounded-md bg-error-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-error-700 dark:bg-error-500 dark:hover:bg-error-600">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                  App Preferences
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900 dark:text-white">Email Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your artworks and community</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" className="peer sr-only" defaultChecked />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary-800"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900 dark:text-white">Community Updates</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about community events and challenges</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" className="peer sr-only" defaultChecked />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary-800"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Display Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900 dark:text-white">Dark Mode</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" className="peer sr-only" />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary-800"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900 dark:text-white">High Contrast</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Enhance visibility with higher contrast</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" className="peer sr-only" />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary-800"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;