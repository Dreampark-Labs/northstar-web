"use client";

import { useEffect } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { urlFor } from '@/lib/sanity';

interface DynamicHeadProps {
  titleSuffix?: string;
  description?: string;
  keywords?: string[];
}

/**
 * Component to dynamically update document head based on Sanity settings
 * Use this component on pages where you want dynamic metadata
 */
export function DynamicHead({ titleSuffix, description, keywords }: DynamicHeadProps) {
  const { appSettings } = useAppSettings();

  useEffect(() => {
    if (!appSettings) return;

    // Update document title
    const title = titleSuffix 
      ? `${titleSuffix} - ${appSettings.appName}`
      : appSettings.metaTitle || `${appSettings.appName} - Academic Productivity`;
    
    document.title = title;

    // Update meta description
    const metaDescription = description || appSettings.appDescription;
    updateMetaTag('description', metaDescription);

    // Update keywords
    const allKeywords = [
      ...(keywords || []),
      ...(appSettings.metaKeywords || [])
    ];
    
    if (allKeywords.length > 0) {
      updateMetaTag('keywords', [...new Set(allKeywords)].join(', '));
    }

    // Update favicon if available
    if (appSettings.favicon && Object.keys(appSettings.favicon).length > 0) {
      const faviconUrl = urlFor(appSettings.favicon).width(32).height(32).url();
      updateFavicon(faviconUrl);
      
      // Update Apple touch icon if available
      if (appSettings.appleTouchIcon && Object.keys(appSettings.appleTouchIcon).length > 0) {
        const appleTouchIconUrl = urlFor(appSettings.appleTouchIcon).width(180).height(180).url();
        updateAppleTouchIcon(appleTouchIconUrl);
      }
    }
  }, [appSettings, titleSuffix, description, keywords]);

  // This component doesn't render anything
  return null;
}

// Helper functions
function updateMetaTag(name: string, content: string) {
  if (typeof document === 'undefined') return;

  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateFavicon(faviconUrl: string) {
  if (typeof document === 'undefined') return;

  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
  existingLinks.forEach(link => link.remove());

  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = faviconUrl;
  document.head.appendChild(link);

  // Also add shortcut icon for older browsers
  const shortcutLink = document.createElement('link');
  shortcutLink.rel = 'shortcut icon';
  shortcutLink.type = 'image/x-icon';
  shortcutLink.href = faviconUrl;
  document.head.appendChild(shortcutLink);
}

function updateAppleTouchIcon(appleTouchIconUrl: string) {
  if (typeof document === 'undefined') return;

  // Remove existing apple-touch-icon links
  const existingLinks = document.querySelectorAll('link[rel="apple-touch-icon"]');
  existingLinks.forEach(link => link.remove());

  // Add new apple-touch-icon
  const link = document.createElement('link');
  link.rel = 'apple-touch-icon';
  link.href = appleTouchIconUrl;
  document.head.appendChild(link);
}
