'use client';

import { Turnstile } from '@marsidev/react-turnstile';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

export default function TurnstileWidget({ onSuccess, onError, onExpire, className }: TurnstileWidgetProps) {
  if (!SITE_KEY) return null;

  return (
    <div className={className}>
      <Turnstile
        siteKey={SITE_KEY}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'auto',
          size: 'flexible',
        }}
      />
    </div>
  );
}
