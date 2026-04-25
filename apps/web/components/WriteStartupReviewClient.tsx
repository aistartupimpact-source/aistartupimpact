'use client';

import { useState } from 'react';
import { Star, X, CheckCircle, LogIn } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { submitStartupReview } from '../app/actions/startup-reviews';

interface WriteStartupReviewClientProps {
  startupSlug: string;
  startupName: string;
}

export default function WriteStartupReviewClient({ startupSlug, startupName }: WriteStartupReviewClientProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !title.trim() || !body.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await submitStartupReview({
        startupSlug,
        rating,
        title,
        body,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setRating(0);
          setTitle('');
          setBody('');
        }, 2000);
      } else {
        setError(res.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="w-full py-2 text-sm font-jakarta font-semibold text-brand hover:text-brand/80 transition-colors flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign in to write a review
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2 text-sm font-jakarta font-semibold text-brand hover:text-brand/80 transition-colors"
      >
        Write a review →
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {success ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="font-sora font-bold text-xl text-navy dark:text-white mb-2">Review Submitted!</h3>
                <p className="text-gray-500 font-jakarta text-sm mb-6">
                  Thank you for your feedback on {startupName}. Our moderation team will review it shortly.
                </p>
                <button onClick={() => setIsOpen(false)} className="btn-outline w-full">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-sora font-bold text-xl text-navy dark:text-white">
                    Review {startupName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">
                      Your Rating *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">
                      Review Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Sum up your experience in one line"
                      maxLength={200}
                      className="input-field w-full"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">
                      Your Review *
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Share your experience with this startup. What did you like? What could be improved?"
                      rows={6}
                      className="input-field w-full"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">{body.length} characters</p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !rating || !title.trim() || !body.trim()}
                    className="btn-brand w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>

                  <p className="text-xs text-gray-400 font-jakarta text-center">
                    Reviews are moderated and typically published within 24 hours.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
