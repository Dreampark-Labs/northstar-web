# NorthStar Web - Production Deployment Guide

## 🚀 Overview

This guide covers the complete production deployment process for the NorthStar Web application, including authentication integration with the DPL Auth Service.

## 📋 Prerequisites

### Required Accounts & Services
- [ ] GitHub account with repository access
- [ ] Vercel account (recommended for Next.js deployment)
- [ ] Clerk account with production keys
- [ ] Convex account with production deployment
- [ ] PostHog account (for analytics)
- [ ] Sanity account (for CMS)
- [ ] Domain registrar with DNS access

### Required Credentials
- [ ] Production Clerk publishable key (`pk_live_...`)
- [ ] Production Clerk secret key (`sk_live_...`)
- [ ] Production Convex deployment URL
- [ ] Production Convex deploy key
- [ ] Production PostHog key
- [ ] Production Sanity project ID
- [ ] Domain SSL certificates

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Landing Page  │    │  NorthStar Web  │    │   DPL Auth      │
│ dreamparklabs.com│    │  ns.dplapps.com │    │auth.dreamparklabs│
│    (Port 3000)  │    │   (Port 3001)   │    │   (Port 3002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Convex DB     │
                    │   PostHog       │
                    │   Sanity CMS    │
                    └─────────────────┘
```

## 🔧 Pre-Deployment Setup

### 1. Environment Configuration

#### Copy Production Environment Template
```bash
cp env.production.example .env.local
```

#### Update Environment Variables
Edit `.env.local` with your production values:

```env
# Authentication Service
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.dreamparklabs.com

# Domains
NEXT_PUBLIC_AUTH_DOMAIN=auth.dreamparklabs.com
NEXT_PUBLIC_MAIN_DOMAIN=dreamparklabs.com
NEXT_PUBLIC_APP_DOMAIN=ns.dplapps.com

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
CLERK_SECRET_KEY=sk_live_YOUR_SECRET
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-key

# Other Services
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_KEY
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
```

### 2. Clerk Production Setup

#### Create Production Clerk Application
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application for production
3. Configure domains:
   - `ns.dplapps.com` (NorthStar Web)
   - `auth.dreamparklabs.com` (Auth Service)
   - `dreamparklabs.com` (Landing Page)

#### Configure Webhooks
Set up webhooks for the auth service:
- **Endpoint**: `https://auth.dreamparklabs.com/api/webhooks/clerk`
- **Events**: `user.created`, `user.updated`, `user.deleted`

#### Update JWT Template
1. Go to JWT Templates in Clerk Dashboard
2. Create/update template named "convex"
3. Set issuer domain: `https://your-domain.clerk.accounts.dev`

### 3. Convex Production Setup

#### Deploy to Production
```bash
npx convex dev --prod
```

#### Update Environment Variables
```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-domain.clerk.accounts.dev
```

### 4. Domain Configuration

#### DNS Records
Configure the following DNS records:

```
Type    Name                    Value
A       ns.dplapps.com          YOUR_VERCEL_IP
A       auth.dreamparklabs.com  YOUR_AUTH_SERVICE_IP
CNAME   www.dreamparklabs.com   dreamparklabs.com
```

#### SSL Certificates
- Vercel automatically handles SSL for `*.vercel.app` domains
- For custom domains, ensure SSL certificates are configured
- Use Let's Encrypt or your SSL provider

## 🚀 Deployment Process

### 1. NorthStar Web Deployment (Vercel)

#### Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Environment Variables
Add all environment variables from your `.env.local` to Vercel:

1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate environment (Production, Preview, Development)
3. Ensure sensitive variables are marked as "Encrypted"

#### Custom Domain
1. Go to Project Settings → Domains
2. Add `ns.dplapps.com`
3. Configure DNS as instructed by Vercel

### 2. DPL Auth Service Deployment

#### Deploy to Vercel
1. Create new Vercel project for auth service
2. Connect GitHub repository
3. Configure environment variables
4. Set custom domain: `auth.dreamparklabs.com`

#### Update CORS Configuration
Ensure CORS is configured for production domains:
```javascript
const allowedOrigins = [
  'https://dreamparklabs.com',
  'https://ns.dplapps.com',
  'https://auth.dreamparklabs.com',
];
```

### 3. Landing Page Deployment

#### Deploy Landing Page
1. Deploy landing page to `dreamparklabs.com`
2. Ensure it redirects to auth service for authentication
3. Configure proper redirect URLs

## 🔍 Post-Deployment Verification

### 1. Authentication Flow Testing

#### Test Complete Flow
1. Visit `https://dreamparklabs.com/northstar`
2. Click "Sign In" → should redirect to auth service
3. Complete authentication → should redirect back to NorthStar Web
4. Verify user session is maintained

#### Test Direct Access
1. Visit `https://ns.dplapps.com` directly
2. Should redirect to auth service if not authenticated
3. After authentication, should redirect back to app

### 2. API Integration Testing

#### Test Configuration API
```bash
curl https://auth.dreamparklabs.com/api/northstar/config
```

Expected response:
```json
{
  "auth": {
    "domain": "auth.dreamparklabs.com",
    "url": "https://auth.dreamparklabs.com"
  },
  "domains": {
    "auth": "auth.dreamparklabs.com",
    "main": "dreamparklabs.com",
    "app": "ns.dplapps.com"
  },
  "urls": {
    "landing": "https://dreamparklabs.com/northstar",
    "app": "https://ns.dplapps.com",
    "auth": "https://auth.dreamparklabs.com"
  }
}
```

#### Test Health Endpoints
```bash
curl https://auth.dreamparklabs.com/api/northstar/health
curl https://ns.dplapps.com/api/health
```

### 3. Performance Testing

#### Lighthouse Audit
1. Run Lighthouse audit on production URLs
2. Ensure Performance score > 90
3. Ensure Accessibility score > 95
4. Ensure Best Practices score > 90

#### Load Testing
- Test with multiple concurrent users
- Verify authentication doesn't break under load
- Check database performance

## 🛠️ Troubleshooting

### Common Issues

#### 1. Authentication Redirects Not Working
**Symptoms**: Users stuck in redirect loops
**Solutions**:
- Check CORS configuration
- Verify domain configuration in Clerk
- Check environment variables are set correctly

#### 2. API Calls Failing
**Symptoms**: 404 or CORS errors on API calls
**Solutions**:
- Verify API routes are deployed
- Check environment variables
- Verify network connectivity

#### 3. Environment Variables Not Loading
**Symptoms**: App using fallback values
**Solutions**:
- Check variable names (must start with `NEXT_PUBLIC_` for client-side)
- Verify deployment environment
- Check for typos in variable names

### Debug Commands

#### Check Environment Variables
```bash
# In Vercel dashboard or CLI
vercel env ls
```

#### Check Build Logs
```bash
# In Vercel dashboard
# Go to Deployments → Click deployment → View Function Logs
```

#### Test API Endpoints
```bash
# Test configuration
curl -v https://auth.dreamparklabs.com/api/northstar/config

# Test health
curl -v https://ns.dplapps.com/api/health
```

## 📊 Monitoring & Maintenance

### 1. Set Up Monitoring

#### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals
- Track error rates

#### PostHog Analytics
- Verify PostHog is tracking events
- Set up custom dashboards
- Monitor user behavior

#### Error Tracking
- Set up Sentry or similar service
- Monitor application errors
- Set up alerts for critical issues

### 2. Regular Maintenance

#### Weekly Tasks
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Verify authentication flow
- [ ] Check backup status

#### Monthly Tasks
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Performance optimization
- [ ] Database maintenance

## 🔒 Security Checklist

### Pre-Production
- [ ] All secrets are in environment variables
- [ ] No hardcoded credentials in code
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Webhook secrets configured
- [ ] Rate limiting enabled

### Post-Production
- [ ] SSL certificates valid
- [ ] Security headers configured
- [ ] Authentication flow tested
- [ ] Error messages don't leak information
- [ ] Logs don't contain sensitive data

## 📞 Support

### Emergency Contacts
- **Technical Issues**: [Your technical contact]
- **Domain/DNS Issues**: [Your DNS provider]
- **Vercel Issues**: [Vercel Support](https://vercel.com/help)

### Useful Links
- [Vercel Documentation](https://vercel.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🎉 Deployment Complete!

Once all steps are completed, your NorthStar Web application will be live at `https://ns.dplapps.com` with full authentication integration.

**Remember**: Always test thoroughly in a staging environment before deploying to production!
