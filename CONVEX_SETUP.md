# Convex Backend Setup Guide

This guide will walk you through setting up the Convex backend for Northstar.

## 🚀 Quick Setup

### 1. Install Convex CLI
```bash
npm install -g convex
```

### 2. Login to Convex
```bash
npx convex login
```
This will open your browser to authenticate with Convex.

### 3. Initialize Convex Project
```bash
npx convex dev --once --configure=new
```

When prompted:
- **Project name**: `northstar-web` (or your preferred name)
- **Team**: Select or create your team
- **Deploy immediately**: Yes

### 4. Set Environment Variables
After setup, copy the values from your Convex dashboard to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in these values from your Convex dashboard:
```bash
# Get these from https://dashboard.convex.dev
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Clerk setup (optional for now)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 5. Deploy Schema & Functions
```bash
npx convex deploy
```

This will deploy:
- Database schema with all tables and indexes
- User management functions
- Terms CRUD functions
- Privacy validation helpers

## 🗃️ Database Schema Overview

After deployment, you'll have these tables in Convex:

### Core Tables
- **users** - User profiles linked to Clerk
- **terms** - Academic terms/semesters
- **courses** - Individual courses within terms
- **assignments** - Assignments with due dates and grades
- **files** - File uploads with metadata

### Analytics Tables
- **activityEvents** - Non-PII activity tracking
- **retentionMetrics** - User engagement metrics

## 🔧 Development Workflow

### Start Development
```bash
# Terminal 1: Convex dev server
npx convex dev

# Terminal 2: Next.js dev server  
npm run dev
```

### Deploy Changes
```bash
npx convex deploy
```

## 📊 Verify Setup

After setup, you can verify everything is working:

1. **Check Convex Dashboard**: Visit https://dashboard.convex.dev
2. **View Tables**: You should see all tables created
3. **Test Functions**: Functions should be deployed and ready

## 🔒 Authentication Setup (Next Step)

Once Convex is working, set up Clerk authentication:

1. Create account at https://clerk.com
2. Create new application
3. Copy API keys to `.env.local`
4. Enable Google OAuth provider (optional)

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module '@/lib/convex'"**
- Ensure `lib/convex.ts` exists
- Check TypeScript path mapping in `tsconfig.json`

**"NEXT_PUBLIC_CONVEX_URL is undefined"**
- Make sure `.env.local` has the correct URL from Convex dashboard
- Restart Next.js dev server after adding env vars

**Functions not deploying**
- Run `npx convex deploy --debug` for detailed logs
- Check that all imports are correct in Convex functions

### Reset Setup
If you need to start over:
```bash
rm -rf .convex/
npx convex dev --once --configure=new
```

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Next.js Integration Guide](https://docs.convex.dev/client/react/nextjs)
- [Database Schema Best Practices](https://docs.convex.dev/database)

---

**Next Step**: After Convex is working, proceed to implement Clerk authentication and connect the dashboard to real data.