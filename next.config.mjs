/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: ['cdn.sanity.io'],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['@clerk/nextjs']
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  },

  // Webpack configuration to suppress OpenTelemetry warnings
  webpack: (config, { dev, isServer }) => {
    // Suppress critical dependency warnings from OpenTelemetry and Sentry
    config.ignoreWarnings = [
      {
        module: /node_modules\/@opentelemetry\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/@sentry/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/@prisma\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    
    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev",
              "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud wss://*.convex.site ws://localhost:* wss://localhost:* https://*.sanity.io https://*.apicdn.sanity.io https://*.clerk.accounts.dev https://clerk-telemetry.com",
              "img-src 'self' data: https: http:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "frame-src 'self'",
              "worker-src 'self' blob:",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;