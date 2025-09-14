"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { AssignmentDetailsModal } from '@/components/ui/AssignmentDetailsModal';

interface AssignmentDetailsModalContextType {
  isOpen: boolean;
  assignmentId: Id<"assignments"> | undefined;
  open: (assignmentId: Id<"assignments">) => void;
  close: () => void;
}

const AssignmentDetailsModalContext = createContext<AssignmentDetailsModalContextType | undefined>(undefined);

export function useAssignmentDetailsModalContext() {
  const context = useContext(AssignmentDetailsModalContext);
  if (context === undefined) {
    throw new Error('useAssignmentDetailsModalContext must be used within an AssignmentDetailsModalProvider');
  }
  return context;
}

interface AssignmentDetailsModalProviderProps {
  children: React.ReactNode;
}

export function AssignmentDetailsModalProvider({ children }: AssignmentDetailsModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assignmentId, setAssignmentId] = useState<Id<"assignments"> | undefined>(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL parameters for assignment details modal
  useEffect(() => {
    const assignmentParam = searchParams.get('assignment');
    
    if (assignmentParam && assignmentParam !== 'add' && assignmentParam !== 'true') {
      // If assignment parameter is a valid ID (not 'add' or 'true'), open details modal
      setAssignmentId(assignmentParam as Id<"assignments">);
      setIsOpen(true);
    } else if (!assignmentParam && isOpen) {
      // If no assignment parameter and modal is open, close it
      setIsOpen(false);
      setAssignmentId(undefined);
    }
  }, [searchParams, isOpen]);

  const open = useCallback((id: Id<"assignments">) => {
    console.log('AssignmentDetailsModalProvider - opening assignment:', id);
    setAssignmentId(id);
    setIsOpen(true);
    
    // Update URL to include assignment parameter
    const newUrl = `${window.location.pathname}?assignment=${id}`;
    console.log('AssignmentDetailsModalProvider - updating URL to:', newUrl);
    window.history.pushState({ assignment: id }, '', newUrl);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setAssignmentId(undefined);
    
    // Remove assignment parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('assignment');
    const newUrl = url.pathname + (url.search ? url.search : '');
    window.history.pushState({}, '', newUrl);
  }, []);

  const contextValue: AssignmentDetailsModalContextType = {
    isOpen,
    assignmentId,
    open,
    close,
  };

  return (
    <AssignmentDetailsModalContext.Provider value={contextValue}>
      {children}
      {/* Debug indicator */}
      {isOpen && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'red', 
          color: 'white', 
          padding: '4px 8px', 
          zIndex: 9999,
          fontSize: '12px'
        }}>
          Modal Open: {assignmentId}
        </div>
      )}
      {isOpen && (
        <AssignmentDetailsModal 
          isOpen={isOpen} 
          onClose={close}
          assignmentId={assignmentId}
        />
      )}
    </AssignmentDetailsModalContext.Provider>
  );
}
