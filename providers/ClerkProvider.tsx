"use client";

import { ClerkProvider as ClerkReactProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

export function ClerkProvider({ children }: { children: ReactNode }) {
  // Temporary: Skip Clerk if no publishable key is provided
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <ClerkReactProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        baseTheme: undefined, // Will use system theme
        variables: {
          colorPrimary: 'var(--color-primary)',
          colorBackground: 'var(--color-bg)',
          colorInputBackground: 'var(--color-bg-subtle)',
          colorInputText: 'var(--color-fg)',
          colorText: 'var(--color-fg)',
          colorTextSecondary: 'var(--color-muted)',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-family)',
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: 'var(--color-primary)',
            '&:hover': {
              backgroundColor: 'var(--color-primary-hover)',
            },
          },
          card: {
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-md)',
          },
        },
      }}
    >
      {children}
    </ClerkReactProvider>
  );
}
