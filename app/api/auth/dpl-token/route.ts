import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('dpl-token API endpoint called');
    
    // For testing: return mock data first to verify the endpoint works
    return NextResponse.json({
      error: 'dpl-auth token endpoint not implemented yet',
      message: 'This endpoint exists but dpl-auth integration needs to be completed',
      timestamp: new Date().toISOString()
    }, { status: 503 });

    /* Original implementation - commented out for debugging
    // Forward the request to dpl-auth with credentials
    const response = await fetch('http://localhost:3002/api/auth/token', {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'User-Agent': request.headers.get('user-agent') || '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to retrieve token from dpl-auth' },
        { status: response.status }
      );
    }

    const authData = await response.json();
    
    // Return the auth data to the client
    return NextResponse.json(authData);
    */
  } catch (error) {
    console.error('Error communicating with dpl-auth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
