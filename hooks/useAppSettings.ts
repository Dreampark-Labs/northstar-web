import { useState, useEffect } from 'react';
import { client } from '@/lib/sanity';

interface AppSettings {
  siteName?: string;
  siteDescription?: string;
  logoLight?: any;
  logoDark?: any;
  primaryColor?: string;
  secondaryColor?: string;
}

export function useAppSettings() {
  const [appSettings, setAppSettings] = useState<AppSettings>({});
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
            siteName,
            siteDescription,
            logoLight,
            logoDark,
            primaryColor,
            secondaryColor
          }
        `);
        
        const settings = await Promise.race([fetchPromise, timeoutPromise]);
        
        setAppSettings(settings || {
          siteName: 'Northstar',
          siteDescription: 'Academic Planning Platform'
        });
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch app settings, using defaults:', err);
        setError('Failed to load settings');
        // Set defaults on error - don't let this break the app
        setAppSettings({
          siteName: 'Northstar',
          siteDescription: 'Academic Planning Platform'
        });
      } finally {
        setLoading(false);
      }
    };

    // Don't block the app if Sanity is unavailable
    fetchSettings().catch((err) => {
      console.warn('App settings fetch failed completely:', err);
      setAppSettings({
        siteName: 'Northstar',
        siteDescription: 'Academic Planning Platform'
      });
      setLoading(false);
    });
  }, []);

  return { appSettings, loading, error };
}

interface FooterSettings {
  companyName?: string;
  year?: number;
  links?: any[];
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
            year,
            links
          }
        `);
        
        const settings = await Promise.race([fetchPromise, timeoutPromise]);
        
        setFooterSettings(settings || {
          companyName: 'Northstar',
          year: new Date().getFullYear()
        });
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch footer settings, using defaults:', err);
        setError('Failed to load footer settings');
        // Set defaults on error - don't let this break the app
        setFooterSettings({
          companyName: 'Northstar',
          year: new Date().getFullYear()
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
        year: new Date().getFullYear()
      });
      setLoading(false);
    });
  }, []);

  return { footerSettings, loading, error };
}