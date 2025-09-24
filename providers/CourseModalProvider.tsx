"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import CourseModal to avoid SSR issues
const CourseModal = dynamic(() => import('@/components/ui/CourseForm').then(mod => ({ default: mod.CourseModal })), {
  ssr: false
});

interface CourseModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CourseModalContext = createContext<CourseModalContextType | undefined>(undefined);

export function useCourseModalContext() {
  const context = useContext(CourseModalContext);
  if (!context) {
    // During SSR or if provider is not available, return a default context
    console.warn('useCourseModalContext: CourseModalProvider not available, returning default context');
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      toggle: () => {}
    };
  }
  return context;
}

interface CourseModalProviderProps {
  children: ReactNode;
}

export function CourseModalProvider({ children }: CourseModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track if component is mounted to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Monitor URL changes for course parameter on client side only
  useEffect(() => {
    if (!mounted) return;

    const checkUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const hasCourse = params.get('course') !== null;
      
      if (hasCourse && !isOpen) {
        setIsOpen(true);
      } else if (!hasCourse && isOpen) {
        setIsOpen(false);
      }
    };

    // Check on mount
    checkUrlParams();

    // Listen for popstate events (browser back/forward)
    const handlePopState = () => {
      checkUrlParams();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mounted, isOpen]);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    // Update URL to remove course parameter (client-side only)
    if (mounted && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('course');
      window.history.pushState({}, '', url.toString());
    }
    setIsOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      // When toggling via keyboard shortcut, add URL parameter (client-side only)
      if (mounted && typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?course=add`;
        window.history.pushState({ course: 'add' }, '', newUrl);
      }
      open();
    }
  };

  // Handle global keyboard shortcut (Cmd/Ctrl + Shift + C)
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mounted, toggle]);

  const value: CourseModalContextType = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <CourseModalContext.Provider value={value}>
      {children}
      {mounted && isOpen && (
        <CourseModal 
          isOpen={isOpen} 
          onClose={close} 
        />
      )}
    </CourseModalContext.Provider>
  );
}
