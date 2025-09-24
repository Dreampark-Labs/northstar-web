"use client";

import { Suspense } from 'react';
import { AssignmentDetailsModalProvider } from '@/providers/AssignmentDetailsModalProvider';

export function AssignmentDetailsModalProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <AssignmentDetailsModalProvider>
        {children}
      </AssignmentDetailsModalProvider>
    </Suspense>
  );
}
