"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CommandPalette } from '@/components/ui/CommandPalette/CommandPalette';
import { useSafeBodyStyle } from '@/hooks/useSafePortal';

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
  
  // Use safe body style management
  useSafeBodyStyle(isOpen, 'overflow', 'hidden', 'unset');

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    // Update URL to remove search parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('search');
      window.history.replaceState({}, '', url.toString());
    }
    setIsOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      // When toggling via keyboard shortcut, add URL parameter
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?search=true`;
        window.history.pushState({ search: true }, '', newUrl);
      }
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

  const value: CommandPaletteContextType = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <CommandPaletteHandler isOpen={isOpen} setIsOpen={setIsOpen} />
      </Suspense>
      <CommandPalette 
        isOpen={isOpen} 
        onClose={close} 
      />
    </CommandPaletteContext.Provider>
  );
}

// Separate component that handles URL search params with Suspense
function CommandPaletteHandler({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const searchParams = useSearchParams();

  // Monitor URL changes to close modal when search parameter is removed
  useEffect(() => {
    const hasSearch = searchParams.get('search') !== null;
    if (!hasSearch && isOpen) {
      // Close modal if no search parameter in URL but modal is open
      setIsOpen(false);
    }
  }, [searchParams, isOpen, setIsOpen]);

  return null;
}
