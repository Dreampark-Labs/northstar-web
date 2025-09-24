"use client";

import { ClerkProvider as ClerkReactProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

export function ClerkProvider({ children }: { children: ReactNode }) {
  // Debug: Log Clerk configuration
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Clerk Configuration Debug:');
    console.log('- Publishable Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 
      `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET');
    console.log('- Sign In URL:', process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'NOT SET');
    console.log('- Sign Up URL:', process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || 'NOT SET');
    console.log('- After Sign In URL:', process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || 'NOT SET');
    console.log('- After Sign Up URL:', process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || 'NOT SET');
    console.log('- After Sign Out URL:', process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || 'NOT SET');
  }

  // Temporary: Skip Clerk if no publishable key is provided
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.warn('⚠️ Clerk publishable key not found, skipping Clerk initialization');
    return <>{children}</>;
  }

  return (
    <ClerkReactProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || "http://localhost:3000"}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in"}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up"}
      afterSignInUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/app/v1/dashboard"}
      afterSignUpUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/app/v1/dashboard"}
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
