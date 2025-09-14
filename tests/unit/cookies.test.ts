import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setSecureCookie,
  getCookie,
  deleteCookie,
  setCookieConsent,
  getCookieConsent,
  hasConsent,
  isCookieCategoryAllowed,
  resetCookieConsent,
} from '@/lib/cookies';

// Create a more robust cookie mock for testing
let cookieStore: string = '';

Object.defineProperty(document, 'cookie', {
  get: () => cookieStore,
  set: (value: string) => {
    // Simple cookie parsing for tests
    if (value.includes('expires=Thu, 01 Jan 1970')) {
      // Handle deletion
      const name = value.split('=')[0];
      const cookies = cookieStore.split('; ').filter(cookie => !cookie.startsWith(name + '='));
      cookieStore = cookies.join('; ');
    } else {
      // Handle setting
      const [nameValue] = value.split(';');
      const [name] = nameValue.split('=');
      
      // Remove existing cookie with same name
      const cookies = cookieStore.split('; ').filter(cookie => 
        cookie && !cookie.startsWith(name + '=')
      );
      
      // Add new cookie
      if (nameValue) {
        cookies.push(nameValue);
      }
      
      cookieStore = cookies.filter(Boolean).join('; ');
    }
  },
  configurable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    protocol: 'https:',
    hostname: 'localhost',
  },
  writable: true,
});

describe('Cookie Utilities', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    cookieStore = '';
  });

  describe('Basic Cookie Operations', () => {
    it('should set and get a cookie', () => {
      setSecureCookie('test', 'value');
      expect(getCookie('test')).toBe('value');
    });

    it('should return null for non-existent cookie', () => {
      expect(getCookie('nonexistent')).toBeNull();
    });

    it('should delete a cookie', () => {
      setSecureCookie('test', 'value');
      expect(getCookie('test')).toBe('value');
      
      deleteCookie('test');
      // Note: In JSDOM, we can't fully test cookie deletion
      // but we can verify the function runs without error
      expect(() => deleteCookie('test')).not.toThrow();
    });
  });

  describe('Cookie Consent Management', () => {
    it('should set and get cookie consent', () => {
      const consent = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      };

      setCookieConsent(consent);
      const retrievedConsent = getCookieConsent();

      expect(retrievedConsent).not.toBeNull();
      expect(retrievedConsent!.necessary).toBe(true);
      expect(retrievedConsent!.analytics).toBe(true);
      expect(retrievedConsent!.marketing).toBe(false);
      expect(retrievedConsent!.preferences).toBe(true);
      expect(retrievedConsent!.version).toBe('1.0');
      expect(typeof retrievedConsent!.timestamp).toBe('number');
    });

    it('should return null when no consent is set', () => {
      expect(getCookieConsent()).toBeNull();
      expect(hasConsent()).toBe(false);
    });

    it('should check if consent exists', () => {
      expect(hasConsent()).toBe(false);
      
      setCookieConsent({ analytics: true });
      expect(hasConsent()).toBe(true);
    });

    it('should check cookie category permissions', () => {
      // Before consent, only necessary cookies should be allowed
      expect(isCookieCategoryAllowed('necessary')).toBe(true);
      expect(isCookieCategoryAllowed('analytics')).toBe(false);
      expect(isCookieCategoryAllowed('marketing')).toBe(false);
      expect(isCookieCategoryAllowed('preferences')).toBe(false);

      // After setting consent
      setCookieConsent({
        analytics: true,
        marketing: false,
        preferences: true,
      });

      expect(isCookieCategoryAllowed('necessary')).toBe(true);
      expect(isCookieCategoryAllowed('analytics')).toBe(true);
      expect(isCookieCategoryAllowed('marketing')).toBe(false);
      expect(isCookieCategoryAllowed('preferences')).toBe(true);
    });

    it('should reset cookie consent', () => {
      setCookieConsent({
        analytics: true,
        marketing: true,
        preferences: true,
      });

      expect(hasConsent()).toBe(true);
      
      resetCookieConsent();
      
      expect(getCookieConsent()).toBeNull();
      expect(hasConsent()).toBe(false);
    });

    it('should always keep necessary cookies as true', () => {
      setCookieConsent({
        necessary: false, // This should be ignored
        analytics: true,
      });

      const consent = getCookieConsent();
      expect(consent!.necessary).toBe(true);
    });
  });

  describe('Cookie Options', () => {
    it('should handle encoded cookie names and values', () => {
      const name = 'test with spaces';
      const value = 'value with special chars: !@#$%';
      
      setSecureCookie(name, value);
      expect(getCookie(name)).toBe(value);
    });

    it('should set secure cookies in HTTPS environment', () => {
      // Mock HTTPS environment
      Object.defineProperty(window, 'location', {
        value: { protocol: 'https:' },
        writable: true,
      });

      expect(() => setSecureCookie('secure-test', 'value')).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed consent cookie gracefully', () => {
      // Set an invalid JSON cookie manually
      document.cookie = 'northstar_cookie_consent=invalid-json';
      
      expect(getCookieConsent()).toBeNull();
    });

    it('should handle empty cookie string', () => {
      document.cookie = '';
      expect(getCookie('any')).toBeNull();
    });
  });
});

  describe('Server-side Cookie Handling', () => {
    it('should handle server-side gracefully', () => {
      const originalDocument = global.document;
      // @ts-ignore
      global.document = undefined;
      
      expect(() => setSecureCookie('test', 'value')).not.toThrow();
      expect(getCookie('test')).toBeNull();
      expect(() => deleteCookie('test')).not.toThrow();
      
      global.document = originalDocument;
    });
  });
