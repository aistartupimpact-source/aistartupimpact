'use client';

import { useSearchParams } from 'next/navigation';
import SignInModal from '@/components/auth/SignInModal';

export default function LoginPage() {
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
