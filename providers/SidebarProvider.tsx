"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = 'northstar-sidebar-collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Initialize with null to prevent hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    } else {
      setIsCollapsed(false); // Default to expanded
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      // If still loading, use the opposite of default (false)
      const currentState = prev ?? false;
      const newState = !currentState;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  // Provide context even during loading to prevent errors
  const contextValue = {
    isCollapsed: isCollapsed ?? false, // Default to false during loading
    toggleSidebar
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div style={{ 
        visibility: isCollapsed === null ? 'hidden' : 'visible',
        transition: 'visibility 0s'
      }}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}