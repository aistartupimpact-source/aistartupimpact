'use client';

import { useSearchParams } from 'next/navigation';
import SignInModal from '@/components/auth/SignInModal';

export default function SignupPage() {
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
