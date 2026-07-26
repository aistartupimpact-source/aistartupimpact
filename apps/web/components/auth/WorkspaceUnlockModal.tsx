'use client';

import { useState } from 'react';
import { X, Loader2, Calendar, Rocket, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkspaceUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: 'organizer' | 'founder';
  /** If user is not signed in, show sign-in prompt instead */
  isAuthenticated: boolean;
  onSignInRequired?: () => void;
}

const WORKSPACE_INFO = {
  organizer: {
    title: 'Create your Organizer Workspace',
    icon: Calendar,
    color: 'brand',
    features: [
      'Host events on AI Startup Impact',
      'Manage attendees & registrations',
      'QR code check-in',
      'Event analytics & promotion tools',
    ],
  },
  founder: {
    title: 'Create your Founder Workspace',
    icon: Rocket,
    color: 'purple-600',
    features: [
      'Manage your startup profile',
      'Add and manage AI tools',
      'Team management',
      'Startup analytics',
    ],
  },
};

export default function WorkspaceUnlockModal({
  isOpen,
  onClose,
  workspace,
  isAuthenticated,
  onSignInRequired,
}: WorkspaceUnlockModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'verification_required' | 'confirmation_pending' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const info = WORKSPACE_INFO[workspace];
  const Icon = info.icon;

  const handleUnlock = async () => {
    if (!isAuthenticated) {
      onSignInRequired?.();
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const res = await fetch('/api/workspace/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
        return;
      }

      switch (data.status) {
        case 'unlocked':
        case 'linked':
        case 'already_unlocked':
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => {
            onClose();
            if (data.redirectTo) router.push(data.redirectTo);
            router.refresh();
          }, 1200);
          break;
        case 'verification_required':
          setStatus('verification_required');
          setMessage(data.message);
          break;
        case 'confirmation_pending':
          setStatus('confirmation_pending');
          setMessage(data.message);
          break;
        default:
          setStatus('error');
          setMessage(data.message || 'Unexpected response');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className={`w-11 h-11 rounded-xl bg-${info.color}/10 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${info.color}`} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white font-sora">{message}</p>
              <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
            </div>
          ) : status === 'verification_required' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-7 h-7 text-yellow-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white font-sora">Email Verification Required</p>
              <p className="text-sm text-gray-500 mt-2">{message}</p>
              <p className="text-xs text-gray-400 mt-3">Check your inbox for a verification link, then try again.</p>
            </div>
          ) : status === 'confirmation_pending' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white font-sora">Confirmation Required</p>
              <p className="text-sm text-gray-500 mt-2">{message}</p>
              <p className="text-xs text-gray-400 mt-3">We found an existing account with your email. A confirmation link has been sent for security.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-sora mb-1">
                {info.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                This is not a new signup. We're simply enabling another workspace for your account.
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {info.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 font-jakarta">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Error */}
              {status === 'error' && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
                </div>
              )}

              {/* CTA */}
              {!isAuthenticated ? (
                <button
                  onClick={onSignInRequired}
                  className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold font-jakarta text-sm rounded-xl transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                  Sign In to Continue
                </button>
              ) : (
                <button
                  onClick={handleUnlock}
                  disabled={loading}
                  className={`w-full py-3 bg-brand hover:bg-brand/90 text-white font-bold font-jakarta text-sm rounded-xl transition-colors shadow-lg shadow-brand/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                  ) : (
                    'Continue'
                  )}
                </button>
              )}

              <p className="text-[11px] text-gray-400 text-center mt-3">
                Free forever. No credit card required.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
