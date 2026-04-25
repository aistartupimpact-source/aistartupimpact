'use client';

import { useState } from 'react';
import { Star, X, UploadCloud, ShieldCheck, CheckCircle, LogIn } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { submitToolReview } from '../app/actions/reviews';
import { uploadToStorage } from '@/lib/upload';

interface WriteReviewClientProps {
  toolSlug: string;
  toolName: string;
}

export default function WriteReviewClient({ toolSlug, toolName }: WriteReviewClientProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleOpenClick = () => {
    if (!session) {
      signIn('google');
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
      let finalImageUrl = undefined;
      
      if (receipt) {
        finalImageUrl = await uploadToStorage(receipt);
      }

      const res = await submitToolReview({
        toolSlug,
        rating,
        title,
        body,
        proofImageUrl: finalImageUrl,
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
        {session ? 'Write a Review' : 'Sign In to Review'}
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
                      className="input-field w-full text-sm py-2.5"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Review Details</label>
                    <textarea
                      required
                      placeholder="What did you like or dislike? How does it compare to alternatives?"
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="input-field w-full text-sm py-2.5 resize-none"
                    />
                  </div>

                  {/* Verification Upload */}
                  <div className="border border-dashed border-brand/30 bg-brand/5 dark:bg-brand/10 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-brand">Get Verified (Optional)</h4>
                        <p className="text-xs text-brand/80 mt-1 mb-3">Upload a receipt or screenshot of your active dashboard to earn the prestigious "Verified User" badge.</p>
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-brand/20 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors">
                          <UploadCloud className="w-4 h-4" />
                          {receipt ? (receipt.name.length > 20 ? receipt.name.slice(0, 20) + '...' : receipt.name) : 'Upload Proof'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-full font-bold text-white transition-all shadow-md ${isSubmitting ? 'bg-brand/50' : 'bg-brand hover:bg-brand-600'}`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>

                  <p className="text-center text-[10px] text-gray-400 mt-2">
                    Logged in as {session?.user?.name}. Fake reviews will be removed.
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
