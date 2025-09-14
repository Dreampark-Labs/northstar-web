"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { TermSelectorModal } from '@/components/ui/TermSelectorModal';

interface TermSelectorModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const TermSelectorModalContext = createContext<TermSelectorModalContextType | undefined>(undefined);

export function useTermSelectorModalContext() {
  const context = useContext(TermSelectorModalContext);
  if (!context) {
    throw new Error('useTermSelectorModalContext must be used within a TermSelectorModalProvider');
  }
  return context;
}

interface TermSelectorModalProviderProps {
  children: ReactNode;
}

export function TermSelectorModalProvider({ children }: TermSelectorModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Monitor URL changes to open/close modal based on term parameter
  // This matches the AssignmentModal pattern
  useEffect(() => {
    const hasTermSelect = searchParams.get('term') === 'select';
    
    if (hasTermSelect && !isOpen) {
      // Open modal if term=select parameter in URL but modal is closed
      setIsOpen(true);
    } else if (!hasTermSelect && isOpen) {
      // Close modal if no term parameter in URL but modal is open
      setIsOpen(false);
    }
  }, [searchParams, isOpen]);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    // Update URL to remove term parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('term');
    window.history.pushState({}, '', url.toString());
    
    setIsOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      // Update URL to add term=select parameter
      const url = new URL(window.location.href);
      url.searchParams.set('term', 'select');
      window.history.pushState({ term: 'select' }, '', url.toString());
      open();
    }
  };

  const value: TermSelectorModalContextType = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <TermSelectorModalContext.Provider value={value}>
      {children}
      <TermSelectorModal isOpen={isOpen} onClose={close} />
    </TermSelectorModalContext.Provider>
  );
}
