'use client';

import { useState } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';
import { useUser } from './UserProvider';
import { submitToolReview } from '../app/actions/reviews';

interface WriteReviewClientProps {
  toolSlug: string;
  toolName: string;
}

export default function WriteReviewClient({ toolSlug, toolName }: WriteReviewClientProps) {
  const { user, signIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleOpenClick = () => {
    if (!user) {
      signIn(`/tools/${toolSlug}`);
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await submitToolReview({
        toolSlug,
        rating,
        title,
        body,
        proofImageUrl: undefined,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenClick}
        className="btn-brand text-sm shadow-md"
      >
        {user ? 'Write a Review' : 'Sign In to Review'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-sora font-bold text-xl text-navy dark:text-white mb-2">Review Submitted!</h3>
                <p className="text-gray-500 font-jakarta text-sm mb-6">
                  Thank you for your feedback on {toolName}. Our moderation team will review it shortly.
                </p>
                <button onClick={() => setIsOpen(false)} className="btn-outline w-full">Close</button>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-1">Review {toolName}</h2>
                <p className="text-sm font-jakarta text-gray-500 mb-6">Share your authentic experience with the community.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Overall Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <Star
                            className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Review Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Summarize your experience"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={50}
                      className="input-field w-full text-sm py-2.5"
                    />
                    <p className={`text-xs mt-1 ${title.length >= 50 ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                      {title.length >= 50 ? 'Limit reached' : `${title.length}/50 characters`}
                    </p>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Review Details</label>
                    <textarea
                      required
                      placeholder="What did you like or dislike? How does it compare to alternatives?"
                      rows={5}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      maxLength={200}
                      className="input-field w-full text-sm py-2.5 resize-none"
                    />
                    <p className={`text-xs mt-1 ${body.length >= 200 ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                      {body.length >= 200 ? 'Limit reached' : `${body.length}/200 characters (minimum 50)`}
                    </p>
                  </div>

                  {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting || (!title.trim() && !body.trim())}
                    className={`w-full py-3 rounded-full font-bold text-white transition-all shadow-md ${
                      isSubmitting || (!title.trim() && !body.trim())
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                        : 'bg-brand hover:bg-brand-600'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>

                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Posting as <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.name}</span>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
