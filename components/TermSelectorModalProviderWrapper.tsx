"use client";

import { Suspense } from 'react';
import { TermSelectorModalProvider } from '@/providers/TermSelectorModalProvider';

export function TermSelectorModalProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <TermSelectorModalProvider>
        {children}
      </TermSelectorModalProvider>
    </Suspense>
  );
}
