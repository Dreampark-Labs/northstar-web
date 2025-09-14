# Integration Examples

This document provides examples of how to use the newly integrated Open Graph, PostHog, and Sentry features.

## Open Graph Protocol

### Basic Page Metadata
```typescript
// app/courses/[id]/page.tsx
import { generatePageMetadata } from '@/lib/opengraph'
import { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse(params.id)
  
  return generatePageMetadata(
    course.title,
    course.description,
    `/courses/${params.id}`,
    'article'
  )
}

export default function CoursePage({ params }: Props) {
  // Your component code
}
```

### Custom Open Graph Image
```typescript
// For custom images, pass the image URL
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse(params.id)
  
  return {
    ...generateOpenGraphMetadata({
      title: course.title,
      description: course.description,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${params.id}`,
      type: 'article',
      image: course.imageUrl, // Custom image instead of generated one
    }),
    // Additional metadata...
  }
}
```

## PostHog Analytics

### Basic Event Tracking
```typescript
'use client'

import { useAnalytics } from '@/hooks/useAnalytics'

export function CourseCard({ course }) {
  const { trackButtonClick, trackFeatureUsage } = useAnalytics()
  
  const handleEnroll = () => {
    trackButtonClick('enroll_course', 'course_card')
    trackFeatureUsage('courses', 'enroll', { course_id: course.id })
    // Enrollment logic...
  }
  
  return (
    <div>
      <h3>{course.title}</h3>
      <button onClick={handleEnroll}>Enroll</button>
    </div>
  )
}
```

### Form Tracking
```typescript
'use client'

import { useAnalytics } from '@/hooks/useAnalytics'

export function AssignmentForm() {
  const { trackFormSubmission } = useAnalytics()
  
  const handleSubmit = async (data) => {
    try {
      await submitAssignment(data)
      trackFormSubmission('assignment_form', true)
    } catch (error) {
      trackFormSubmission('assignment_form', false)
      throw error
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Page View Tracking
```typescript
'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { useEffect } from 'react'

export function DashboardPage() {
  const { trackPageView } = useAnalytics()
  
  useEffect(() => {
    trackPageView('dashboard', { 
      user_type: 'student',
      courses_count: 5 
    })
  }, [trackPageView])
  
  return <div>Dashboard content</div>
}
```

## Sentry Error Tracking

### Automatic Error Boundaries
Sentry automatically captures unhandled errors, but you can create custom error boundaries:

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import { ErrorBoundary } from '@sentry/nextjs'

export function CourseSection({ children }) {
  return (
    <ErrorBoundary 
      fallback={({ error, resetError }) => (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
      beforeCapture={(scope) => {
        scope.setTag('section', 'courses')
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

### Manual Error Reporting
```typescript
import * as Sentry from '@sentry/nextjs'
import { useAnalytics } from '@/hooks/useAnalytics'

export function useErrorHandler() {
  const { trackError } = useAnalytics()
  
  const handleError = (error: Error, context?: Record<string, any>) => {
    // Report to Sentry with additional context
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value)
        })
      }
      Sentry.captureException(error)
    })
    
    // Also track in PostHog for analytics
    trackError(error, context)
  }
  
  return { handleError }
}
```

### User Context for Better Debugging
```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export function SentryUserContext() {
  const { user } = useUser()
  
  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        username: user.fullName,
      })
    }
  }, [user])
  
  return null
}
```

## API Route Examples

### API Route with Error Tracking
```typescript
// app/api/courses/route.ts
import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const courses = await getCourses()
    return NextResponse.json(courses)
  } catch (error) {
    // Capture the error with request context
    Sentry.withScope((scope) => {
      scope.setTag('api_route', 'courses')
      scope.setContext('request', {
        url: request.url,
        method: request.method,
      })
      Sentry.captureException(error)
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
```

### API Route with Analytics
```typescript
// app/api/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const assignment = await createAssignment(data)
    
    // Server-side analytics (if needed)
    // Note: PostHog is primarily client-side, but you can use their server SDK
    
    return NextResponse.json(assignment)
  } catch (error) {
    // Error handling...
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}
```

## Best Practices

### 1. Error Handling
- Always wrap async operations in try-catch blocks
- Provide meaningful context when reporting errors
- Use error boundaries for React components
- Don't expose sensitive information in error messages

### 2. Analytics
- Track user actions, not just page views
- Include relevant context in events
- Be mindful of user privacy
- Use consistent event naming conventions

### 3. Open Graph
- Always provide fallback values for title and description
- Keep titles under 60 characters for best display
- Keep descriptions under 160 characters
- Test your Open Graph images across different platforms

### 4. Performance
- PostHog loads asynchronously and won't block your app
- Sentry has minimal performance impact
- Open Graph images are generated on-demand and cached
