/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
  },
};

export default nextConfig;