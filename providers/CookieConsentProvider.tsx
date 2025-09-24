"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CookieConsent } from '@/components/ui/CookieConsent/CookieConsent';
import { 
  getCookieConsent, 
  isCookieCategoryAllowed, 
  CookieConsent as CookieConsentType 
} from '@/lib/cookies';

interface CookieConsentContextType {
  consent: CookieConsentType | null;
  hasConsent: boolean;
  isAllowed: (category: keyof CookieConsentType) => boolean;
  showConsentBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

interface CookieConsentProviderProps {
  children: React.ReactNode;
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<CookieConsentType | null>(null);
  const [hasUserConsent, setHasUserConsent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const currentConsent = getCookieConsent();
    setConsent(currentConsent);
    setHasUserConsent(currentConsent !== null);
    
    // Show banner if no consent exists
    if (!currentConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsentChange = (newConsent: CookieConsentType) => {
    setConsent(newConsent);
    setHasUserConsent(true);
    setShowBanner(false);
    
    // Initialize analytics if allowed
    if (newConsent && newConsent.analytics && typeof window !== 'undefined') {
      initializeAnalytics();
    }
    
    // Initialize marketing cookies if allowed
    if (newConsent && newConsent.marketing && typeof window !== 'undefined') {
      initializeMarketing();
    }
  };

  const isAllowed = (category: keyof CookieConsentType): boolean => {
    return isCookieCategoryAllowed(category);
  };

  const showConsentBanner = () => {
    setShowBanner(true);
  };

  const contextValue: CookieConsentContextType = {
    consent,
    hasConsent: hasUserConsent,
    isAllowed,
    showConsentBanner,
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
      {showBanner && <CookieConsent onConsentChange={handleConsentChange} />}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsentContext(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsentContext must be used within a CookieConsentProvider');
  }
  return context;
}

// Helper functions for initializing third-party services
function initializeAnalytics() {
  // Initialize Google Analytics or other analytics services
  console.log('Analytics initialized');
  
  // Example: Google Analytics
  // if (typeof gtag !== 'undefined') {
  //   gtag('consent', 'update', {
  //     analytics_storage: 'granted'
  //   });
  // }
}

function initializeMarketing() {
  // Initialize marketing/advertising services
  console.log('Marketing cookies initialized');
  
  // Example: Facebook Pixel, Google Ads, etc.
  // if (typeof fbq !== 'undefined') {
  //   fbq('consent', 'grant');
  // }
}
