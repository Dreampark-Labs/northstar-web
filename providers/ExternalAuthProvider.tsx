'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthUser {
  id: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ExternalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const part = parts.pop();
      if (part) {
        const cookieValue = part.split(';').shift();
        return cookieValue || null;
      }
    }
    return null;
  };

  const refreshAuth = () => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const token = getCookie('auth-token');
    const userId = getCookie('auth-user-id');

    if (token && userId) {
      setUser({ id: userId, token });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  const logout = () => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Clear cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth-user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    setUser(null);
    
    // Redirect to external auth portal
    const authPortalUrl = new URL('http://localhost:3002/logout');
    authPortalUrl.searchParams.set('redirect', window.location.origin);
    window.location.href = authPortalUrl.toString();
  };

  useEffect(() => {
    refreshAuth();
    
    // Only set up client-side event listeners
    if (typeof window === 'undefined') return;
    
    // Listen for storage events (in case user logs in/out in another tab)
    const handleStorageChange = () => refreshAuth();
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for cookie changes by polling (since there's no cookie change event)
    const interval = setInterval(refreshAuth, 5000); // Check every 5 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an ExternalAuthProvider');
  }
  return context;
}

// Hook for getting authenticated user data for Convex queries
export function useAuthToken(): string | null {
  const { user } = useAuth();
  return user?.token || null;
}
