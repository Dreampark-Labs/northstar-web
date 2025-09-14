"use client";

import { useSidebar } from '@/providers/SidebarProvider';
import { useNavigation } from '@/providers/NavigationProvider';
import { Sidebar } from './Sidebar/Sidebar';
import { AppSettings, FooterSettings } from '@/lib/sanity';

interface ClientAppLayoutProps {
  children: React.ReactNode;
  appSettings: AppSettings;
  footerSettings: FooterSettings;
}

export function ClientAppLayout({ children, appSettings, footerSettings }: ClientAppLayoutProps) {
  const { isCollapsed } = useSidebar();
  const { isNavigating, currentPage } = useNavigation();

  return (
    <div className="app-layout">
      <Sidebar 
        appSettings={appSettings}
        footerSettings={footerSettings}
      />
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        {isNavigating && (
          <div className="navigation-overlay">
            <div className="navigation-spinner"></div>
          </div>
        )}
        <div 
          className={`content-wrapper ${isNavigating ? 'navigating' : ''}`}
          key={currentPage} // Force re-render on page change for consistent behavior
        >
          {children}
        </div>
      </main>
    </div>
  );
}
