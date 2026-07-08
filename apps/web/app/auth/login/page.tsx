'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SignInModal from '@/components/auth/SignInModal';

function LoginContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return (
    <SignInModal
      isOpen={true}
      onClose={() => {}}
      defaultMode="signin"
      defaultTab="founder"
      returnTo={returnTo}
      fullPage={true}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
