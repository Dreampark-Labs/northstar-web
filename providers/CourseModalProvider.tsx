"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourseModal } from '@/components/ui/CourseForm';

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
    throw new Error('useCourseModalContext must be used within a CourseModalProvider');
  }
  return context;
}

interface CourseModalProviderProps {
  children: ReactNode;
}

export function CourseModalProvider({ children }: CourseModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Monitor URL changes to open/close modal when course parameter changes
  useEffect(() => {
    const hasCourse = searchParams.get('course') !== null;
    if (hasCourse && !isOpen) {
      // Open modal if course parameter in URL but modal is closed
      setIsOpen(true);
    } else if (!hasCourse && isOpen) {
      // Close modal if no course parameter in URL but modal is open
      setIsOpen(false);
    }
  }, [searchParams, isOpen]);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    // Update URL to remove course parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('course');
    window.history.pushState({}, '', url.toString());
    setIsOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      // When toggling via keyboard shortcut, add URL parameter
      const newUrl = `${window.location.pathname}?course=add`;
      window.history.pushState({ course: 'add' }, '', newUrl);
      open();
    }
  };

  // Handle global keyboard shortcut (Cmd/Ctrl + Shift + C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  const value: CourseModalContextType = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <CourseModalContext.Provider value={value}>
      {children}
      {isOpen && (
        <CourseModal 
          isOpen={isOpen} 
          onClose={close} 
        />
      )}
    </CourseModalContext.Provider>
  );
}
