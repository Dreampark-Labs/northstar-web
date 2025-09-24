"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function AuthRedirectPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'waiting' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Checking authentication status...');
  const [manualOptions, setManualOptions] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      // First check if we have URL parameters with auth data
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');
      const name = searchParams.get('name');
      const email = searchParams.get('email');

      if (token && userId) {
        // We have auth data, process it
        setMessage('Processing authentication data...');
        
        try {
          // Store authentication data
          document.cookie = `auth-token=${token}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=none`;
          document.cookie = `auth-user-id=${userId}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=none`;
          
          if (name) {
            document.cookie = `auth-user-name=${encodeURIComponent(name)}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=none`;
          }
          if (email) {
            document.cookie = `auth-user-email=${encodeURIComponent(email)}; path=/; max-age=86400; secure=${location.protocol === 'https:'}; samesite=none`;
          }

          setStatus('success');
          setMessage('Authentication successful! Redirecting to dashboard...');
          
          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = 'http://localhost:3002/app/v1/dashboard';
          }, 1500);
          
        } catch (error) {
          setStatus('error');
          setMessage('Failed to store authentication data.');
        }
      } else {
        // No auth data in URL, check if we came from auth service
        const referrer = document.referrer;
        if (referrer.includes('localhost:3003')) {
          setStatus('waiting');
          setMessage('Waiting for authentication data from auth service...');
          
          // Wait a bit and show manual options
          setTimeout(() => {
            setManualOptions(true);
          }, 3000);
        } else {
          setStatus('error');
          setMessage('No authentication data received. Please try logging in again.');
          setManualOptions(true);
        }
      }
    };

    handleAuth();
  }, [searchParams]);

  const handleManualCheck = () => {
    // Check if there's any auth data in cookies that might have been set
    const cookies = document.cookie;
    if (cookies.includes('auth-token')) {
      window.location.href = 'http://localhost:3002/app/v1/dashboard';
    } else {
      // Go back to auth service
      window.location.href = 'http://localhost:3003';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {status === 'checking' && (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            )}
            {status === 'waiting' && (
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            )}
            {status === 'success' && (
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-red-500" />
              </div>
            )}
          </div>
          
          <h1 className="text-xl font-semibold text-foreground">
            {status === 'checking' && 'Processing Authentication'}
            {status === 'waiting' && 'Waiting for Auth Service'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Error'}
          </h1>
          
          <p className="text-sm text-muted-foreground">
            {message}
          </p>

          {manualOptions && (
            <div className="space-y-3 mt-6">
              <p className="text-xs text-muted-foreground">
                The auth service may not have configured the callback properly.
              </p>
              <div className="space-y-2">
                <button 
                  onClick={handleManualCheck}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Check Current Session
                </button>
                <button 
                  onClick={() => window.location.href = 'http://localhost:3002'}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Return to Auth Service
                </button>
                <button 
                  onClick={() => window.location.href = '/auth/test'}
                  className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90 transition-colors"
                >
                  Debug Authentication
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
