import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAllTermsSlug } from '@/lib/termSlugUtils';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/debug(.*)',
]);

// Check if Clerk is properly configured
const isClerkConfigured = () => {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Handle redirects from old URL structure to new term-based URLs
  const url = req.nextUrl.clone();
  
  // Check if this is an old-style URL that needs redirecting
  const oldUrlPattern = /^\/app\/v1\/(dashboard|assignments|calendar|courses|files|grades|settings)(?:\/.*)?$/;
  const match = url.pathname.match(oldUrlPattern);
  
  if (match) {
    const page = match[1];
    const defaultTermSlug = getAllTermsSlug();
    
    // Redirect to new URL structure with default term slug
    url.pathname = `/app/v1/${defaultTermSlug}/${page}`;
    return NextResponse.redirect(url);
  }

  // Only protect routes if Clerk is properly configured
  if (isClerkConfigured() && isProtectedRoute(req)) {
    // If an external auth cookie is present, allow the request to proceed
    // to avoid bouncing the user to Clerk when they already have a valid
    // app session (e.g., during onboarding reloads).
    const externalToken = req.cookies.get('auth-token');
    if (!externalToken) {
      await auth.protect();
    }
  }

  const response = NextResponse.next();
  
  // Add security headers that can't be set in next.config.js
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  
  // Rate limiting headers (for informational purposes)
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');
  
  // Add CORS headers for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }
  
  // Secure cookie settings
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // Allow client-side access for consent management
    sameSite: 'strict' as const,
    path: '/',
  };
  
  // Set secure defaults for any cookies
  response.cookies.getAll().forEach(cookie => {
    response.cookies.set(cookie.name, cookie.value, cookieOptions);
  });
  
  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
};
