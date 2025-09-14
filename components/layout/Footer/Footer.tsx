"use client";

import React from 'react';
import Link from 'next/link';
import { CookieSettings } from '@/components/ui/CookieSettings/CookieSettings';
import { useAppSettings, useFooterSettings } from '@/hooks/useAppSettings';
import { AppSettings, FooterSettings } from '@/lib/sanity';
import styles from './Footer.module.css';

interface FooterProps {
  appSettings?: AppSettings;
  footerSettings?: FooterSettings;
}

export function Footer({ appSettings: propsAppSettings, footerSettings: propsFooterSettings }: FooterProps = {}) {
  const { appSettings: hookAppSettings, loading: appLoading } = useAppSettings();
  const { footerSettings: hookFooterSettings, loading: footerLoading } = useFooterSettings();
  
  // Use props if provided (server-side preloaded), otherwise fall back to hooks (client-side)
  const appSettings = propsAppSettings || hookAppSettings;
  const footerSettings = propsFooterSettings || hookFooterSettings;
  const loading = propsAppSettings && propsFooterSettings ? false : (appLoading || footerLoading);

  // Show loading state or fallback
  if (loading || !footerSettings || !appSettings) {
    return (
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.section}>
              <h3 className={styles.title}>Loading...</h3>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>{appSettings.appName}</h3>
            <p className={styles.description}>
              {footerSettings.appDescription}
            </p>
            {footerSettings.version && (
              <p className={styles.version}>
                Version {footerSettings.version}
              </p>
            )}
          </div>
          
          {footerSettings.legalLinks && footerSettings.legalLinks.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Legal</h4>
              <ul className={styles.links}>
                {footerSettings.legalLinks.map((link, index) => (
                  <li key={index}>
                    {link.isExternal ? (
                      <a 
                        href={link.url} 
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link href={link.url} className={styles.link}>
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
                <li>
                  <CookieSettings showAsButton={false} buttonText="Cookie Settings" />
                </li>
              </ul>
            </div>
          )}
          
          {(footerSettings.supportEmail || footerSettings.privacyEmail) && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Support</h4>
              <ul className={styles.links}>
                {footerSettings.supportEmail && (
                  <li>
                    <a href={`mailto:${footerSettings.supportEmail}`} className={styles.link}>
                      Contact Support
                    </a>
                  </li>
                )}
                {footerSettings.privacyEmail && (
                  <li>
                    <a href={`mailto:${footerSettings.privacyEmail}`} className={styles.link}>
                      Privacy Questions
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {footerSettings.socialLinks && footerSettings.socialLinks.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Follow Us</h4>
              <ul className={styles.links}>
                {footerSettings.socialLinks.map((social, index) => (
                  <li key={index}>
                    <a 
                      href={social.url} 
                      className={styles.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.label || social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className={styles.bottom}>
          <div className={styles.copyright}>
            <p>
              &copy; {new Date().getFullYear()} {footerSettings.companyName}. All Rights Reserved | {appSettings.appName} v{footerSettings.version}
              {footerSettings.legalLinks && footerSettings.legalLinks.length > 0 && (
                <span>
                  {footerSettings.legalLinks.map((link, index) => (
                    <span key={index}>
                      {' | '}
                      {link.isExternal ? (
                        <a 
                          href={link.url} 
                          className={styles.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.title}
                        </a>
                      ) : (
                        <a href={link.url} className={styles.link}>
                          {link.title}
                        </a>
                      )}
                    </span>
                  ))}
                </span>
              )}
            </p>
          </div>
          
          {footerSettings.showSecurityBadge && (
            <div className={styles.security}>
              <div className={styles.securityBadge}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secured with HTTPS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
