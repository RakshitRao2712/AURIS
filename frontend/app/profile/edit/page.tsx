'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Save, X, User, Mail, Phone } from 'lucide-react';
import { API_BASE_URL } from '../../lib/config';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export default function EditProfile() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Get user ID from localStorage (set during login)
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('No user logged in');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`);
      
      if (!response.ok) {
        // If unauthorized, clear localStorage and redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProfileData(data);
      
      // Update localStorage with fresh data from server
      localStorage.setItem('userData', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data');
      
      // Try to get data from localStorage as fallback
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setProfileData({
            id: userData.id || 1,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            avatar: userData.avatar || '/api/placeholder/150/150'
          });
        } catch (parseErr) {
          console.error('Error parsing stored user data:', parseErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (!profileData) return;
    setProfileData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!profileData) return;
    
    try {
      setIsSaving(true);
      const userId = profileData.id;
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();
      console.log('Profile updated successfully', updatedData);
      setProfileData(updatedData);
      setIsDirty(false);
      
      // Update localStorage with new data
      const userData = {
        id: updatedData.id,
        name: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone,
        avatar: updatedData.avatar
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Clear any cached data and redirect
      localStorage.removeItem('cachedProfileData');
      
      // Show success message or redirect
      router.push('/profile');
    } catch (err) {
      console.error('Error updating profile data:', err);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form or redirect back
    setIsDirty(false);
  };

const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && profileData) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const userId = profileData.id;
        
        const response = await fetch(`${API_BASE_URL}/api/user/${userId}/avatar`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Avatar updated successfully', data);
        setProfileData(prev => prev ? ({
          ...prev,
          avatar: data.avatar
        }) : null);
        
        // Update localStorage with new avatar
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          userData.avatar = data.avatar;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        // Avatar is saved immediately, so we don't need to set isDirty
      } catch (err) {
        console.error('Error updating avatar:', err);
        setError('Failed to update avatar');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <p className="text-red-600 dark:text-red-400">Error loading profile data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Profile
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Update your personal information and settings</p>
              {error && (
                <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={16} className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} className="inline mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={profileData.avatar || '/api/placeholder/150/150'}
                    alt="Profile Avatar"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Camera size={20} className="text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profileData.name || 'Unknown User'}</h2>
                <p className="text-blue-100 mt-1">{profileData.email}</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h3>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
