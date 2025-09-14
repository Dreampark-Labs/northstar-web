"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/providers/SidebarProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useTermSelector } from '@/providers/TermSelectorProvider';
import { Logo } from '@/components/ui/Logo/Logo';
import { SearchBar } from '../SearchBar/SearchBar';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown/ProfileDropdown';
import { useAppSettings, useFooterSettings } from '@/hooks/useAppSettings';
import { AppSettings, FooterSettings } from '@/lib/sanity';
import { LogOut, Wrench } from 'lucide-react';
import { 
  BarChart3, 
  FileText, 
  Calendar, 
  Paperclip,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  BookOpen,
  FolderOpen,
  Trophy,
  Settings
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavigationItem {
  name: string;
  page: string; // The page name (e.g., 'dashboard', 'assignments')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', page: 'dashboard', icon: BarChart3 },
  { name: 'Assignments', page: 'assignments', icon: FileText },
  { name: 'Calendar', page: 'calendar', icon: Calendar },
  { name: 'Courses', page: 'courses', icon: BookOpen },
  { name: 'Files', page: 'files', icon: FolderOpen },
  { name: 'Grades', page: 'grades', icon: Trophy },
];

interface SidebarProps {
  appSettings?: AppSettings;
  footerSettings?: FooterSettings;
}

export function Sidebar({ appSettings: propsAppSettings, footerSettings: propsFooterSettings }: SidebarProps = {}) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { theme } = useTheme();
  const { currentSlug } = useTermSelector();
  const pathname = usePathname();
  const router = useRouter();
  const { appSettings: hookAppSettings } = useAppSettings();
  const { footerSettings: hookFooterSettings } = useFooterSettings();
  
  // Use props if provided (server-side preloaded), otherwise fall back to hooks (client-side)
  const appSettings = propsAppSettings || hookAppSettings;
  const footerSettings = propsFooterSettings || hookFooterSettings;
  
  // Note: Course terms are now handled in the Calendar page's scheduling section

  // Temporary mock user data for development
  const mockUser = {
    firstName: 'John',
    fullName: 'John Smith',
    emailAddress: 'john@example.com'
  };

  const handleSignOut = () => {
    // For development: simple redirect to landing page
    window.location.href = 'https://northstar.dreamparklabs.com';
  };

  const handleSettingsClick = () => {
    router.push('/app/v1/settings');
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.logoSection}>
          <Logo isCollapsed={isCollapsed} theme={theme} />
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={toggleSidebar}
            className={styles.collapseButton}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className={styles.expandButtonSection}>
          <button 
            onClick={toggleSidebar}
            className={styles.expandButton}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className={styles.searchSection}>
        <SearchBar isCollapsed={isCollapsed} />
      </div>

      <nav className={styles.navigation}>
        {navigationItems.map((item) => {
          const href = `/app/v1/${currentSlug}/${item.page}`;
          const isActive = pathname === href;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              href={href}
              className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              title={isCollapsed ? item.name : undefined}
              prefetch={true}
            >
              <span className={styles.navIcon}>
                <IconComponent size={18} />
              </span>
              {!isCollapsed && (
                <span className={styles.navLabel}>{item.name}</span>
              )}
            </Link>
          );
        })}

        {/* Course Terms are now handled in the Calendar page's scheduling section */}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userSection}>
          <ProfileDropdown
            trigger={
              <div className={styles.userProfile}>
                <div className={styles.avatar}>
                  <span>{mockUser.firstName[0]}</span>
                </div>
                {!isCollapsed && (
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>
                      {mockUser.fullName}
                    </div>
                    <div className={styles.userEmail}>
                      {mockUser.emailAddress}
                    </div>
                  </div>
                )}
              </div>
            }
            align={isCollapsed ? "right" : "left"}
            position="top"
            onSettingsClick={handleSettingsClick}
            onSignOutClick={handleSignOut}
          />
        </div>

        {!isCollapsed && (
          <div className={styles.footerContent}>
            <div className={styles.simplifiedFooter}>
              <p className={styles.copyrightText}>
                &copy; {new Date().getFullYear()} {footerSettings?.companyName || 'Dreampark Labs'}. All Rights Reserved | {appSettings?.appName || 'Northstar'} v{footerSettings?.version || '0.2.0'}
                {footerSettings?.legalLinks && footerSettings.legalLinks.length > 0 && (
                  <>
                    {footerSettings.legalLinks.map((link, index) => (
                      <span key={index}>
                        {' | '}
                        <a 
                          href={link.url} 
                          className={styles.legalLink}
                          target={link.isExternal ? "_blank" : "_self"}
                          rel={link.isExternal ? "noopener noreferrer" : undefined}
                        >
                          {link.title}
                        </a>
                      </span>
                    ))}
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}