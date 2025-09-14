'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { PostHogErrorBoundary } from '@/components/ErrorBoundary'

// Simulated user for development/testing
const SIMULATED_USER_ID = 'jx79p1dnxktht7knz8vhp9cp4h7qdesh'

// Track PostHog initialization state
let posthogInitialized = false
let posthogInitError = false
let posthogInstance: typeof posthog | null = null

// Initialize PostHog only if we have a valid key and are in browser
function initializePostHog() {
  if (typeof window === 'undefined' || posthogInitialized || posthogInitError) {
    return posthogInstance
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
  
  if (!posthogKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog key not found. Analytics will be disabled.')
    }
    return null
  }

  try {
    // Safer initialization with better error handling
    posthog.init(posthogKey, {
      api_host: posthogHost || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      // Disable potentially problematic features
      disable_session_recording: true,
      disable_surveys: true,
      // Conservative autocapture settings
      autocapture: {
        // Disable autocapture of sensitive elements
        css_selector_allowlist: [
          'button',
          '[role="button"]',
          'a',
          'input[type="submit"]',
          'input[type="button"]'
        ]
      },
      capture_pageview: true,
      persistence: 'localStorage',
      // Better error handling
      loaded: (ph) => {
        posthogInitialized = true
        posthogInstance = ph
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog initialized successfully')
        }
      },
      // Handle script loading errors gracefully
      on_xhr_error: (failedRequest) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('PostHog XHR error (non-critical):', failedRequest?.status || 'unknown')
        }
        // Don't set error state for XHR errors as they're often non-critical
      },
      // More robust configuration
      respect_dnt: true,
      opt_out_capturing_by_default: false
    })

    posthogInstance = posthog
    return posthogInstance
  } catch (error) {
    posthogInitError = true
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog initialization failed:', error)
    }
    return null
  }
}

function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize PostHog when component mounts
    const instance = initializePostHog()
    
    // Wait a bit for initialization then identify user
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && instance && !posthogInitError) {
        try {
          // Check if PostHog is available and ready
          if (instance && typeof instance.identify === 'function') {
            instance.identify(SIMULATED_USER_ID, {
              userId: SIMULATED_USER_ID,
              userType: 'simulated',
            })
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('PostHog identification failed:', error)
          }
        }
      }
      setIsInitialized(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return <>{children}</>
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  const [providerReady, setProviderReady] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Ensure we're mounted on client side
    setIsMounted(true)
    
    // In development, you can disable PostHog to avoid errors
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') {
      setProviderReady(true)
      return
    }
    
    // Initialize PostHog when provider mounts
    const instance = initializePostHog()
    
    // Give some time for initialization
    const timer = setTimeout(() => {
      setProviderReady(true)
    }, 1500) // Reduced timeout

    return () => clearTimeout(timer)
  }, [])

  // Don't render anything during SSR
  if (!isMounted) {
    return <>{children}</>
  }

  // If PostHog is disabled in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') {
    return <>{children}</>
  }

  // If PostHog key is not provided, just return children without PostHog provider
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog key not found. Analytics will be disabled.')
    }
    return <>{children}</>
  }

  // If initialization failed, fallback to rendering children without PostHog
  if (posthogInitError) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog initialization failed. Analytics will be disabled.')
    }
    return <>{children}</>
  }

  // If not ready yet, render children without PostHog wrapper (temporary)
  if (!providerReady || !posthogInstance) {
    return <>{children}</>
  }

  // Wrap PostHog provider with error boundary
  try {
    return (
      <PostHogErrorBoundary>
        <PostHogProvider client={posthogInstance}>
          <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
        </PostHogProvider>
      </PostHogErrorBoundary>
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog provider failed to render:', error)
    }
    // Fallback to rendering children without PostHog
    return <>{children}</>
  }
}
