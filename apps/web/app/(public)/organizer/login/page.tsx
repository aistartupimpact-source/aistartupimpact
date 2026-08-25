"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CalendarDays, Mail, Lock, User, Building2, CheckCircle, ArrowLeft, Shield } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

function OrganizerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Check URL params for errors from OAuth
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "oauth_failed") setError("Google sign-in failed. Please try again.");
    if (urlError === "suspended") setError("Your account has been suspended. Contact support.");
    if (urlError === "no_code") setError("Google sign-in was cancelled.");
    if (urlError === "invalid_token") setError("Invalid or expired verification link.");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (mode === "forgot") {
      // Forgot password
      try {
        const res = await fetch("/api/organizer/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setSuccessMsg(data.message || "If an account exists, we've sent a reset link.");
      } catch {
        setSuccessMsg("If an account exists, we've sent a reset link.");
      }
      setLoading(false);
      return;
    }

    const endpoint = mode === "signup" ? "/api/organizer/auth/signup" : "/api/organizer/auth/login";
    const body = mode === "signup" ? { name, email, password, company } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.requires2FA) {
        setRequires2FA(true);
        setChallengeToken(data.challengeToken);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      if (mode === "signup" && data.message) {
        setSuccessMsg(data.message);
      }

      router.push("/organizer");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to our server-side Google OAuth initiation endpoint
    window.location.href = "/api/organizer/auth/google";
  };

  const handleVerify2FA = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/organizer/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, token: twoFACode, isBackupCode: useBackupCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || "2FA verification failed"); return; }
      router.push("/organizer");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto bg-brand/10 rounded-2xl flex items-center justify-center mb-4">
          <CalendarDays className="w-7 h-7 text-brand" />
        </div>
        <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">
          {mode === "login" && "Welcome back"}
          {mode === "signup" && "Create your organizer account"}
          {mode === "forgot" && "Reset your password"}
        </h1>
        <p className="text-sm text-gray-500 font-jakarta mt-2">
          {mode === "login" && "Sign in to manage your AI events"}
          {mode === "signup" && "Start organizing AI events on our platform"}
          {mode === "forgot" && "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      {/* 2FA Verification */}
      {requires2FA ? (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Two-Factor Authentication</h2>
            <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code from your authenticator app</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
              <span className="text-red-500 text-sm">⚠</span>
              <p className="text-sm text-red-600 dark:text-red-400 font-jakarta">{error}</p>
            </div>
          )}

          <input
            type="text"
            value={twoFACode}
            onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, useBackupCode ? 20 : 6))}
            placeholder={useBackupCode ? "Backup code" : "000000"}
            maxLength={useBackupCode ? 20 : 6}
            className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            autoFocus
          />

          <button
            onClick={handleVerify2FA}
            disabled={loading || (!useBackupCode && twoFACode.length !== 6) || (useBackupCode && !twoFACode)}
            className="w-full py-3 bg-brand hover:bg-brand-600 text-white font-bold font-jakarta text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Verifying..." : "Verify"}
          </button>

          <div className="flex items-center justify-between text-xs">
            <button onClick={() => { setUseBackupCode(!useBackupCode); setTwoFACode(""); }} className="text-brand font-semibold hover:underline">
              {useBackupCode ? "Use authenticator code" : "Use backup code"}
            </button>
            <button onClick={() => { setRequires2FA(false); setTwoFACode(""); setChallengeToken(""); setError(""); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Back to login
            </button>
          </div>
        </div>
      ) : (
      <>
      {/* Google OAuth Button */}
      {mode !== "forgot" && (
        <>
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-semibold font-jakarta text-gray-700 dark:text-gray-200">
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-page dark:bg-page-dark px-3 text-xs text-gray-400 font-jakarta">or continue with email</span>
            </div>
          </div>
        </>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Organization (optional)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand placeholder-gray-400"
              />
            </div>
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand placeholder-gray-400"
          />
        </div>

        {mode !== "forgot" && (
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Password (min 8 characters)" : "Password"}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand placeholder-gray-400"
            />
          </div>
        )}

        {/* Forgot password link */}
        {mode === "login" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-xs text-brand font-semibold font-jakarta hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-sm text-red-600 dark:text-red-400 font-jakarta">{error}</p>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400 font-jakarta">{successMsg}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand hover:bg-brand-600 text-white font-bold font-jakarta text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "login" && "Sign In"}
          {mode === "signup" && "Create Account"}
          {mode === "forgot" && "Send Reset Link"}
        </button>
      </form>

      {/* Mode Switching */}
      <div className="text-center mt-5 space-y-2">
        {mode === "login" && (
          <p className="text-sm text-gray-500 font-jakarta">
            Don&apos;t have an account?{" "}
            <button onClick={() => switchMode("signup")} className="text-brand font-semibold hover:underline">
              Sign up
            </button>
          </p>
        )}
        {mode === "signup" && (
          <p className="text-sm text-gray-500 font-jakarta">
            Already have an account?{" "}
            <button onClick={() => switchMode("login")} className="text-brand font-semibold hover:underline">
              Sign in
            </button>
          </p>
        )}
        {mode === "forgot" && (
          <button
            onClick={() => switchMode("login")}
            className="inline-flex items-center gap-1 text-sm text-brand font-semibold font-jakarta hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </button>
        )}
      </div>

      {/* Terms */}
      {mode === "signup" && (
        <p className="text-center text-xs text-gray-400 font-jakarta mt-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline">terms of service</Link> and{" "}
          <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
      )}
      </>
      )}
    </div>
  );
}


export default function OrganizerAuthPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand mx-auto" /></div>}>
      <OrganizerAuthContent />
    </Suspense>
  );
}
