'use client';

import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';


type AllowedSource = 'footer' | 'sidebar' | 'newsletter' | 'website';

interface SubscribeFormProps {
  buttonText?: string;
  source?: AllowedSource;
  className?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES: AllowedSource[] = ['footer', 'sidebar', 'newsletter', 'website'];

// Fix: NEXT_PUBLIC_API_URL already includes /v1 — don't append it again
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1').replace(/\/+$/, '');

export default function SubscribeForm({ buttonText = 'Subscribe', source = 'website', className = '' }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Sanitize source — only allow known values
  const safeSource: AllowedSource = ALLOWED_SOURCES.includes(source) ? source : 'website';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side email validation
    if (!email || !EMAIL_REGEX.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: safeSource }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        // Never reflect raw server error — use generic message
        setMessage('Failed to subscribe. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-xl ${className}`}>
        <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
        <p className="text-sm font-jakarta text-green-700 dark:text-green-400 text-center font-medium">
          {message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-navy dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-brand font-jakarta text-sm min-h-[44px] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="btn-brand whitespace-nowrap text-sm flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonText}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-[11px] text-red-500 mt-2 font-jakarta text-center sm:text-left">{message}</p>
      )}
    </form>
  );
}
