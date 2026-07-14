'use client';

import { useState, useEffect } from 'react';
import ConsentManager from '@/lib/consent-manager';
import { ConsentState } from '@/types/consent';
import styles from '@/styles/CookieConsent.module.css';
import { Cookie, ShieldCheck, BarChart3, Target, X } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const manager = ConsentManager.getInstance();
    
    // Check URL for test mode
    const urlParams = new URLSearchParams(window.location.search);
    const testMode = urlParams.get('test-cookie-banner') === 'true';
    
    if (testMode) {
      // Force show banner in test mode
      manager.clearConsent();
      setShowBanner(true);
    } else if (!manager.hasDecided()) {
      setShowBanner(true);
    } else {
      setPreferences(manager.getState());
    }
  }, []);

  const handleAcceptAll = async () => {
    const manager = ConsentManager.getInstance();
    await manager.acceptAll('banner');
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleRejectAll = async () => {
    const manager = ConsentManager.getInstance();
    await manager.rejectAll('banner');
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleCustomize = () => {
    const manager = ConsentManager.getInstance();
    setPreferences(manager.getState());
    setShowPreferences(true);
  };

  const handleSavePreferences = async () => {
    const manager = ConsentManager.getInstance();
    await manager.updateConsent(preferences, 'preferences');
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleToggle = (category: keyof ConsentState) => {
    if (category === 'necessary') return; // Can't toggle necessary
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* Banner */}
      {showBanner && !showPreferences && (
        <div className={styles.banner} role="dialog" aria-label="Cookie consent banner">
          <div className={styles.bannerContent}>
            <div className={styles.bannerHeader}>
              <div className={styles.iconWrapper}>
                <Cookie size={20} />
              </div>
              <h2 className={styles.bannerTitle}>We value your privacy</h2>
            </div>
            <p className={styles.bannerDescription}>
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies. Read our{' '}
              <a href="/cookie-policy" className={styles.link}>Cookie Policy</a>.
            </p>
            <div className={styles.bannerActions}>
              <button
                onClick={handleRejectAll}
                className={`${styles.button} ${styles.buttonSecondary}`}
                aria-label="Reject all cookies"
              >
                Reject All
              </button>
              <button
                onClick={handleCustomize}
                className={`${styles.button} ${styles.buttonSecondary}`}
                aria-label="Customize cookie preferences"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className={`${styles.button} ${styles.buttonPrimary} ${styles.acceptAllButton}`}
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Cookie preferences">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrapper}>
                <div className={styles.iconWrapper}>
                  <Cookie size={20} />
                </div>
                <h2 className={styles.modalTitle}>Cookie Settings</h2>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className={styles.modalClose}
                aria-label="Close preferences"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                Manage your cookie preferences below. You can enable or disable different types of cookies. 
                Note that blocking some types of cookies may impact your experience on our site.
              </p>

              {/* Necessary Cookies */}
              <div className={styles.preferenceItem}>
                <div className={styles.preferenceHeader}>
                  <div className={styles.preferenceTextWrapper}>
                    <div className={styles.preferenceTitleRow}>
                      <ShieldCheck size={18} className={styles.preferenceIcon} />
                      <h3 className={styles.preferenceTitle}>Necessary</h3>
                      <span className={styles.badge}>Always Active</span>
                    </div>
                    <p className={styles.preferenceDescription}>
                      Essential for the website to function properly. They cannot be disabled and do not store any personally identifiable information.
                    </p>
                  </div>
                  <div className={`${styles.toggle} ${styles.toggleDisabled}`}>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      aria-label="Necessary cookies (always enabled)"
                    />
                    <span className={styles.toggleSlider}></span>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className={styles.preferenceItem}>
                <div className={styles.preferenceHeader}>
                  <div className={styles.preferenceTextWrapper}>
                    <div className={styles.preferenceTitleRow}>
                      <BarChart3 size={18} className={styles.preferenceIcon} />
                      <h3 className={styles.preferenceTitle}>Analytics</h3>
                    </div>
                    <p className={styles.preferenceDescription}>
                      Help us measure traffic and see how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>
                  <div className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handleToggle('analytics')}
                      aria-label="Toggle analytics cookies"
                    />
                    <span className={styles.toggleSlider}></span>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className={styles.preferenceItem}>
                <div className={styles.preferenceHeader}>
                  <div className={styles.preferenceTextWrapper}>
                    <div className={styles.preferenceTitleRow}>
                      <Target size={18} className={styles.preferenceIcon} />
                      <h3 className={styles.preferenceTitle}>Marketing</h3>
                    </div>
                    <p className={styles.preferenceDescription}>
                      Used to track visitors across websites so that publishers can display relevant and engaging advertisements.
                    </p>
                  </div>
                  <div className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handleToggle('marketing')}
                      aria-label="Toggle marketing cookies"
                    />
                    <span className={styles.toggleSlider}></span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={handleRejectAll}
                className={`${styles.button} ${styles.buttonSecondary}`}
                aria-label="Reject all cookies"
              >
                Reject All
              </button>
              <button
                onClick={handleSavePreferences}
                className={`${styles.button} ${styles.buttonPrimary}`}
                aria-label="Save preferences"
              >
                Save Choices
              </button>
              <button
                onClick={handleAcceptAll}
                className={`${styles.button} ${styles.buttonPrimary} ${styles.acceptAllButton}`}
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Export a link component for footer
export function CookieSettingsLink({ className = '' }: { className?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const manager = ConsentManager.getInstance();
    manager.clearConsent();
    window.location.reload();
  };

  return (
    <a href="#" onClick={handleClick} className={className}>
      Cookie Settings
    </a>
  );
}
