import { Metadata } from 'next';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ConvexProvider } from '@/providers/ConvexProvider';
import { ExternalAuthProvider } from '@/providers/ExternalAuthProvider';
import { NavigationProvider } from '@/providers/NavigationProvider';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { TermSelectorProvider } from '@/providers/TermSelectorProvider';
import { CommandPaletteProvider } from '@/providers/CommandPaletteProvider';
import { CookieConsentProvider } from '@/providers/CookieConsentProvider';
// import { CSPostHogProvider } from '@/providers/PostHogProvider';
import { CourseModalProvider } from '@/providers/CourseModalProvider';
import { AssignmentModalProvider } from '@/providers/AssignmentModalProvider';
import { AssignmentDetailsModalProvider } from '@/providers/AssignmentDetailsModalProvider';
import { AddEventModalProvider } from '@/providers/AddEventModalProvider';
import { EventDetailsModalProvider } from '@/providers/EventDetailsModalProvider';
import { ScheduleModalProvider } from '@/providers/ScheduleModalProvider';
import { TermSelectorModalProvider } from '@/providers/TermSelectorModalProvider';
import { ServerAppLayout } from '@/components/layout/ServerAppLayout';
import { ConvexErrorBoundary } from '@/components/ErrorBoundary';
import { ConvexDebugComponent } from '@/components/ConvexDebugComponent';
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
          <ExternalAuthProvider>
            <ConvexProvider>
              <ConvexErrorBoundary>
                {/* <CSPostHogProvider> */}
                  <CookieConsentProvider>
                    <NavigationProvider>
                      <SidebarProvider>
                        <TermSelectorProvider>
                          <CourseModalProvider>
                            <AssignmentModalProvider>
                              <AssignmentDetailsModalProvider>
                                <AddEventModalProvider>
                                  <EventDetailsModalProvider>
                                    <ScheduleModalProvider>
                                      <TermSelectorModalProvider>
                                        <CommandPaletteProvider>
                                        <ServerAppLayout>
                                          {children}
                                          <ConvexDebugComponent />
                                          {/* <PostHogDebugComponent /> */}
                                        </ServerAppLayout>
                                      </CommandPaletteProvider>
                                    </TermSelectorModalProvider>
                                  </ScheduleModalProvider>
                                </EventDetailsModalProvider>
                              </AddEventModalProvider>
                            </AssignmentDetailsModalProvider>
                          </AssignmentModalProvider>
                        </CourseModalProvider>
                      </TermSelectorProvider>
                    </SidebarProvider>
                  </NavigationProvider>
                </CookieConsentProvider>
              {/* </CSPostHogProvider> */}
              </ConvexErrorBoundary>
            </ConvexProvider>
          </ExternalAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
