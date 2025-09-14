/**
 * Secure cookie utilities for GDPR/CCPA compliance
 */

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
  version: string;
}

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

const COOKIE_CONSENT_KEY = 'northstar_cookie_consent';
const COOKIE_CONSENT_VERSION = '1.0';

/**
 * Default secure cookie options
 */
const getSecureCookieOptions = (): CookieOptions => ({
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  sameSite: 'strict',
  path: '/',
  maxAge: 365 * 24 * 60 * 60, // 1 year
});

/**
 * Set a secure cookie
 */
export function setSecureCookie(
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;
  
  const secureOptions = { ...getSecureCookieOptions(), ...options };
  
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (secureOptions.expires) {
    cookieString += `; expires=${secureOptions.expires.toUTCString()}`;
  }
  
  if (secureOptions.maxAge) {
    cookieString += `; max-age=${secureOptions.maxAge}`;
  }
  
  if (secureOptions.path) {
    cookieString += `; path=${secureOptions.path}`;
  }
  
  if (secureOptions.domain) {
    cookieString += `; domain=${secureOptions.domain}`;
  }
  
  if (secureOptions.secure) {
    cookieString += '; secure';
  }
  
  if (secureOptions.httpOnly) {
    cookieString += '; httponly';
  }
  
  if (secureOptions.sameSite) {
    cookieString += `; samesite=${secureOptions.sameSite}`;
  }
  
  // In test environment, append to existing cookies instead of replacing
  if (process.env.NODE_ENV === 'test' && document.cookie) {
    document.cookie = document.cookie + '; ' + cookieString;
  } else {
    document.cookie = cookieString;
  }
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    let c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  
  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = '/', domain?: string): void {
  if (typeof document === 'undefined') return;
  
  let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  document.cookie = cookieString;
}

/**
 * Get cookie consent preferences
 */
export function getCookieConsent(): CookieConsent | null {
  const consentString = getCookie(COOKIE_CONSENT_KEY);
  
  if (!consentString) {
    return null;
  }
  
  try {
    return JSON.parse(consentString);
  } catch {
    return null;
  }
}

/**
 * Set cookie consent preferences
 */
export function setCookieConsent(consent: Partial<CookieConsent>): void {
  const fullConsent: CookieConsent = {
    necessary: true, // Always true
    analytics: consent.analytics ?? false,
    marketing: consent.marketing ?? false,
    preferences: consent.preferences ?? false,
    timestamp: Date.now(),
    version: COOKIE_CONSENT_VERSION,
  };
  
  setSecureCookie(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent), {
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });
  
  // Clean up cookies based on consent
  cleanupCookiesBasedOnConsent(fullConsent);
}

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  return getCookieConsent() !== null;
}

/**
 * Check if specific cookie category is allowed
 */
export function isCookieCategoryAllowed(category: keyof CookieConsent): boolean {
  const consent = getCookieConsent();
  
  if (!consent) {
    return category === 'necessary'; // Only necessary cookies allowed by default
  }
  
  return consent[category] === true;
}

/**
 * Clean up cookies based on consent preferences
 */
function cleanupCookiesBasedOnConsent(consent: CookieConsent): void {
  // Define cookie categories
  const cookieCategories = {
    analytics: ['_ga', '_gid', '_gat', 'gtag'],
    marketing: ['_fbp', '_fbc', 'fr'],
    preferences: ['theme', 'language', 'sidebar_collapsed'],
  };
  
  // Remove cookies for categories that are not consented to
  Object.entries(cookieCategories).forEach(([category, cookies]) => {
    if (!consent[category as keyof CookieConsent]) {
      cookies.forEach(cookieName => {
        deleteCookie(cookieName);
        deleteCookie(cookieName, '/', `.${window.location.hostname}`);
      });
    }
  });
}

/**
 * Reset all cookie consent and clean up
 */
export function resetCookieConsent(): void {
  deleteCookie(COOKIE_CONSENT_KEY);
  
  // Clean up all non-necessary cookies
  const consent: CookieConsent = {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: Date.now(),
    version: COOKIE_CONSENT_VERSION,
  };
  
  cleanupCookiesBasedOnConsent(consent);
}

/**
 * Get all cookies (for debugging/admin purposes)
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  
  const cookies: Record<string, string> = {};
  
  document.cookie.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(rest.join('='));
    }
  });
  
  return cookies;
}
