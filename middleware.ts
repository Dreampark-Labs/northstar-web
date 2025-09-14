import { NextRequest, NextResponse } from 'next/server';
import { getAllTermsSlug } from '@/lib/termSlugUtils';

export default function middleware(req: NextRequest) {
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
  // Define public routes that don't require authentication
  const publicPaths = [
    '/',
    '/api/og',
    '/api/logos',
    '/cookies',
    '/privacy',
    '/studio',
    '/auth/callback', // Add callback route for external auth
  ];

  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path + '/')
  );

  // Check for authentication token in cookies or headers
  const authToken = req.cookies.get('auth-token')?.value || 
                   req.headers.get('authorization')?.replace('Bearer ', '');

  // If accessing a protected route without authentication, redirect to external auth portal
  // Temporarily disabled for development - external auth server not running
  // if (!isPublicPath && !authToken) {
  //   const authPortalUrl = new URL('http://localhost:3002');
  //   authPortalUrl.searchParams.set('redirect', req.nextUrl.href);
  //   return NextResponse.redirect(authPortalUrl);
  // }

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
}

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
