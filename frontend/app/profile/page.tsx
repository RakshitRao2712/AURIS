'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit3, Mail, Phone, LogOut } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export default function Profile() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      
      // Clear localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Redirect to login
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if logout fails, clear local storage and redirect
      localStorage.clear();
      window.location.href = '/login';
    }
  };

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
      setLoading(true);
      
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
            name: userData.name || 'Unknown User',
            email: userData.email || 'unknown@example.com',
            phone: userData.phone || '',
            avatar: userData.avatar || '/api/placeholder/150/150'
          });
        } catch (parseErr) {
          console.error('Error parsing stored user data:', parseErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
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
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={profileData.avatar || '/api/placeholder/150/150'}
                    alt="Profile Avatar"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-2">
                    {profileData.name || 'Unknown User'}
                    {!profileData.name && (
                      <span className="text-sm font-normal text-blue-200 block mt-1">
                        Please edit your profile to add your name
                      </span>
                    )}
                  </h1>
                  <p className="text-xl text-blue-100 mb-1">{profileData.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/profile/edit"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/80 hover:bg-red-600/90 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Mail size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{profileData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Phone size={18} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white">{profileData.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
