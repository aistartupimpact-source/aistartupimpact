'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SignInModal from '@/components/auth/SignInModal';

function SignupContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return (
    <SignInModal
      isOpen={true}
      onClose={() => {}}
      defaultMode="signup"
      defaultTab="founder"
      returnTo={returnTo}
      fullPage={true}
    />
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>}>
      <SignupContent />
    </Suspense>
  );
}
