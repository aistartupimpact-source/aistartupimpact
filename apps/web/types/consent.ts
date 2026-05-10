// types/consent.ts
export const POLICY_VERSION = '1.0.0';
export const SCHEMA_VERSION = '1.0';

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentDecision {
  consentId: string;
  timestamp: string;
  categories: ConsentState;
  method: 'banner' | 'preferences' | 'link';
  policyVersion: string;
  schemaVersion: string;
}

export interface ConsentLogPayload extends ConsentDecision {
  ipHash?: string;
  userAgent?: string;
  country?: string;
}

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export const CONSENT_STORAGE_KEY = 'asi_consent_v1';
