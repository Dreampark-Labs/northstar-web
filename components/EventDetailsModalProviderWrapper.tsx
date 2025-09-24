"use client";

import { Suspense } from 'react';
import { EventDetailsModalProvider } from '@/providers/EventDetailsModalProvider';

export function EventDetailsModalProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <EventDetailsModalProvider>
        {children}
      </EventDetailsModalProvider>
    </Suspense>
  );
}
