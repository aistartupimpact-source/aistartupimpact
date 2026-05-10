// lib/consent-manager.ts
import {
  ConsentState,
  ConsentDecision,
  ConsentLogPayload,
  DEFAULT_CONSENT,
  CONSENT_STORAGE_KEY,
  POLICY_VERSION,
  SCHEMA_VERSION,
  ConsentCategory,
} from '@/types/consent';

type ConsentListener = (state: ConsentState) => void;

class ConsentManager {
  private static instance: ConsentManager;
  private listeners: Map<ConsentCategory, Set<ConsentListener>> = new Map();
  private currentState: ConsentState = DEFAULT_CONSENT;
  private initialized = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.checkGPCAndDNT();
      this.initialized = true;
    }
  }

  private checkGPCAndDNT(): void {
    // Honor Global Privacy Control (GPC) and Do Not Track (DNT)
    if (typeof navigator !== 'undefined') {
      const gpc = (navigator as any).globalPrivacyControl;
      const dnt = navigator.doNotTrack;
      
      if (gpc === true || dnt === '1') {
        // Auto-reject if user has GPC or DNT enabled and hasn't made a decision yet
        if (!this.hasDecided()) {
          this.rejectAll('banner');
        }
      }
    }
  }

  static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const decision: ConsentDecision = JSON.parse(stored);
        
        // Force re-consent if policy version changed
        if (decision.policyVersion !== POLICY_VERSION) {
          this.clearConsent();
          return;
        }
        
        this.currentState = decision.categories;
      }
    } catch (error) {
      console.error('Failed to load consent from storage:', error);
    }
  }

  private saveToStorage(decision: ConsentDecision): void {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision));
    } catch (error) {
      console.error('Failed to save consent to storage:', error);
    }
  }

  private async logConsent(decision: ConsentDecision): Promise<void> {
    try {
      const payload: ConsentLogPayload = {
        ...decision,
        userAgent: navigator.userAgent,
      };

      await fetch('/api/consent-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to log consent:', error);
    }
  }

  private notifyListeners(category: ConsentCategory): void {
    const listeners = this.listeners.get(category);
    if (listeners) {
      listeners.forEach((listener) => listener(this.currentState));
    }
  }

  private generateConsentId(): string {
    return crypto.randomUUID();
  }

  public hasConsent(category: ConsentCategory): boolean {
    return this.currentState[category];
  }

  public getState(): ConsentState {
    return { ...this.currentState };
  }

  public hasDecided(): boolean {
    const stored = typeof window !== 'undefined' 
      ? localStorage.getItem(CONSENT_STORAGE_KEY) 
      : null;
    return stored !== null;
  }

  public async updateConsent(
    categories: Partial<ConsentState>,
    method: 'banner' | 'preferences' | 'link'
  ): Promise<void> {
    const newState: ConsentState = {
      ...this.currentState,
      ...categories,
      necessary: true, // Always true
    };

    const decision: ConsentDecision = {
      consentId: this.generateConsentId(),
      timestamp: new Date().toISOString(),
      categories: newState,
      method,
      policyVersion: POLICY_VERSION,
      schemaVersion: SCHEMA_VERSION,
    };

    this.currentState = newState;
    this.saveToStorage(decision);
    await this.logConsent(decision);

    // Notify all listeners
    (Object.keys(categories) as ConsentCategory[]).forEach((category) => {
      this.notifyListeners(category);
    });

    // Delete cookies if consent was revoked
    if (categories.analytics === false) {
      this.deleteAnalyticsCookies();
    }
    if (categories.marketing === false) {
      this.deleteMarketingCookies();
    }

    // Update Google Consent Mode
    this.updateGoogleConsentMode();

    // Unblock scripts
    this.unblockScripts();
  }

  public async acceptAll(method: 'banner' | 'preferences' | 'link' = 'banner'): Promise<void> {
    await this.updateConsent(
      {
        necessary: true,
        analytics: true,
        marketing: true,
      },
      method
    );
  }

  public async rejectAll(method: 'banner' | 'preferences' | 'link' = 'banner'): Promise<void> {
    await this.updateConsent(
      {
        necessary: true,
        analytics: false,
        marketing: false,
      },
      method
    );
  }

  private deleteCookie(name: string, domain?: string): void {
    if (typeof document === 'undefined') return;
    
    const domains = domain ? [domain] : [
      window.location.hostname,
      `.${window.location.hostname}`,
      window.location.hostname.split('.').slice(-2).join('.'),
      `.${window.location.hostname.split('.').slice(-2).join('.')}`,
    ];

    const paths = ['/', ''];

    domains.forEach((d) => {
      paths.forEach((path) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${d}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
      });
    });
  }

  private deleteAnalyticsCookies(): void {
    // Delete Google Analytics cookies
    const gaCookies = ['_ga', '_gid', '_gat', '_gat_gtag_' + (process.env.NEXT_PUBLIC_GA_ID || '').replace(/-/g, '_')];
    gaCookies.forEach((cookie) => this.deleteCookie(cookie));
  }

  private deleteMarketingCookies(): void {
    // Delete common marketing cookies
    const marketingCookies = ['_fbp', '_fbc', 'fr', 'tr', 'IDE', 'test_cookie'];
    marketingCookies.forEach((cookie) => this.deleteCookie(cookie));
  }

  public clearConsent(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      this.currentState = DEFAULT_CONSENT;
      // Delete all non-necessary cookies
      this.deleteAnalyticsCookies();
      this.deleteMarketingCookies();
    }
  }

  public revokeConsent(): void {
    this.clearConsent();
    // Reload page to clear any loaded scripts
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  public onConsent(category: ConsentCategory, callback: ConsentListener): () => void {
    if (!this.listeners.has(category)) {
      this.listeners.set(category, new Set());
    }
    this.listeners.get(category)!.add(callback);

    // If already consented, call immediately
    if (this.hasConsent(category)) {
      callback(this.currentState);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(category)?.delete(callback);
    };
  }

  private updateGoogleConsentMode(): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: this.currentState.analytics ? 'granted' : 'denied',
        ad_storage: this.currentState.marketing ? 'granted' : 'denied',
        ad_user_data: this.currentState.marketing ? 'granted' : 'denied',
        ad_personalization: this.currentState.marketing ? 'granted' : 'denied',
      });
    }
  }

  private unblockScripts(): void {
    if (typeof document === 'undefined') return;

    const blockedScripts = document.querySelectorAll('script[type="text/plain"][data-consent]');
    
    blockedScripts.forEach((script) => {
      const category = script.getAttribute('data-consent') as ConsentCategory;
      
      if (this.hasConsent(category)) {
        const newScript = document.createElement('script');
        
        // Copy all attributes except type and data-consent
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== 'type' && attr.name !== 'data-consent') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        
        // Copy inline script content if any
        if (script.textContent) {
          newScript.textContent = script.textContent;
        }
        
        // Replace old script with new one
        script.parentNode?.replaceChild(newScript, script);
      }
    });
  }
}

export default ConsentManager;
