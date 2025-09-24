'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthConfig } from '@/lib/northstar-auth-client-hooks';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function AuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getAppUrl, getAuthUrl } = useAuthConfig();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Clear any existing fake auth data first
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
        document.cookie = 'auth-user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
        document.cookie = 'auth-user-name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
        document.cookie = 'auth-user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';

        // Get dynamic app URL
        const appUrl = await getAppUrl();
        const redirectUrl = searchParams.get('redirect') || `${appUrl}/app/v1/dashboard`;

        // Helper function to get cookies with debugging
        const getCookie = (name: string) => {
          if (typeof document === 'undefined') return null;
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          console.log(`Looking for cookie '${name}':`, parts.length > 1 ? 'Found' : 'Not found');
          if (parts.length === 2) {
            const part = parts.pop();
            if (part) {
              const cookieValue = part.split(';').shift() || null;
              console.log(`Cookie '${name}' value:`, cookieValue);
              return cookieValue;
            }
          }
          return null;
        };

        // Log all cookies for debugging
        console.log('All cookies:', document.cookie);

        // Primary Method: Check for authentication data from URL parameters (Solution 1)
        let token = searchParams.get('token');
        let userId = searchParams.get('userId');
        let name = searchParams.get('name');
        let email = searchParams.get('email');

        console.log('URL Parameters:', { token, userId, name, email });

        if (token && userId) {
          // Primary method succeeded - we have URL parameters
          setMessage('Processing authentication from URL parameters...');
          
          // Store the authentication data in cookies
          document.cookie = `auth-token=${token}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=lax`;
          document.cookie = `auth-user-id=${userId}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=lax`;
          
          // Set user display information if available
          if (name) {
            document.cookie = `auth-user-name=${encodeURIComponent(name)}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=lax`;
          }
          if (email) {
            document.cookie = `auth-user-email=${encodeURIComponent(email)}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=lax`;
          }

          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1500);
          return;
        }

        // Check if this is a dpl-auth success callback without URL parameters
        const authSuccess = searchParams.get('auth_success');
        console.log('Auth success parameter:', authSuccess);

        if (authSuccess === 'true') {
          // Fallback Method: Check for authentication cookies (Solution 2)
          setMessage('Checking for authentication cookies...');
          console.log('Trying fallback method: checking cookies');
          
          token = getCookie('auth-token');
          userId = getCookie('auth-user-id');
          name = getCookie('auth-user-name');
          email = getCookie('auth-user-email');

          console.log('Cookies found:', { token, userId, name, email });

          if (token && userId) {
            console.log('Authentication successful via cookies!');
            // Fallback method succeeded - cookies were already set by dpl-auth
            setStatus('success');
            setMessage('Authentication successful via cookies! Redirecting...');
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 1500);
            return;
          } else {
            console.log('No valid auth cookies found');
            // Skip API method for now since dpl-auth doesn't have the expected endpoint
            console.log('Skipping API method - dpl-auth token endpoint not available');
          }
          
          // Last resort: Try to fetch auth data from dpl-auth service (currently disabled)
          /*
          setMessage('Attempting to retrieve authentication from dpl-auth service...');
          try {
            const response = await fetch('/api/auth/dpl-token', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
              }
            });

            if (response.ok) {
              const authData = await response.json();
              if (authData.token && authData.userId) {
                // Use the auth data from dpl-auth service
                token = authData.token;
                userId = authData.userId;
                name = authData.name;
                email = authData.email;
                
                setMessage('Setting up authentication from service...');

                // Store the authentication data in cookies
                document.cookie = `auth-token=${token}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=lax`;
                document.cookie = `auth-user-id=${userId}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=lax`;
                
                if (name) {
                  document.cookie = `auth-user-name=${encodeURIComponent(name)}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=lax`;
                }
                if (email) {
                  document.cookie = `auth-user-email=${encodeURIComponent(email)}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=lax`;
                }

                setStatus('success');
                setMessage('Authentication successful! Redirecting...');
                setTimeout(() => {
                  window.location.href = redirectUrl;
                }, 1500);
                return;
              }
            }
          } catch (fetchError) {
            console.warn('Could not fetch token from dpl-auth service:', fetchError);
          }
          */

          // If we get here, all fallback methods failed
          setStatus('error');
          setMessage('Authentication failed - could not retrieve authentication data. Please try logging in again.');
          return;
        }

        // No auth_success parameter and no URL token - this might be a direct access or error
        setStatus('error');
        setMessage('Authentication failed - missing authentication data. Please try logging in again.');

        // Optional: Sync user data with your backend
        try {
          const response = await fetch('/api/auth/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, token, name, email }),
          });

          if (!response.ok) {
            console.warn('Failed to sync user data, but proceeding with authentication');
          }
        } catch (error) {
          console.warn('Error syncing user data:', error);
          // Continue anyway - the token is still valid
        }

      } catch (error) {
        console.error('Authentication callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  const handleRetry = async () => {
    try {
      const authUrl = await getAuthUrl();
      const appUrl = await getAppUrl();
      const authPortalUrl = new URL(authUrl);
      const redirectUrl = searchParams.get('redirect') || `${appUrl}/app/v1/dashboard`;
      authPortalUrl.searchParams.set('redirect', redirectUrl);
      window.location.href = authPortalUrl.toString();
    } catch (error) {
      console.error('Failed to get auth URLs, using fallback:', error);
      // Fallback to hardcoded URLs
      const authPortalUrl = new URL(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3002');
      const redirectUrl = searchParams.get('redirect') || (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001') + '/app/v1/dashboard';
      authPortalUrl.searchParams.set('redirect', redirectUrl);
      window.location.href = authPortalUrl.toString();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: 'var(--color-bg)',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '400px',
        padding: '40px',
        backgroundColor: 'var(--color-bg-subtle)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
      }}>
        {status === 'processing' && (
          <>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-border)',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }} />
            <h2 style={{ marginBottom: '10px', color: 'var(--color-fg)' }}>
              Processing Authentication
            </h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: '0' }}>
              {message}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--color-success, #22c55e)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '20px',
            }}>
              ✓
            </div>
            <h2 style={{ marginBottom: '10px', color: 'var(--color-success, #22c55e)' }}>
              Authentication Successful!
            </h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: '0' }}>
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--color-error, #ef4444)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '20px',
            }}>
              ✕
            </div>
            <h2 style={{ marginBottom: '10px', color: 'var(--color-error, #ef4444)' }}>
              Authentication Failed
            </h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
              {message}
            </p>
            <button
              onClick={handleRetry}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
