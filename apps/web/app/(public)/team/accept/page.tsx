"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Lock, CheckCircle } from "lucide-react";

function AcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) return <div className="max-w-md mx-auto py-20 text-center"><p className="text-gray-500 font-jakarta">Invalid invite link.</p></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError("Min 8 characters"); return; }
    setLoading(true);
    const res = await fetch("/api/organizer/team/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const d = await res.json();
    if (d.success) setDone(true);
    else setError(d.error || "Failed");
    setLoading(false);
  };

  if (done) return (
    <div className="max-w-md mx-auto py-20 text-center space-y-4">
      <CheckCircle className="w-12 h-12 text-green-600 mx-auto"/>
      <h1 className="font-sora font-bold text-xl text-navy dark:text-white">Welcome to the team!</h1>
      <p className="text-sm text-gray-500 font-jakarta">Your account is ready. You can now log in.</p>
      <a href="/organizer/login" className="inline-block px-5 py-2.5 bg-brand text-white font-bold text-sm rounded-lg font-jakarta">Go to Login</a>
    </div>
  );

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto bg-brand/10 rounded-xl flex items-center justify-center mb-4"><Lock className="w-6 h-6 text-brand"/></div>
        <h1 className="font-sora font-bold text-xl text-navy dark:text-white">Accept Invitation</h1>
        <p className="text-sm text-gray-500 font-jakarta mt-1">Set your password to join the team</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 8)" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30"/>
        <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30"/>
        {error && <p className="text-sm text-red-500 font-jakarta">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-3 bg-brand hover:bg-brand-600 text-white font-bold text-sm rounded-xl font-jakarta disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin"/>} Set Password & Join
        </button>
      </form>
    </div>
  );
}

export default function AcceptPage() {
  return <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand"/></div>}><AcceptContent /></Suspense>;
}
