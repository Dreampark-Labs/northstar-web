/**
 * NorthStar Authentication Client SDK
 * 
 * A comprehensive client library for integrating with the NorthStar Authentication API.
 * This SDK replaces hardcoded localhost variables with dynamic configuration.
 */

// Type definitions
export interface AuthConfig {
  auth: {
    domain: string;
    url: string;
    publishableKey: string;
    jwtIssuerDomain: string;
  };
  domains: {
    auth: string;
    main: string;
    app: string;
  };
  urls: {
    landing: string;
    app: string;
    auth: string;
  };
  environment: {
    isDevelopment: boolean;
    isProduction: boolean;
  };
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastActiveAt: number;
}

export interface AuthResponse {
  isAuthenticated: boolean;
  userId: string | null;
  user: User | null;
  session: Session | null;
  timestamp: string;
}

export interface ValidationResponse {
  isValid: boolean;
  userId?: string;
  user?: User;
  error?: string;
  timestamp: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  userId?: string;
  error?: string;
  timestamp: string;
}

export interface RedirectResponse {
  redirectUrl: string;
  isAuthenticated: boolean;
  userId: string | null;
  timestamp: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  authentication: {
    isAuthenticated: boolean;
    userId: string | null;
  };
  timestamp: string;
  version: string;
  environment: string;
}

// API Endpoints
const ENDPOINTS = {
  CONFIG: '/api/northstar/config',
  AUTH_VALIDATE: '/api/northstar/auth/validate',
  AUTH_SESSION: '/api/northstar/auth/session',
  AUTH_LOGOUT: '/api/northstar/auth/logout',
  AUTH_REDIRECT: '/api/northstar/auth/redirect',
  AUTH_HEALTH: '/api/northstar/auth/health',
} as const;

export class NorthStarAuthClient {
  private baseUrl: string;
  private defaultOptions: RequestInit;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || this.getDefaultBaseUrl();
    this.defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  private getDefaultBaseUrl(): string {
    if (typeof window !== 'undefined') {
      // Client-side: use current origin for relative URLs
      return '';
    }
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://auth.dreamparklabs.com/api/northstar';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('NorthStar Auth API request failed:', error);
      throw error;
    }
  }

  /**
   * Get dynamic configuration to replace hardcoded localhost variables
   */
  async getConfig(): Promise<AuthConfig> {
    return this.request<AuthConfig>(ENDPOINTS.CONFIG);
  }

  /**
   * Validate authentication token
   */
  async validateToken(): Promise<ValidationResponse> {
    return this.request<ValidationResponse>(ENDPOINTS.AUTH_VALIDATE, {
      method: 'POST',
    });
  }

  /**
   * Get current session information
   */
  async getSession(): Promise<AuthResponse> {
    return this.request<AuthResponse>(ENDPOINTS.AUTH_SESSION);
  }

  /**
   * Logout user
   */
  async logout(): Promise<LogoutResponse> {
    return this.request<LogoutResponse>(ENDPOINTS.AUTH_LOGOUT, {
      method: 'POST',
    });
  }

  /**
   * Get redirect URL with validation
   */
  async getRedirectUrl(redirectUrl?: string): Promise<RedirectResponse> {
    const params = redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : '';
    return this.request<RedirectResponse>(`${ENDPOINTS.AUTH_REDIRECT}${params}`);
  }

  /**
   * Check authentication service health
   */
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>(ENDPOINTS.AUTH_HEALTH);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session.isAuthenticated;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const session = await this.getSession();
      return session.user;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }

  /**
   * Redirect to authentication service
   */
  redirectToAuth(redirectUrl?: string): void {
    if (typeof window === 'undefined') {
      throw new Error('redirectToAuth can only be called on the client side');
    }

    const authUrl = new URL('/api/northstar/auth/redirect', this.baseUrl);
    if (redirectUrl) {
      authUrl.searchParams.set('redirect_url', redirectUrl);
    }
    
    window.location.href = authUrl.toString();
  }

  /**
   * Redirect to main application
   */
  async redirectToApp(redirectUrl?: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('redirectToApp can only be called on the client side');
    }

    try {
      const { redirectUrl: finalUrl } = await this.getRedirectUrl(redirectUrl);
      window.location.href = finalUrl;
    } catch (error) {
      console.error('Redirect to app failed:', error);
      // Fallback to default app URL
      const config = await this.getConfig();
      window.location.href = config.urls.app;
    }
  }
}

// Default client instance
export const authClient = new NorthStarAuthClient();

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
      
      const session = await authClient.getSession();
      
      if (session.isAuthenticated) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
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
    authClient.redirectToAuth(redirectUrl);
  };

  const logout = async () => {
    try {
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
      
      const authConfig = await authClient.getConfig();
      setConfig(authConfig);
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
      
      const healthStatus = await authClient.getHealth();
      setHealth(healthStatus);
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

// Export constants for external use
export { ENDPOINTS };
