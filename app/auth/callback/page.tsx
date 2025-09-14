'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const redirectUrl = searchParams.get('redirect') || '/app/v1/dashboard';

        if (!token || !userId) {
          setStatus('error');
          setMessage('Missing authentication parameters');
          return;
        }

        // Store the authentication token in cookies
        document.cookie = `auth-token=${token}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=strict`;
        document.cookie = `auth-user-id=${userId}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=strict`;

        // Optional: Create or update user in your database
        try {
          const response = await fetch('/api/auth/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, token }),
          });

          if (!response.ok) {
            console.warn('Failed to sync user data, but proceeding with authentication');
          }
        } catch (error) {
          console.warn('Error syncing user data:', error);
          // Continue anyway - the token is still valid
        }

        setStatus('success');
        setMessage('Authentication successful! Redirecting...');

        // Redirect to the original destination after a short delay
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1500);

      } catch (error) {
        console.error('Authentication callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    const authPortalUrl = new URL('http://localhost:3002');
    const redirectUrl = searchParams.get('redirect') || '/app/v1/dashboard';
    authPortalUrl.searchParams.set('redirect', window.location.origin + redirectUrl);
    window.location.href = authPortalUrl.toString();
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
