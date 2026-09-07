'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Check, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react';
import { useUser } from './UserProvider';
import SignInModal from '@/components/auth/SignInModal';

const COMMENT_MAX_LENGTH = 500;

interface Comment {
  id: string;
  name: string;
  avatar: string | null;
  body: string;
  createdAt: string;
}

interface Props {
  slug: string;
  initialLikes: number;
  title: string;
}

export default function ArticleActions({ slug, initialLikes, title }: Props) {
  const { user } = useUser();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);

  // Persist liked state in localStorage
  useEffect(() => {
    const key = `liked-${slug}`;
    if (localStorage.getItem(key)) setLiked(true);
  }, [slug]);

  const handleLike = async () => {
    if (liked) return;
    const key = `liked-${slug}`;
    localStorage.setItem(key, '1');
    setLiked(true);
    setLikes(l => l + 1);
    await fetch(`/api/articles/${slug}/like`, { method: 'POST' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadComments = async () => {
    if (comments.length > 0) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/articles/${slug}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentClick = () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    const next = !showComments;
    setShowComments(next);
    if (next) loadComments();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) { setShowSignIn(true); return; }
    if (!body.trim()) { setError('Please write a comment.'); return; }
    if (body.length > COMMENT_MAX_LENGTH) { setError(`Comment must be ${COMMENT_MAX_LENGTH} characters or less.`); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setBody('');
      } else {
        setError(data.error || 'Failed to submit');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
      {/* Action bar */}
      <div className="flex items-center gap-3">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-jakarta font-semibold text-sm transition-all ${
            liked
              ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
          <span>{likes}</span>
        </button>

        {/* Comment toggle */}
        <button
          onClick={handleCommentClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-jakarta font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-jakarta font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-6 space-y-6">
          {/* Existing comments */}
          {loadingComments ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm font-jakarta">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading comments...
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold font-sora text-sm shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-sora font-bold text-sm text-navy dark:text-white">{c.name}</span>
                      <span className="text-xs text-gray-400 font-jakarta">
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-jakarta">No comments yet. Be the first!</p>
          )}

          {/* Comment form */}
          {submitted ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-jakarta bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl">
              <Check className="w-4 h-4" /> Comment submitted for review. It'll appear once approved.
            </div>
          ) : user ? (
            <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex gap-3">
                <div className="shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold font-sora text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-sora font-semibold text-sm text-navy dark:text-white">{user.name}</p>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <textarea
                    placeholder="Share your thoughts..." value={body} rows={3} maxLength={COMMENT_MAX_LENGTH}
                    onChange={e => { if (e.target.value.length <= COMMENT_MAX_LENGTH) setBody(e.target.value); }}
                    className="input-field text-sm w-full resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-jakarta ${body.length >= COMMENT_MAX_LENGTH ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                      {body.length}/{COMMENT_MAX_LENGTH}
                    </span>
                    <button type="submit" disabled={submitting || body.length > COMMENT_MAX_LENGTH}
                      className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? 'Submitting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : null}
        </div>
      )}

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} defaultMode="signin" />
    </div>
  );
}
