# Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SANITY_PROJECT_ID
# - NEXT_PUBLIC_SANITY_DATASET
# - NEXT_PUBLIC_APP_URL
```

### 2. Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify (drag & drop .next folder)
# Or use Netlify CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=.next
```

### 3. Custom Server
```bash
# Build
npm run build

# Start production server
npm start

# Or use PM2 for production
npm i -g pm2
pm2 start npm --name "dpl" -- start
```

## Environment Variables

Set these in your deployment platform:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_APP_URL=https://your-main-app.com
```

## Domain Setup

1. **Custom Domain**: Point your domain to deployment platform
2. **SSL**: Automatic with Vercel/Netlify
3. **CDN**: Built-in with modern platforms

## Performance Optimization

- Images are optimized automatically
- CSS is minified and tree-shaken
- JavaScript is split and lazy-loaded
- Fonts are optimized and preloaded

## Monitoring

Add these services for production:
- **Analytics**: Google Analytics, PostHog
- **Error Tracking**: Sentry, LogRocket
- **Performance**: Vercel Analytics, Core Web Vitals
- **Uptime**: Pingdom, UptimeRobot

## Pre-deployment Checklist

- [ ] Update `config/site.ts` with your branding
- [ ] Set up Sanity CMS project
- [ ] Configure environment variables
- [ ] Test all pages and components
- [ ] Verify responsive design
- [ ] Test dark/light mode
- [ ] Check accessibility
- [ ] Validate SEO meta tags
- [ ] Test contact forms and CTAs

## Post-deployment

1. **Set up analytics** tracking
2. **Configure monitoring** and alerts
3. **Set up backup** procedures
4. **Document** any customizations
5. **Plan** content updates and maintenance

