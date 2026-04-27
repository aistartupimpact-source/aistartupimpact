'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, ChevronRight, CheckCircle2, Loader2, ChevronDown, Upload, X } from 'lucide-react';

const JOB_ROLES = [
  'Frontend Developer',
  'Full Stack Developer',
  'Backend Developer',
  'Next.js Developer',
  'Generative AI Engineer',
  'Content Writer',
  'Graphic Designer',
  'UI/UX Designer',
];

export default function CareersPage() {
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    email: '',
    resumeLink: '',
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  // Load resume data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('career_application');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const savedTime = parsed.timestamp;
        const now = Date.now();
        
        // Delete if older than 6 hours (6 * 60 * 60 * 1000 = 21600000)
        if (now - savedTime > 21600000) {
          localStorage.removeItem('career_application');
        } else {
          setFormData(prev => ({
            ...prev,
            fullName: parsed.fullName || '',
            resumeLink: parsed.resumeLink || '',
          }));
        }
      } catch (e) {
        localStorage.removeItem('career_application');
      }
    }
  }, []);

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    // Check for common disposable/temporary email domains
    const disposableDomains = ['tempmail', 'throwaway', '10minutemail', 'guerrillamail', 'mailinator'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.some(d => domain?.includes(d))) {
      setEmailError('Please use a valid working email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    if (email) {
      validateEmail(email);
    } else {
      setEmailError('');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setFileError('Only PDF files are allowed');
      return;
    }

    // Validate file size (300KB = 300 * 1024 bytes)
    const maxSize = 300 * 1024;
    if (file.size > maxSize) {
      setFileError(`File size must be less than 300KB (current: ${Math.round(file.size / 1024)}KB)`);
      return;
    }

    setFileError('');
    setUploadedFile(file);

    try {
      // Upload file to server
      const uploadFormData = new FormData();
      uploadFormData.append('resume', file);

      const response = await fetch('/api/careers/upload-resume', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        // Store the server URL in localStorage
        const uploadData = {
          fileName: file.name,
          fileUrl: data.url,
          timestamp: Date.now(),
        };
        
        localStorage.setItem('career_resume_upload', JSON.stringify(uploadData));
        
        // Set the resume link in form data when file is uploaded
        setFormData(prev => ({ ...prev, resumeLink: data.url }));

        // Set auto-delete from localStorage after 3 minutes
        setTimeout(() => {
          localStorage.removeItem('career_resume_upload');
          setUploadedFile(null);
        }, 180000);
      } else {
        setFileError(data.error || 'Failed to upload file');
        setUploadedFile(null);
      }
    } catch (err) {
      setFileError('Failed to upload file. Please try again.');
      setUploadedFile(null);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError('');
    localStorage.removeItem('career_resume_upload');
  };

  // Load uploaded file from localStorage on mount
  useEffect(() => {
    const savedUpload = localStorage.getItem('career_resume_upload');
    if (savedUpload) {
      try {
        const parsed = JSON.parse(savedUpload);
        const savedTime = parsed.timestamp;
        const now = Date.now();
        
        // Delete if older than 3 minutes (180000 ms)
        if (now - savedTime > 180000) {
          localStorage.removeItem('career_resume_upload');
        } else {
          // Create a mock file object for display
          const file = new File([''], parsed.fileName, { type: 'application/pdf' });
          setUploadedFile(file);
          setFormData(prev => ({ ...prev, resumeLink: parsed.fileUrl }));
          
          // Set remaining auto-delete timer
          const remainingTime = 180000 - (now - savedTime);
          setTimeout(() => {
            localStorage.removeItem('career_resume_upload');
            setUploadedFile(null);
          }, remainingTime);
        }
      } catch (e) {
        localStorage.removeItem('career_resume_upload');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if either resume link or uploaded file is provided
    if (!formData.role || !formData.fullName || !formData.email || !formData.resumeLink) {
      setError('Please fill in all required fields including resume');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid working email address');
      return;
    }

    if (!formData.consent) {
      setError('Please agree to receive newsletters to submit your application');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Save to localStorage (will auto-delete after 6 hours)
      localStorage.setItem('career_application', JSON.stringify({
        fullName: formData.fullName,
        resumeLink: formData.resumeLink,
        timestamp: Date.now(),
      }));

      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          role: '',
          fullName: '',
          email: '',
          resumeLink: '',
          consent: false,
        });
        setUploadedFile(null);
        localStorage.removeItem('career_resume_upload');
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400">
            <Link href="/" className="hover:text-brand">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 dark:text-gray-300">Careers</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand/10 px-4 py-2 rounded-full mb-4">
            <Briefcase className="w-4 h-4 text-brand" />
            <span className="text-brand text-xs font-bold uppercase tracking-wider font-jakarta">
              Join Our Team
            </span>
          </div>
          <h1 className="font-sora font-extrabold text-3xl sm:text-4xl lg:text-5xl text-navy dark:text-white mb-4">
            Internship Opportunities
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-jakarta text-lg max-w-2xl mx-auto mb-8">
            Join India's fastest-growing AI startup platform. Work remotely and gain hands-on experience in the AI ecosystem.
          </p>

          {/* Apply Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-brand text-lg px-8 py-4 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Apply for Internship
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Application Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-2xl">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="font-sora font-bold text-xl text-navy dark:text-white mb-2">Application Submitted!</h3>
                <p className="text-gray-500 font-jakarta text-sm mb-2">
                  Thank you for applying! You've been added to our newsletter.
                </p>
                <p className="text-xs text-gray-400 font-jakarta">
                  We'll review your application and get back to you soon.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-sora font-bold text-2xl text-navy dark:text-white">
                    Internship Application
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Role */}
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-field w-full"
                      required
                    >
                      <option value="">Select a role...</option>
                      {JOB_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your full name"
                      className="input-field w-full"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">
                      Email * <span className="text-xs text-gray-400 font-normal">(Valid working email)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="your@email.com"
                      className={`input-field w-full ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {emailError && (
                      <p className="text-xs text-red-500 mt-1">{emailError}</p>
                    )}
                  </div>

                  {/* Resume Upload or Link */}
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">
                      Resume * <span className="text-xs text-gray-400 font-normal">(Upload or provide link)</span>
                    </label>
                    
                    {/* File Upload Section */}
                    {!uploadedFile && !formData.resumeLink && (
                      <div className="mb-3">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-brand hover:bg-brand/5 transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 font-jakarta mt-1">
                              PDF only, max 300KB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        {fileError && (
                          <p className="text-xs text-red-500 mt-2">{fileError}</p>
                        )}
                      </div>
                    )}

                    {/* Uploaded File Display */}
                    {uploadedFile && (
                      <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500">
                              Uploaded successfully
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Divider */}
                    {!uploadedFile && !formData.resumeLink && (
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">OR</span>
                        </div>
                      </div>
                    )}

                    {/* Resume Link Input */}
                    {!uploadedFile && (
                      <div>
                        <input
                          type="url"
                          value={formData.resumeLink}
                          onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                          placeholder="https://drive.google.com/... or PDF URL"
                          className="input-field w-full"
                          disabled={!!uploadedFile}
                        />
                        <p className="text-xs text-gray-400 font-jakarta mt-1">
                          Share a Google Drive link or direct PDF URL
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Consent Checkbox - CRITICAL for DPDP Act 2023 */}
                  <div className="py-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="w-5 h-5 text-brand border-gray-300 rounded focus:ring-brand mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta leading-relaxed">
                        I agree to receive newsletters, startup insights, and promotional updates from AI Startup Impact via email. I understand I can unsubscribe at any time.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button - Only enabled when consent is checked */}
                  <button
                    type="submit"
                    disabled={submitting || !formData.consent}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm font-jakarta transition-all ${
                      formData.consent
                        ? 'bg-brand text-white hover:bg-brand/90 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {formData.consent ? 'Submit Application' : 'Please agree to terms above'}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 font-jakarta text-center">
                    Your details will be preserved in our system for 6 months.
                  </p>
                </form>
              </>
            )}
          </div>
        )}

        {/* Info Section */}
        {!showForm && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-1">
                Remote Work
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-jakarta">
                Work from anywhere in India
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-1">
                Flexible Hours
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-jakarta">
                Balance work with your studies
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mx-auto mb-3">
                <ChevronRight className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-1">
                Real Experience
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-jakarta">
                Work on live AI platform
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
