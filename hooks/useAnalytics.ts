'use client'

import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
}

export function useAnalytics() {
  const posthog = usePostHog()

  const track = useCallback((event: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(event, properties)
    }
  }, [posthog])

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.identify(userId, properties)
    }
  }, [posthog])

  const reset = useCallback(() => {
    if (posthog) {
      posthog.reset()
    }
  }, [posthog])

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    if (posthog) {
      posthog.setPersonProperties(properties)
    }
  }, [posthog])

  // Common event tracking functions
  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    track('page_view', { page, ...properties })
  }, [track])

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    track('button_click', { button_name: buttonName, location })
  }, [track])

  const trackFormSubmission = useCallback((formName: string, success: boolean = true) => {
    track('form_submission', { form_name: formName, success })
  }, [track])

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    track('error', { 
      error_message: error.message, 
      error_stack: error.stack,
      ...context 
    })
  }, [track])

  const trackFeatureUsage = useCallback((feature: string, action: string, properties?: Record<string, any>) => {
    track('feature_usage', { feature, action, ...properties })
  }, [track])

  return {
    track,
    identify,
    reset,
    setUserProperties,
    // Convenience methods
    trackPageView,
    trackButtonClick,
    trackFormSubmission,
    trackError,
    trackFeatureUsage,
    // Direct access to PostHog instance
    posthog,
  }
}
