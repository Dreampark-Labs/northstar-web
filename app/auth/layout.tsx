import { Metadata } from 'next';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ConvexProvider } from '@/providers/ConvexProvider';
import { ClerkProvider } from '@/providers/ClerkProvider';
import { ExternalAuthProvider } from '@/providers/ExternalAuthProvider';
import { ConvexErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/global.css';

// Force dynamic rendering for all auth pages
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Auth - Northstar',
  description: 'Authentication pages for Northstar application',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ClerkProvider>
        <ExternalAuthProvider>
          <ConvexProvider>
            <ConvexErrorBoundary>
              {children}
            </ConvexErrorBoundary>
          </ConvexProvider>
        </ExternalAuthProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
