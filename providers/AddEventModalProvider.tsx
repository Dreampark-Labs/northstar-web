"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AddEventModal } from '@/components/ui/AddEventModal';

interface AddEventModalContextType {
  isOpen: boolean;
  open: (date?: Date, hour?: number) => void;
  close: () => void;
}

const AddEventModalContext = createContext<AddEventModalContextType | undefined>(undefined);

export function AddEventModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | undefined>();
  const [initialHour, setInitialHour] = useState<number | undefined>();
  
  // Safely get search params - this will be null during static generation
  let searchParams: URLSearchParams | null = null;
  try {
    searchParams = useSearchParams();
  } catch (error) {
    // During static generation, useSearchParams will throw
    // We'll handle this gracefully
  }

  // Monitor URL changes to close modal when addEvent parameter is removed
  // This matches the EventDetailsModal pattern
  useEffect(() => {
    if (!searchParams) return; // Skip during static generation
    
    const hasAddEvent = searchParams.get('addEvent') !== null;
    if (!hasAddEvent && isOpen) {
      // Close modal if no addEvent parameter in URL but modal is open
      setIsOpen(false);
      setInitialDate(undefined);
      setInitialHour(undefined);
    }
  }, [searchParams, isOpen]);

  const open = useCallback((date?: Date, hour?: number) => {
    setInitialDate(date);
    setInitialHour(hour);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    // Update URL to remove addEvent parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('addEvent');
    window.history.pushState({}, '', url.toString());
    setIsOpen(false);
    setInitialDate(undefined);
    setInitialHour(undefined);
  }, []);

  const value: AddEventModalContextType = {
    isOpen,
    open,
    close,
  };

  return (
    <AddEventModalContext.Provider value={value}>
      {children}
      {isOpen && (
        <AddEventModal
          isOpen={isOpen}
          onClose={close}
          initialDate={initialDate}
          initialHour={initialHour}
        />
      )}
    </AddEventModalContext.Provider>
  );
}

export function useAddEventModal() {
  const context = useContext(AddEventModalContext);
  if (context === undefined) {
    throw new Error('useAddEventModal must be used within an AddEventModalProvider');
  }
  return context;
}
