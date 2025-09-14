'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export function PostHogDebugComponent() {
  const posthog = usePostHog()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'disabled'>('loading')

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_POSTHOG === 'true') {
      setStatus('disabled')
      return
    }

    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      setStatus('disabled')
      return
    }

    const timer = setTimeout(() => {
      if (posthog && typeof posthog.capture === 'function') {
        setStatus('ready')
        try {
          posthog.capture('debug_component_loaded', {
            component: 'PostHogDebugComponent',
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          console.warn('PostHog capture failed:', error)
          setStatus('error')
        }
      } else {
        setStatus('error')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [posthog])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#f0f0f0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      PostHog Status: {status === 'loading' && '⏳ Loading...'}
      {status === 'ready' && '✅ Ready'}
      {status === 'error' && '❌ Error'}
      {status === 'disabled' && '🚫 Disabled'}
    </div>
  )
}
