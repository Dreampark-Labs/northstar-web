"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function ClearAuthPage() {
  const [status, setStatus] = useState<'clearing' | 'success' | 'error'>('clearing');
  const [message, setMessage] = useState('Clearing authentication data...');

  useEffect(() => {
    const clearAuth = async () => {
      try {
        // Call the server-side clearing API first
        try {
          await fetch('/api/auth/clear-session', { method: 'POST' });
        } catch (e) {
          console.warn('Server-side clear failed, continuing with client-side:', e);
        }

        // Clear all authentication cookies with cross-site settings
        const cookiesToClear = [
          'auth-token',
          'auth-user-id', 
          'auth-user-name',
          'auth-user-email',
          '__session',
          '__client_uat',
          '__client_uat_1HAmDCmJ',
          'northstar_cookie_consent'
        ];

        // Clear cookies for both domains
        const domains = ['localhost:3003', 'localhost:3002', 'localhost:3001', 'localhost', ''];
        
        cookiesToClear.forEach(cookieName => {
          domains.forEach(domain => {
            // Clear for current domain
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
            
            // Clear for specific domain if provided
            if (domain) {
              document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${domain}; SameSite=None; Secure`;
            }
          });
        });

        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();

        setStatus('success');
        setMessage('Authentication data cleared successfully!');
        
        // Redirect to auth service logout after a short delay
        setTimeout(() => {
          window.location.href = 'http://localhost:3003/logout?redirect=' + encodeURIComponent(window.location.origin);
        }, 1000);

      } catch (error) {
        console.error('Error clearing auth:', error);
        setStatus('error');
        setMessage('Failed to clear authentication data. Please try again.');
      }
    };

    clearAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {status === 'clearing' && (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            {status === 'clearing' && 'Signing Out'}
            {status === 'success' && 'Signed Out Successfully'}
            {status === 'error' && 'Sign Out Error'}
          </h1>
          
          <p className="text-sm text-muted-foreground">
            {message}
          </p>

          {status === 'error' && (
            <button 
              onClick={() => window.location.href = 'http://localhost:3003/logout'}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
