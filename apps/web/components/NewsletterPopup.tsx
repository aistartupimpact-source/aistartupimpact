'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Sparkles, CheckCircle2, TrendingUp, Users, Zap } from 'lucide-react';

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user has already seen the popup or subscribed
    const hasSeenPopup = localStorage.getItem('asi_newsletter_popup_seen');
    const hasSubscribed = localStorage.getItem('asi_newsletter_subscribed');

    if (hasSeenPopup || hasSubscribed) {
      return;
    }

    let hasShown = false;

    // Trigger 1: After 30 seconds
    const timeoutTimer = setTimeout(() => {
      if (!hasShown) {
        hasShown = true;
        setIsVisible(true);
      }
    }, 30000); // 30 seconds

    // Trigger 2: On 50% scroll
    const handleScroll = () => {
      if (hasShown) return;
      
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 50) {
        hasShown = true;
        setIsVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Trigger 3: Exit intent (mouse leaves viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasShown) return;
      
      if (e.clientY <= 0) {
        hasShown = true;
        setIsVisible(true);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutTimer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Remember that user has seen the popup (don't show again for 7 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('asi_newsletter_popup_seen', expiryDate.toISOString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup' }),
      });

      const data = await res.json();

      if (data.success || res.ok) {
        setIsSuccess(true);
        localStorage.setItem('asi_newsletter_subscribed', 'true');
        
        // Close popup after 3 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else {
        setError(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay - Lighter with better blur */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-[9999] animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup Card */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 duration-300 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Prominent */}
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8">
            {!isSuccess ? (
              <>
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  Don't miss the AI signal
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                  India's most curated AI newsletter — funding rounds, founder stories, and tool releases. <strong>Every Friday.</strong>
                </p>

                {/* Benefits - Varied structure */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Read by teams at <strong>Google India, Flipkart & Zerodha</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Signal only, zero noise</strong> — curated insights you can't find elsewhere
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Free forever. Unsubscribe anytime with one click.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Get the Weekly Digest
                      </>
                    )}
                  </button>
                </form>

                {/* Legal text with privacy policy link */}
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-4 leading-relaxed">
                  By subscribing, you agree to receive our weekly newsletter. We respect your privacy — read our{' '}
                  <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                    Privacy Policy
                  </a>
                  . Unsubscribe anytime.
                </p>
              </>
            ) : (
              /* Success State - Professional Design */
              <div className="text-center py-6">
                {/* Success Icon with Animation */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Success Message */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Successfully Subscribed
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-sm mx-auto">
                  Thank you for subscribing! Check your inbox for a confirmation email. Your first AI digest will arrive this Friday.
                </p>

                {/* What's Next Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    What happens next?
                  </h4>
                  <div className="space-y-2 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">1</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Confirm your email address
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">2</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Receive your first digest on Friday
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">3</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Stay updated on India's AI ecosystem
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
                >
                  Continue Reading
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
