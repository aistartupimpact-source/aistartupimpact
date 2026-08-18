"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { signOut } from "next-auth/react";

const INACTIVITY_LIMIT = 15 * 60 * 1000;
const WARNING_BEFORE = 2 * 60 * 1000;
const CHECK_INTERVAL = 30 * 1000;

export function InactivityGuard({ children }: { children: React.ReactNode }) {
  const lastActivity = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now();
    if (showWarning) setShowWarning(false);
  }, [showWarning]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];
    const handler = () => { lastActivity.current = Date.now(); };

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const idle = Date.now() - lastActivity.current;

      if (idle >= INACTIVITY_LIMIT) {
        clearInterval(interval);
        signOut({ callbackUrl: "/login?reason=timeout" });
        return;
      }

      if (idle >= INACTIVITY_LIMIT - WARNING_BEFORE) {
        setShowWarning(true);
        setCountdown(Math.ceil((INACTIVITY_LIMIT - idle) / 1000));
      } else {
        setShowWarning(false);
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showWarning) return;
    const tick = setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      const remaining = Math.ceil((INACTIVITY_LIMIT - idle) / 1000);
      if (remaining <= 0) {
        signOut({ callbackUrl: "/login?reason=timeout" });
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [showWarning]);

  return (
    <>
      {children}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 max-w-sm mx-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-sora font-bold text-gray-900 dark:text-white mb-1">Session Expiring</h2>
            <p className="text-sm text-gray-500 font-jakarta mb-4">
              You'll be signed out in <span className="font-bold text-amber-600">{countdown}s</span> due to inactivity.
            </p>
            <button
              onClick={resetActivity}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-brand text-white hover:opacity-90 transition-opacity"
            >
              I'm still here
            </button>
          </div>
        </div>
      )}
    </>
  );
}
