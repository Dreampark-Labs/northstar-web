'use client';

/**
 * NorthStar Authentication Client React Hooks
 * 
 * Client-side React hooks for the NorthStar Authentication API.
 * This file contains React hooks that can only be used in client components.
 */

import { useState, useEffect } from 'react';
import { 
  NorthStarAuthClient, 
  AuthConfig, 
  User, 
  Session, 
  AuthResponse, 
  ValidationResponse, 
  LogoutResponse, 
  RedirectResponse, 
  HealthResponse 
} from './northstar-auth-client';

// React hooks for easy integration
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct auth service URL
      const authServiceUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3003/api/northstar'
        : 'https://auth.dreamparklabs.com/api/northstar';
      
      const response = await fetch(`${authServiceUrl}/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const session = await response.json();
        
        if (session.isAuthenticated) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        throw new Error(`Failed to fetch session: ${response.status}`);
      }
    } catch (err) {
      console.error('Auth status check failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication check failed');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (redirectUrl?: string) => {
    const authClient = new NorthStarAuthClient();
    authClient.redirectToAuth(redirectUrl);
  };

  const logout = async () => {
    try {
      const authClient = new NorthStarAuthClient();
      await authClient.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const redirectToApp = async (redirectUrl?: string) => {
    try {
      const authClient = new NorthStarAuthClient();
      await authClient.redirectToApp(redirectUrl);
    } catch (err) {
      console.error('Redirect to app failed:', err);
      setError(err instanceof Error ? err.message : 'Redirect failed');
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    redirectToApp,
    refresh: checkAuthStatus,
  };
}

// Configuration hook
export function useAuthConfig() {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct auth service URL
      const authServiceUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3003/api/northstar'
        : 'https://auth.dreamparklabs.com/api/northstar';
      
      const response = await fetch(`${authServiceUrl}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const authConfig = await response.json();
        setConfig(authConfig);
      } else {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }
    } catch (err) {
      console.error('Config load failed:', err);
      setError(err instanceof Error ? err.message : 'Configuration load failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    refresh: loadConfig,
  };
}

// Health check hook
export function useAuthHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct auth service URL
      const authServiceUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3003/api/northstar'
        : 'https://auth.dreamparklabs.com/api/northstar';
      
      const response = await fetch(`${authServiceUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const healthStatus = await response.json();
        setHealth(healthStatus);
      } else {
        throw new Error(`Failed to fetch health: ${response.status}`);
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    health,
    loading,
    error,
    refresh: checkHealth,
  };
}
