import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cleared successfully' 
    });

    // Clear all authentication cookies
    const cookiesToClear = [
      'auth-token',
      'auth-user-id',
      'auth-user-name', 
      'auth-user-email',
      '__session',
      '__client_uat',
      'northstar_cookie_consent'
    ];

    // Set cookies to expire in the past
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        path: '/',
        expires: new Date(0),
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
      });
    });

    return response;
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear session' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Same functionality for GET requests
  return POST(request);
}
