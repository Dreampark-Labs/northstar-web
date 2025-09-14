"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { CommandPalette } from '@/components/ui/CommandPalette/CommandPalette';

interface CommandPaletteContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPaletteContext must be used within a CommandPaletteProvider');
  }
  return context;
}

interface CommandPaletteProviderProps {
  children: ReactNode;
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Monitor URL changes to close modal when search parameter is removed
  // This matches the EventDetailsModal pattern
  useEffect(() => {
    const hasSearch = searchParams.get('search') !== null;
    if (!hasSearch && isOpen) {
      // Close modal if no search parameter in URL but modal is open
      setIsOpen(false);
    }
  }, [searchParams, isOpen]);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    // Update URL to remove search parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('search');
    window.history.pushState({}, '', url.toString());
    setIsOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      // When toggling via keyboard shortcut, add URL parameter
      const newUrl = `${window.location.pathname}?search=true`;
      window.history.pushState({ search: true }, '', newUrl);
      open();
    }
  };

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        toggle();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [toggle]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const value: CommandPaletteContextType = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette 
        isOpen={isOpen} 
        onClose={close} 
      />
    </CommandPaletteContext.Provider>
  );
}
