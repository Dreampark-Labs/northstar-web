"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssignmentModal } from '@/components/ui/AssignmentModal';

interface AssignmentModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const AssignmentModalContext = createContext<AssignmentModalContextType | undefined>(undefined);

export function useAssignmentModalContext() {
  const context = useContext(AssignmentModalContext);
  if (!context) {
    throw new Error('useAssignmentModalContext must be used within an AssignmentModalProvider');
  }
  return context;
}

interface AssignmentModalProviderProps {
  children: ReactNode;
}

export function AssignmentModalProvider({ children }: AssignmentModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Safely get search params - this will be null during static generation
  let searchParams: URLSearchParams | null = null;
  try {
    searchParams = useSearchParams();
  } catch (error) {
    // During static generation, useSearchParams will throw
    // We'll handle this gracefully
  }

  // Monitor URL changes to close modal when assignment parameter is removed
  // This matches the EventDetailsModal pattern
  useEffect(() => {
    if (!searchParams) return; // Skip during static generation
    
    const hasAssignment = searchParams.get('assignment') !== null;
    if (!hasAssignment && isOpen) {
      // Close modal if no assignment parameter in URL but modal is open
      setIsOpen(false);
    }
  }, [searchParams, isOpen]);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    // Update URL to remove assignment parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('assignment');
    window.history.pushState({}, '', url.toString());
    setIsOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      // When toggling via keyboard shortcut, add URL parameter
      const newUrl = `${window.location.pathname}?assignment=add`;
      window.history.pushState({ assignment: 'add' }, '', newUrl);
      open();
    }
  };

  // Handle global keyboard shortcut (Cmd/Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  const value: AssignmentModalContextType = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <AssignmentModalContext.Provider value={value}>
      {children}
      {isOpen && (
        <AssignmentModal 
          isOpen={isOpen} 
          onClose={close} 
        />
      )}
    </AssignmentModalContext.Provider>
  );
}
