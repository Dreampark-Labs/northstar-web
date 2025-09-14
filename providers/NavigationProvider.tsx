"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  navigateTo: (href: string) => void;
  currentPage: string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Update current page when pathname changes
  useEffect(() => {
    setCurrentPage(pathname);
  }, [pathname]);

  // Programmatic navigation with loading state
  const navigateTo = useCallback((href: string) => {
    if (href === pathname) return; // Don't navigate to current page
    
    setIsNavigating(true);
    router.push(href);
    
    // Fallback timeout in case navigation doesn't complete
    const fallbackTimeout = setTimeout(() => {
      setIsNavigating(false);
    }, 2000);

    return () => clearTimeout(fallbackTimeout);
  }, [pathname, router]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let fallbackTimeoutId: NodeJS.Timeout;

    const handleStart = () => {
      setIsNavigating(true);
      
      // Fallback timeout to ensure loading state doesn't get stuck
      fallbackTimeoutId = setTimeout(() => {
        setIsNavigating(false);
      }, 2000);
    };

    const handleComplete = () => {
      // Clear fallback timeout
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
      }
      
      // Small delay to ensure smooth transition and prevent flashing
      timeoutId = setTimeout(() => {
        setIsNavigating(false);
      }, 120);
    };

    // Listen for click events on navigation links
    const handleLinkClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement;
      
      if (link && !link.getAttribute('href')?.startsWith('http')) {
        const href = link.getAttribute('href');
        
        // Don't show loading for same page navigation
        if (href && href !== pathname) {
          // Prevent default to control navigation timing
          event.preventDefault();
          handleStart();
          
          // Use Next.js router for smooth navigation
          setTimeout(() => {
            router.push(href);
          }, 50);
        }
      }
    };

    // Listen for browser back/forward navigation
    const handlePopState = () => {
      handleStart();
    };

    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
      }
    };
  }, [pathname, router]);

  // Reset navigation state when pathname changes (route completed)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsNavigating(false);
    }, 80);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ isNavigating, navigateTo, currentPage }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
