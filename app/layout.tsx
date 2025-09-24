import { Metadata } from 'next';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ConvexProvider } from '@/providers/ConvexProvider';
import OnboardingGate from '@/providers/OnboardingGate';
import { ClerkProvider } from '@/providers/ClerkProvider';
import { ExternalAuthProvider } from '@/providers/ExternalAuthProvider';
import { NavigationProvider } from '@/providers/NavigationProvider';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { TermSelectorProvider } from '@/providers/TermSelectorProvider';
import { CommandPaletteProviderWrapper } from '@/components/CommandPaletteProviderWrapper';
import { CookieConsentProvider } from '@/providers/CookieConsentProvider';
// import { CSPostHogProvider } from '@/providers/PostHogProvider';
import { CourseModalProviderWrapper } from '@/components/CourseModalProviderWrapper';
import { AssignmentModalProviderWrapper } from '@/components/AssignmentModalProviderWrapper';
import { AssignmentDetailsModalProviderWrapper } from '@/components/AssignmentDetailsModalProviderWrapper';
import { AddEventModalProviderWrapper } from '@/components/AddEventModalProviderWrapper';
import { EventDetailsModalProviderWrapper } from '@/components/EventDetailsModalProviderWrapper';
import { ScheduleModalProvider } from '@/providers/ScheduleModalProvider';
import { TermSelectorModalProviderWrapper } from '@/components/TermSelectorModalProviderWrapper';
import { ServerAppLayout } from '@/components/layout/ServerAppLayout';
import { ConvexErrorBoundary } from '@/components/ErrorBoundary';
// import { PostHogDebugComponent } from '@/components/PostHogDebugComponent';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Northstar',
    default: 'Northstar - Academic Productivity App'
  },
  description: 'Academic productivity application for managing courses, assignments, calendar, and files.',
  keywords: ['academic', 'productivity', 'student', 'courses', 'assignments', 'calendar'],
  authors: [{ name: 'Northstar Team' }],
  creator: 'Northstar',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Northstar - Academic Productivity App',
    description: 'Academic productivity application for managing courses, assignments, calendar, and files.',
    siteName: 'Northstar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Northstar - Academic Productivity App',
    description: 'Academic productivity application for managing courses, assignments, calendar, and files.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ClerkProvider>
            <ExternalAuthProvider>
              <ConvexProvider>
                <ConvexErrorBoundary>
                  {/* <CSPostHogProvider> */}
                    <CookieConsentProvider>
                      <NavigationProvider>
                        <CourseModalProviderWrapper>
                          <AssignmentModalProviderWrapper>
                            <AssignmentDetailsModalProviderWrapper>
                              <AddEventModalProviderWrapper>
                                <EventDetailsModalProviderWrapper>
                                  <ScheduleModalProvider>
                                    <CommandPaletteProviderWrapper>
                                      <SidebarProvider>
                                        <TermSelectorProvider>
                                          <TermSelectorModalProviderWrapper>
                                            <ServerAppLayout>
                                              <OnboardingGate>
                                                {children}
                                              </OnboardingGate>
                                              {/* <PostHogDebugComponent /> */}
                                            </ServerAppLayout>
                                          </TermSelectorModalProviderWrapper>
                                        </TermSelectorProvider>
                                      </SidebarProvider>
                                    </CommandPaletteProviderWrapper>
                                  </ScheduleModalProvider>
                                </EventDetailsModalProviderWrapper>
                              </AddEventModalProviderWrapper>
                            </AssignmentDetailsModalProviderWrapper>
                          </AssignmentModalProviderWrapper>
                        </CourseModalProviderWrapper>
                      </NavigationProvider>
                  </CookieConsentProvider>
                {/* </CSPostHogProvider> */}
              </ConvexErrorBoundary>
            </ConvexProvider>
          </ExternalAuthProvider>
        </ClerkProvider>
      </ThemeProvider>
    </body>
  </html>
);
}
