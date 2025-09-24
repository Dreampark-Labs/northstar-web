# Clerk Authentication Setup

This application now uses Clerk for authentication instead of the external auth system. Follow these steps to get authentication working:

## 1. Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Configure Environment Variables

Update your `.env.local` file with your Clerk keys:

```bash
# Get these from your Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# These are already configured
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app/v1/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app/v1/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=http://localhost:3000
```

## 3. Configure Clerk Dashboard

In your Clerk Dashboard:

1. Go to **Domains** and add `localhost:3002` as an allowed domain (for your authentication application)
2. Go to **Paths** and configure:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - Home URL: `/app/v1/dashboard`
   - After sign-out URL: `http://localhost:3000`

## 4. Application Flow

- **Main Application**: Runs on `http://localhost:3001` (or your configured port)
- **Authentication**: Handled by Clerk components at `/sign-in` and `/sign-up` 
- **Sign-in redirect**: After successful authentication, users go to `http://localhost:3002`
- **Sign-out redirect**: After signing out, users go to `http://localhost:3000`

## 5. Convex Integration

The application integrates Clerk with Convex for database operations. Make sure your Convex auth configuration in `convex/auth.config.js` is set up correctly:

```javascript
export default {
  providers: [
    {
      domain: "https://clerk.dev",
      applicationID: "convex",
    },
  ],
};
```

## 6. Development

Start your development server:

```bash
npm run dev
```

Visit:
- `http://localhost:3001` - Main application (redirects to sign-in if not authenticated)
- `http://localhost:3001/sign-in` - Sign-in page
- `http://localhost:3001/sign-up` - Sign-up page
- `http://localhost:3000` - Landing page (sign-out destination)

## Features

- ✅ Protected routes with middleware
- ✅ Sign-in/Sign-up pages with custom styling
- ✅ Integration with Convex database
- ✅ User profile data in sidebar
- ✅ Proper sign-out flow
- ✅ Responsive design with theme support

## Troubleshooting

1. **"Clerk not configured" errors**: Make sure you've added your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. **Authentication redirects not working**: Check your Clerk Dashboard domain and path configuration
3. **Convex auth errors**: Ensure your Convex deployment has the correct auth configuration
4. **Sign-out not redirecting**: Verify the `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` environment variable
