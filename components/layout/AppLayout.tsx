"use client";

import { useSidebar } from '@/providers/SidebarProvider';
import { useNavigation } from '@/providers/NavigationProvider';
import { Sidebar } from './Sidebar/Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { isNavigating, currentPage } = useNavigation();

  return (
    <div className="app-layout">
      <Sidebar />
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