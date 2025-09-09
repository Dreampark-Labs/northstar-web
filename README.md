# Northstar - Academic Productivity App

A single-user, student-facing productivity application for planning academic terms, tracking courses & assignments, managing files, and viewing productivity insights.

## 🚀 Current Status

The project foundation has been implemented with:

### ✅ Completed
- **Project Setup**: Next.js 15 with TypeScript, CSS Modules, and proper folder structure
- **Design System**: Custom CSS design tokens with light/dark theme support (no Tailwind)
- **Core UI Components**: Button, Card, and reusable component architecture
- **Database Schema**: Production-ready Convex schema with optimized indexes, search fields, and activity tracking
- **Basic Dashboard**: Clean layout with sidebar and main content area
- **Privacy Features**: Enhanced PII validation helpers for protecting sensitive data
- **Soft Delete System**: Proper soft delete with 30-day purge and 7-day undo window
- **Development Environment**: Hot reloading, TypeScript config, and build tools

### 🚧 In Progress / Next Steps
- **Authentication**: Clerk integration for user management
- **CRUD Operations**: Full create/read/update/delete for all entities
- **File Management**: Upload system with metadata tracking
- **Search**: Global search across all content
- **Dashboard Modules**: "This Week", "Due Soon", "Grades Overview", "Quick Files"
- **Testing**: Unit tests with Vitest and E2E tests with Playwright

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, CSS Modules
- **Database**: Convex (real-time database & serverless functions)
- **Authentication**: Clerk (when implemented)
- **Styling**: CSS Modules with design tokens (Apple/Notion-inspired)
- **UI Components**: Custom components + Radix UI primitives
- **Testing**: Vitest (unit) + Playwright (E2E)

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:3001 to see the current dashboard.

## 📁 Project Structure

```
northstar-web/
├── app/                     # Next.js App Router pages
├── components/              # Reusable UI components
│   ├── ui/                 # Basic primitives (Button, Card, etc.)
│   ├── layout/             # Layout components
│   ├── dashboard/          # Dashboard modules
│   └── forms/              # Form components
├── convex/                 # Database schema and functions
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and helpers
├── styles/                 # Design tokens and global styles
├── tests/                  # Unit and E2E tests
└── scripts/                # Build and utility scripts
```

## 🎨 Design Philosophy

- **Apple/Notion-inspired**: Clean, minimal design with generous whitespace
- **Accessibility-first**: Proper focus rings, semantic HTML, keyboard navigation
- **CSS Modules**: Component-scoped styles with design tokens
- **No Tailwind**: Custom CSS approach for better maintainability
- **Dark/Light themes**: Full theme switching support

## 📝 Planned Features (MVP)

### Core Functionality
- [x] Dashboard with key metrics
- [ ] Academic term management
- [ ] Course tracking with credits and instructors
- [ ] Assignment tracking with due dates and grades
- [ ] File upload and organization
- [ ] Global search across all content

### User Experience
- [ ] Keyboard shortcuts (/, g+d, g+c, etc.)
- [ ] Optimistic UI updates
- [ ] Real-time sync with Convex
- [ ] Mobile-responsive design

### Data Management
- [ ] Soft delete with undo (7 days)
- [ ] Data export (JSON/CSV)
- [ ] Privacy protection (PII detection)
- [ ] Bulk operations

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

### Environment Setup
Copy `.env.example` to `.env.local` and configure:
```bash
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 🧪 Testing Strategy

- **Unit Tests**: Component logic and utilities with Vitest
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Critical user flows with Playwright

## 🚀 Deployment

Ready for deployment to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- Any Node.js hosting platform

## 📄 License

MIT License

---

**Current Development Server**: http://localhost:3001  
**Built with**: Next.js 15, TypeScript, Convex, CSS Modules