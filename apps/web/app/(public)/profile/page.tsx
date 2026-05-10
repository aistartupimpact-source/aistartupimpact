'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Edit2, Save, X, LogOut, UserCircle } from 'lucide-react';
import SavedItems from '@/components/profile/SavedItems';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  twitter: string | null;
  linkedin: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/session');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setFormData({
            name: data.user.name || '',
          });
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/user/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                <UserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-sora">
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-jakarta">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium"
                  >
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile.name || '',
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-xs sm:text-sm">
              {success}
            </div>
          )}

          {/* Profile Details */}
          {editing && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Saved Items Section */}
        <SavedItems />
      </div>
    </div>
  );
}
