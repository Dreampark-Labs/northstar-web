/**
 * Dynamic Authentication Configuration Service
 * 
 * This service replaces hardcoded localhost variables with dynamic configuration
 * fetched from the authentication API. It supports both development and production environments.
 */

// Server-side implementation without React dependencies

// Type definitions (duplicated to avoid React imports)
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

export interface AuthConfigService {
  getConfig(): Promise<AuthConfig>;
  getAuthUrl(): Promise<string>;
  getAppUrl(): Promise<string>;
  getLandingUrl(): Promise<string>;
  isDevelopment(): boolean;
  isProduction(): boolean;
}

class DynamicAuthConfigService implements AuthConfigService {
  private cachedConfig: AuthConfig | null = null;
  private configPromise: Promise<AuthConfig> | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // No client initialization needed for server-side
  }

  private getAuthServiceUrl(): string {
    // In development, use localhost auth service
    if (process.env.NODE_ENV === 'development') {
      return process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3003/api/northstar';
    }
    
    // In production, use the production auth service
    return process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'https://auth.dreamparklabs.com/api/northstar';
  }

  private isConfigStale(): boolean {
    return !this.cachedConfig || (Date.now() - this.lastFetch) > this.CACHE_DURATION;
  }

  async getConfig(): Promise<AuthConfig> {
    // Return cached config if it's still fresh
    if (this.cachedConfig && !this.isConfigStale()) {
      return this.cachedConfig;
    }

    // If there's already a request in progress, wait for it
    if (this.configPromise) {
      return this.configPromise;
    }

    // Start a new request
    this.configPromise = this.fetchConfig();
    
    try {
      const config = await this.configPromise;
      this.cachedConfig = config;
      this.lastFetch = Date.now();
      return config;
    } finally {
      this.configPromise = null;
    }
  }

  private async fetchConfig(): Promise<AuthConfig> {
    try {
      // Try to fetch from auth service directly
      const authServiceUrl = this.getAuthServiceUrl();
      const response = await fetch(`${authServiceUrl}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch auth config:', error);
    }
    
    // Fallback to environment variables or defaults
    return this.getFallbackConfig();
  }

  private getFallbackConfig(): AuthConfig {
    const isDev = process.env.NODE_ENV === 'development';
    
    return {
      auth: {
        domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || (isDev ? 'localhost:3002' : 'auth.dreamparklabs.com'),
        url: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || (isDev ? 'http://localhost:3002' : 'https://auth.dreamparklabs.com'),
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
        jwtIssuerDomain: process.env.CLERK_JWT_ISSUER_DOMAIN || '',
      },
      domains: {
        auth: process.env.NEXT_PUBLIC_AUTH_DOMAIN || (isDev ? 'localhost:3002' : 'auth.dreamparklabs.com'),
        main: process.env.NEXT_PUBLIC_MAIN_DOMAIN || (isDev ? 'localhost:3000' : 'dreamparklabs.com'),
        app: process.env.NEXT_PUBLIC_APP_DOMAIN || (isDev ? 'localhost:3001' : 'ns.dplapps.com'),
      },
      urls: {
        landing: process.env.NEXT_PUBLIC_LANDING_URL || (isDev ? 'http://localhost:3000' : 'https://dreamparklabs.com'),
        app: process.env.NEXT_PUBLIC_APP_URL || (isDev ? 'http://localhost:3001' : 'https://ns.dplapps.com'),
        auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || (isDev ? 'http://localhost:3002' : 'https://auth.dreamparklabs.com'),
      },
      environment: {
        isDevelopment: isDev,
        isProduction: !isDev,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getAuthUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.urls.auth;
  }

  async getAppUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.urls.app;
  }

  async getLandingUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.urls.landing;
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  // Clear cache (useful for testing or when config changes)
  clearCache(): void {
    this.cachedConfig = null;
    this.configPromise = null;
    this.lastFetch = 0;
  }
}

// Export singleton instance
export const authConfigService = new DynamicAuthConfigService();

// Export the class for testing
export { DynamicAuthConfigService };
