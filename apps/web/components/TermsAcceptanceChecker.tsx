'use client';

import { useEffect, useState } from 'react';
import { useUser } from './UserProvider';
import TermsAcceptanceModal from './TermsAcceptanceModal';

export default function TermsAcceptanceChecker() {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && !user.termsAcceptedAt) {
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
