"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useTermSelector } from '@/providers/TermSelectorProvider';
import { useTermSelectorModalContext } from '@/providers/TermSelectorModalProvider';
// Removed ChevronDown import as per request
import styles from './Logo.module.css';

interface LogoData {
  imageUrl: string;
  altText: string;
  name: string;
}

interface LogosMap {
  [key: string]: LogoData;
}

interface LogoProps {
  isCollapsed: boolean;
  theme?: 'light' | 'dark' | 'system';
  className?: string;
}

export function Logo({ isCollapsed, theme = 'system', className }: LogoProps) {
  const [logos, setLogos] = useState<LogosMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const { appSettings } = useAppSettings();
  // Safely handle cases where TermSelectorProvider is not available (e.g., marketing pages)
  let selectedTermName = '';
  let toggleTermModal = () => {};
  
  try {
    const termSelector = useTermSelector();
    const termModalContext = useTermSelectorModalContext();
    selectedTermName = termSelector.selectedTermName;
    toggleTermModal = termModalContext.toggle;
  } catch (error) {
    // TermSelectorProvider not available - this is expected on marketing pages
    selectedTermName = '';
    toggleTermModal = () => {};
  }

  // Effect to resolve the effective theme
  useEffect(() => {
    const resolveTheme = () => {
      if (theme === 'system') {
        if (typeof window !== 'undefined' && document) {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          return currentTheme === 'dark' ? 'dark' : 'light';
        }
        return 'light'; // SSR fallback
      }
      return theme;
    };

    const resolved = resolveTheme();
    setEffectiveTheme(resolved);

    // Listen for theme changes when in system mode
    if (theme === 'system' && typeof window !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            const newTheme = document.documentElement.getAttribute('data-theme');
            setEffectiveTheme(newTheme === 'dark' ? 'dark' : 'light');
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });

      return () => observer.disconnect();
    }
  }, [theme]);

  // Effect to fetch all logos once on mount
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/logos/all');
        const result = await response.json();
        
        if (result.success && result.data) {
          setLogos(result.data);
        } else {
          console.warn('Logos API returned error:', result.error);
          setLogos(null);
        }
      } catch (error) {
        console.warn('Unable to fetch logos from API, using fallback:', error);
        setLogos(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLogos();
  }, []); // Only fetch once on mount

  // Handle logo click to open term selector modal
  const handleLogoClick = () => {
    toggleTermModal();
  };

  // Create the logo component
  const renderLogo = () => {
    if (loading) {
      return (
        <div className={`${styles.logoPlaceholder} ${className || ''}`}>
          <div className={styles.loadingSpinner} />
        </div>
      );
    }

    // Determine which logo variant to use
    const variant = `${isCollapsed ? 'collapsed' : 'expanded'}-${effectiveTheme === 'dark' ? 'dark' : 'regular'}`;
    const logo = logos?.[variant];

    if (!logo) {
      // Fallback to text logo if no image is available
      const appName = appSettings?.appName || 'Northstar';
      return (
        <button 
          onClick={handleLogoClick}
          className={`${styles.textLogo} ${styles.logoButton} ${className || ''}`} 
          title={selectedTermName ? `Current selection: ${selectedTermName}` : appName}
        >
          <span className={styles.logoIcon}>⭐</span>
          {!isCollapsed && (
            <span className={styles.logoText}>{appName}</span>
          )}
        </button>
      );
    }

    return (
      <button 
        onClick={handleLogoClick}
        className={`${styles.logo} ${styles.logoButton} ${className || ''}`} 
        title={selectedTermName ? `Current selection: ${selectedTermName}` : logo.altText}
      >
        <Image
          src={logo.imageUrl}
          alt={logo.altText}
          width={isCollapsed ? 32 : 120}
          height={32}
          className={styles.logoImage}
          priority
          quality={100}
          sizes={isCollapsed ? "32px" : "120px"}
        />
      </button>
    );
  };

  return renderLogo();
}