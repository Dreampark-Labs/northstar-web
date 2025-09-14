'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or children without error-causing component
      return this.props.fallback || this.props.children
    }

    return this.props.children
  }
}

// Specialized error boundary for PostHog
export function PostHogErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={children}
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('PostHog error boundary triggered:', error.message)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Specialized error boundary for Convex provider
export function ConvexErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h2 className="text-xl font-semibold mb-2">Service Temporarily Unavailable</h2>
            <p className="text-gray-600 mb-4">
              We're experiencing connectivity issues. This might be due to:
            </p>
            <ul className="text-sm text-gray-500 mb-6 text-left list-disc list-inside space-y-1">
              <li>Network connectivity problems</li>
              <li>Browser security settings blocking connections</li>
              <li>Temporary service interruption</li>
            </ul>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Troubleshooting
                </summary>
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  <p>• Try disabling browser extensions</p>
                  <p>• Check if you're behind a corporate firewall</p>
                  <p>• Ensure WebSocket connections are allowed</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Convex error boundary triggered:', error.message, {
            error,
            errorInfo,
            convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
