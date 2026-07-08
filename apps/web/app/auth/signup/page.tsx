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
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
