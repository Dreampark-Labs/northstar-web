# Environment Variables Setup

This document outlines the required environment variables for the NorthStar Web application.

## Required Environment Variables

### Convex Database
```bash
CONVEX_DEPLOYMENT=your-convex-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
```

### Clerk Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key
CLERK_SECRET_KEY=sk_test_your-clerk-secret
```

### Sanity CMS
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your-sanity-read-token
```

### App Configuration
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL
```

### Sentry Error Tracking
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
```

### PostHog Analytics
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Setup Instructions

### 1. Sentry Setup
1. Create a Sentry account at https://sentry.io
2. Create a new project for your Next.js app
3. Copy the DSN from your project settings
4. Add the organization and project names to your environment variables

### 2. PostHog Setup
1. Create a PostHog account at https://posthog.com
2. Create a new project
3. Copy the project API key from your project settings
4. Use the default PostHog host or your self-hosted instance

### 3. Open Graph Configuration
The Open Graph protocol is automatically configured and will generate dynamic images at `/api/og`.

#### Image Generation URL Parameters:
- `title`: The title to display (max 100 characters)
- `description`: The description to display (max 200 characters)  
- `type`: The content type ('website', 'article', 'profile')

#### Example:
```
https://yourapp.com/api/og?title=My%20Page&description=Page%20description&type=article
```

## Development vs Production

### Development
- Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- PostHog will run in debug mode
- Sentry will show debug information

### Production
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Ensure all services are configured with production keys
- Remove debug flags for optimal performance

## Security Notes

- Never commit actual environment values to version control
- Use different keys for development and production
- Regularly rotate your API keys
- Monitor your Sentry and PostHog usage to detect anomalies
