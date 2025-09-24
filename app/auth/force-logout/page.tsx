"use client";

import { useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function ForceLogoutPage() {
  const { signOut } = useClerk();
  const [status, setStatus] = useState<'clearing' | 'success' | 'error'>('clearing');
  const [message, setMessage] = useState('Signing out of all sessions...');

  useEffect(() => {
    const forceLogout = async () => {
      try {
        setMessage('Clearing Clerk session...');
        
        // Force sign out from Clerk
        await signOut({ 
          redirectUrl: 'http://localhost:3002/auth/clear-all'
        });
        
        setStatus('success');
        setMessage('Signed out successfully!');
        
      } catch (error) {
        console.error('Error during forced logout:', error);
        setStatus('error');
        setMessage('Error signing out. Redirecting to clear session...');
        
        // Fallback to manual clearing
        setTimeout(() => {
          window.location.href = '/auth/clear-all';
        }, 1000);
      }
    };

    forceLogout();
  }, [signOut]);

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
              onClick={() => window.location.href = '/auth/clear-all'}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Clear Session Manually
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
