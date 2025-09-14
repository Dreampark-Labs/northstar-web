"use client";

import React, { createContext, useContext, useState } from 'react';
import { ScheduleModal } from '@/components/ui/ScheduleModal';

interface ScheduleModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ScheduleModalContext = createContext<ScheduleModalContextType | undefined>(undefined);

export function useScheduleModal() {
  const context = useContext(ScheduleModalContext);
  if (context === undefined) {
    throw new Error('useScheduleModal must be used within a ScheduleModalProvider');
  }
  return context;
}

interface ScheduleModalProviderProps {
  children: React.ReactNode;
}

export function ScheduleModalProvider({ children }: ScheduleModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const contextValue: ScheduleModalContextType = {
    isOpen,
    open,
    close,
  };

  return (
    <ScheduleModalContext.Provider value={contextValue}>
      {children}
      {isOpen && (
        <ScheduleModal 
          isOpen={isOpen} 
          onClose={close}
        />
      )}
    </ScheduleModalContext.Provider>
  );
}
