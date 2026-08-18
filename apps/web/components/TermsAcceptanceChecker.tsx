'use client';

import { useEffect, useState } from 'react';
import { useUser } from './UserProvider';
import TermsAcceptanceModal from './TermsAcceptanceModal';
import { CURRENT_TERMS_VERSION } from '@/lib/terms-version';

export default function TermsAcceptanceChecker() {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && (!user.termsAcceptedAt || user.termsVersion !== CURRENT_TERMS_VERSION)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user]);

  if (!showModal || !user) {
    return null;
  }

  return <TermsAcceptanceModal userName={user.name} />;
}
