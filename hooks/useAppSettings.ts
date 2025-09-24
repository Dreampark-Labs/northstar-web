import { useState, useEffect } from 'react';
import { client, AppSettings, FooterSettings } from '@/lib/sanity';

export function useAppSettings() {
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appName: 'Northstar',
    appDescription: 'Academic Planning Platform'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = client.fetch(`
          *[_type == "appSettings"][0] {
            appName,
            appDescription,
            metaKeywords,
            metaTitle,
            favicon,
            appleTouchIcon,
            isActive
          }
        `);
        
        const settings = await Promise.race([fetchPromise, timeoutPromise]);
        
        setAppSettings(settings || {
          appName: 'Northstar',
          appDescription: 'Academic Planning Platform'
        });
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch app settings, using defaults:', err);
        setError('Failed to load settings');
        // Set defaults on error - don't let this break the app
        setAppSettings({
          appName: 'Northstar',
          appDescription: 'Academic Planning Platform'
        });
      } finally {
        setLoading(false);
      }
    };

    // Don't block the app if Sanity is unavailable
    fetchSettings().catch((err) => {
      console.warn('App settings fetch failed completely:', err);
      setAppSettings({
        appName: 'Northstar',
        appDescription: 'Academic Planning Platform'
      });
      setLoading(false);
    });
  }, []);

  return { appSettings, loading, error };
}


export function useFooterSettings() {
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = client.fetch(`
          *[_type == "footerSettings"][0] {
            companyName,
            version,
            supportEmail,
            privacyEmail,
            showSecurityBadge,
            socialLinks,
            legalLinks
          }
        `);
        
        const settings = await Promise.race([fetchPromise, timeoutPromise]);
        
        setFooterSettings(settings || {
          companyName: 'Northstar',
          version: '1.0.0'
        });
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch footer settings, using defaults:', err);
        setError('Failed to load footer settings');
        // Set defaults on error - don't let this break the app
        setFooterSettings({
          companyName: 'Northstar',
          version: '1.0.0'
        });
      } finally {
        setLoading(false);
      }
    };

    // Don't block the app if Sanity is unavailable
    fetchFooterSettings().catch((err) => {
      console.warn('Footer settings fetch failed completely:', err);
      setFooterSettings({
        companyName: 'Northstar',
        version: '1.0.0'
      });
      setLoading(false);
    });
  }, []);

  return { footerSettings, loading, error };
}