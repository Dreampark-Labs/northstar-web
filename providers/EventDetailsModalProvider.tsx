"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { EventDetailsModal } from '@/components/ui/EventDetailsModal';
import { type CalendarEvent } from '@/components/ui/Calendar';

interface EventDetailsModalContextType {
  isOpen: boolean;
  event: CalendarEvent | null;
  open: (event: CalendarEvent) => void;
  close: () => void;
}

const EventDetailsModalContext = createContext<EventDetailsModalContextType | undefined>(undefined);

export function EventDetailsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const searchParams = useSearchParams();

  // Monitor URL changes to close modal when event parameter is removed
  useEffect(() => {
    const eventId = searchParams.get('event');
    if (!eventId && isOpen) {
      // Close modal if no event ID in URL but modal is open
      setIsOpen(false);
      setEvent(null);
    }
  }, [searchParams, isOpen]);

  const open = useCallback((eventToShow: CalendarEvent) => {
    setEvent(eventToShow);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    // Update URL to remove event parameter
    window.history.pushState({}, '', '/calendar');
    setIsOpen(false);
    setEvent(null);
  }, []);

  const value: EventDetailsModalContextType = {
    isOpen,
    event,
    open,
    close,
  };

  return (
    <EventDetailsModalContext.Provider value={value}>
      {children}
      {isOpen && (
        <EventDetailsModal
          isOpen={isOpen}
          onClose={close}
          event={event}
        />
      )}
    </EventDetailsModalContext.Provider>
  );
}

export function useEventDetailsModal() {
  const context = useContext(EventDetailsModalContext);
  if (context === undefined) {
    throw new Error('useEventDetailsModal must be used within an EventDetailsModalProvider');
  }
  return context;
}
