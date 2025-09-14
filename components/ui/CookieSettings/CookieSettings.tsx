"use client";

import React, { useState } from 'react';
import { useCookieConsentContext } from '@/providers/CookieConsentProvider';
import { getCookieConsent, setCookieConsent, resetCookieConsent } from '@/lib/cookies';
import styles from './CookieSettings.module.css';

interface CookieSettingsProps {
  showAsButton?: boolean;
  buttonText?: string;
}

export function CookieSettings({ 
  showAsButton = true, 
  buttonText = "Cookie Settings" 
}: CookieSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    const consent = getCookieConsent();
    return consent || {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
  });
  const { showConsentBanner } = useCookieConsentContext();

  const handlePreferenceChange = (category: keyof typeof preferences, value: boolean) => {
    if (category === 'necessary') return; // Necessary cookies can't be disabled
    
    setPreferences(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSave = () => {
    setCookieConsent(preferences);
    setIsOpen(false);
  };

  const handleReset = () => {
    resetCookieConsent();
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
    showConsentBanner();
    setIsOpen(false);
  };

  const SettingsModal = () => (
    <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Cookie Settings</h2>
          <button 
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.description}>
          <p>
            Manage your cookie preferences below. Changes will take effect immediately and be remembered for future visits.
          </p>
        </div>

        <div className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <div>
              <h3 className={styles.categoryName}>Necessary Cookies</h3>
              <p className={styles.categoryDescription}>
                Essential for the website to function properly. Cannot be disabled.
              </p>
            </div>
            <label className={styles.toggle}>
              <input 
                type="checkbox" 
                checked={preferences.necessary}
                disabled={true}
                onChange={() => {}}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <div>
              <h3 className={styles.categoryName}>Analytics Cookies</h3>
              <p className={styles.categoryDescription}>
                Help us understand how visitors interact with our website.
              </p>
            </div>
            <label className={styles.toggle}>
              <input 
                type="checkbox" 
                checked={preferences.analytics}
                onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <div>
              <h3 className={styles.categoryName}>Marketing Cookies</h3>
              <p className={styles.categoryDescription}>
                Used to deliver relevant advertisements and measure campaign effectiveness.
              </p>
            </div>
            <label className={styles.toggle}>
              <input 
                type="checkbox" 
                checked={preferences.marketing}
                onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <div>
              <h3 className={styles.categoryName}>Preference Cookies</h3>
              <p className={styles.categoryDescription}>
                Remember your settings and preferences for a personalized experience.
              </p>
            </div>
            <label className={styles.toggle}>
              <input 
                type="checkbox" 
                checked={preferences.preferences}
                onChange={(e) => handlePreferenceChange('preferences', e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button 
            className={`${styles.button} ${styles.resetButton}`}
            onClick={handleReset}
          >
            Reset to Default
          </button>
          <div className={styles.primaryActions}>
            <button 
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button 
              className={`${styles.button} ${styles.saveButton}`}
              onClick={handleSave}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showAsButton) {
    return (
      <>
        <button 
          className={styles.settingsButton}
          onClick={() => setIsOpen(true)}
        >
          {buttonText}
        </button>
        {isOpen && <SettingsModal />}
      </>
    );
  }

  return (
    <>
      <div className={styles.inlineSettings} onClick={() => setIsOpen(true)}>
        <span>{buttonText}</span>
      </div>
      {isOpen && <SettingsModal />}
    </>
  );
}
