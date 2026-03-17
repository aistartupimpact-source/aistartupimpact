"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full relative">
        {/* Decorative elements */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white mb-2">
              Welcome to ASI Admin
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm">
              Sign in with your authorized Google account to access the dashboard.
            </p>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur" />
            <div className="relative flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.72 17.56V20.31H19.29C21.37 18.39 22.56 15.58 22.56 12.25Z" fill="#4285F4" />
                <path d="M12 23C14.97 23 17.46 22.01 19.3 20.31L15.73 17.56C14.73 18.23 13.48 18.63 12 18.63C9.13002 18.63 6.70002 16.69 5.84002 14.11H2.17004V16.96C3.98004 20.55 7.68002 23 12 23Z" fill="#34A853" />
                <path d="M5.83 14.11C5.61 13.45 5.48 12.74 5.48 12C5.48 11.26 5.61 10.55 5.83 9.89V7.04H2.16C1.43 8.5 1 10.19 1 12C1 13.81 1.43 15.5 2.16 16.96L5.83 14.11Z" fill="#FBBC05" />
                <path d="M12 5.38C13.62 5.38 15.07 5.94 16.22 7.03L19.38 3.87C17.45 2.07 14.97 1 12 1C7.68 1 3.98 3.45 2.17 7.04L5.84 9.89C6.71 7.31 9.13 5.38 12 5.38Z" fill="#EA4335" />
              </svg>
              <span className="font-jakarta font-semibold text-gray-700 dark:text-gray-200">
                Continue with Google
              </span>
            </div>
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
            <Sparkles className="w-3 h-3" />
            <span>Secure Access Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
