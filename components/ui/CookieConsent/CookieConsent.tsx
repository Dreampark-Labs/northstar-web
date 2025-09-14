"use client";

import React, { useState, useEffect } from 'react';
import { 
  getCookieConsent, 
  setCookieConsent, 
  hasConsent, 
  CookieConsent as CookieConsentType 
} from '@/lib/cookies';
import styles from './CookieConsent.module.css';

interface CookieConsentProps {
  onConsentChange?: (consent: CookieConsentType) => void;
}

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = getCookieConsent();
    
    if (!existingConsent) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Load existing preferences
      setPreferences({
        necessary: existingConsent.necessary,
        analytics: existingConsent.analytics,
        marketing: existingConsent.marketing,
        preferences: existingConsent.preferences,
      });
    }
  }, []);

  const handleAccept = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    setCookieConsent(consent);
    setIsVisible(false);
    onConsentChange?.(getCookieConsent()!);
  };

  const handleDecline = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    setCookieConsent(consent);
    setIsVisible(false);
    onConsentChange?.(getCookieConsent()!);
  };

  const handleCustomize = () => {
    setShowCustomizeModal(true);
  };

  const handleSavePreferences = () => {
    setCookieConsent(preferences);
    setShowCustomizeModal(false);
    setIsVisible(false);
    onConsentChange?.(getCookieConsent()!);
  };

  const handlePreferenceChange = (category: keyof typeof preferences, value: boolean) => {
    if (category === 'necessary') return; // Necessary cookies can't be disabled
    
    setPreferences(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Cookie Consent Modal */}
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.headerContent}>
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className={styles.modalTitle}>We respect your privacy</h2>
            </div>
          </div>
          
          <div className={styles.modalBody}>
            <p className={styles.description}>
              We use cookies to enhance your experience, analyze site traffic, and provide personalized content. 
              You can accept all cookies or decline optional ones. Necessary cookies are always active to ensure 
              basic site functionality.
            </p>
          </div>
          
          <div className={styles.modalActions}>
            <button 
              className={`${styles.button} ${styles.declineButton}`}
              onClick={handleDecline}
            >
              Decline Optional
            </button>
            
            <button 
              className={`${styles.button} ${styles.customizeButton}`}
              onClick={handleCustomize}
            >
              Customize
            </button>
            
            <button 
              className={`${styles.button} ${styles.acceptButton}`}
              onClick={handleAccept}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Customize Preferences Modal */}
      {showCustomizeModal && (
        <div className={`${styles.modal} ${styles.customizeModal}`} onClick={(e) => e.target === e.currentTarget && setShowCustomizeModal(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Cookie Preferences</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCustomizeModal(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryName}>Necessary Cookies</h3>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox" 
                      checked={preferences.necessary}
                      disabled={true}
                      onChange={() => {}} // Necessary cookies can't be disabled
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  These cookies are essential for the website to function properly. They enable basic features 
                  like page navigation, access to secure areas, and remember your login status.
                </p>
              </div>

              <div className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryName}>Analytics Cookies</h3>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox" 
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously. This helps us improve our services.
                </p>
              </div>

              <div className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryName}>Marketing Cookies</h3>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox" 
                      checked={preferences.marketing}
                      onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  These cookies are used to deliver advertisements that are relevant to you and your interests. 
                  They may also be used to limit the number of times you see an advertisement.
                </p>
              </div>

              <div className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryName}>Preference Cookies</h3>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox" 
                      checked={preferences.preferences}
                      onChange={(e) => handlePreferenceChange('preferences', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  These cookies remember your settings and preferences, such as language, region, or theme, 
                  to provide a more personalized experience on future visits.
                </p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={() => setShowCustomizeModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`${styles.button} ${styles.saveButton}`}
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for checking consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentType | null>(null);
  const [hasUserConsent, setHasUserConsent] = useState(false);

  useEffect(() => {
    const currentConsent = getCookieConsent();
    setConsent(currentConsent);
    setHasUserConsent(hasConsent());
  }, []);

  const updateConsent = (newConsent: Partial<CookieConsentType>) => {
    setCookieConsent(newConsent);
    const updatedConsent = getCookieConsent();
    setConsent(updatedConsent);
    setHasUserConsent(true);
  };

  return {
    consent,
    hasConsent: hasUserConsent,
    updateConsent,
  };
}
