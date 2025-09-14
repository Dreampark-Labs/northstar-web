import * as Sentry from "@sentry/nextjs";

export function register() {
  // Only initialize Sentry if DSN is provided
  const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (sentryDsn) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      Sentry.init({
        dsn: sentryDsn,
        tracesSampleRate: 1,
        debug: false,
      });
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      Sentry.init({
        dsn: sentryDsn,
        tracesSampleRate: 1,
        debug: false,
      });
    }
  }
}

// Export hooks for Next.js instrumentation
export const onRequestError = Sentry.captureRequestError;
