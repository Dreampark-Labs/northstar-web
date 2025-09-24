"use client";

import { Suspense } from 'react';
import { AddEventModalProvider } from '@/providers/AddEventModalProvider';

export function AddEventModalProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <AddEventModalProvider>
        {children}
      </AddEventModalProvider>
    </Suspense>
  );
}
