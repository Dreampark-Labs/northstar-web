"use client";

import { Suspense } from 'react';
import { AssignmentModalProvider } from '@/providers/AssignmentModalProvider';

export function AssignmentModalProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <AssignmentModalProvider>
        {children}
      </AssignmentModalProvider>
    </Suspense>
  );
}
