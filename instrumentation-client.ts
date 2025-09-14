import posthog from "posthog-js"
import * as Sentry from "@sentry/nextjs";

// Initialize PostHog - DISABLED
// posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
//   api_host: "/ingest",
//   ui_host: "https://us.posthog.com",
//   defaults: '2025-05-24',
//   capture_exceptions: true,
//   debug: process.env.NODE_ENV === "development",
// });

// Initialize Sentry (only if DSN is provided)
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}

// Export hooks for Next.js instrumentation
// Note: captureRouterTransitionStart has been deprecated in newer Sentry versions
// For modern Sentry setups, router transitions are captured automatically