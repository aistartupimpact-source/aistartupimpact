'use client';

import { Shield, Mail, Calendar, UserCircle } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AdminUsersClientProps {
  users: AdminUser[];
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  EDITOR_IN_CHIEF: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SENIOR_WRITER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  WRITER: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  AD_MANAGER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CONTRIBUTOR: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  FOUNDER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  EDITOR_IN_CHIEF: 'Editor in Chief',
  SENIOR_WRITER: 'Senior Writer',
  WRITER: 'Writer',
  AD_MANAGER: 'Ad Manager',
  CONTRIBUTOR: 'Contributor',
  FOUNDER: 'Founder',
};

export default function AdminUsersClient({ users }: AdminUsersClientProps) {
  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-sora">
            Admin Users
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-jakarta">
            Manage admin users and their roles
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Shield className="w-5 h-5 text-brand" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {users.length} Admin{users.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Admin Users List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-jakarta">
              No admin users found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <UserCircle className="w-7 h-7 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white font-sora truncate">
                          {user.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-jakarta truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          roleColors[user.role] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {roleLabels[user.role] || user.role}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400 font-jakarta">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Joined {formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Last login: {formatDate(user.lastLoginAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
