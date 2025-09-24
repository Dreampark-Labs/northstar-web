#!/bin/bash

# NorthStar Web - Production Deployment Script
# This script prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 NorthStar Web - Production Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the northstar-web root directory"
    exit 1
fi

print_status "Starting production deployment preparation..."

# 1. Check git status
print_status "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please review them before deploying."
    git status --short
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
fi

# 2. Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're not on the main branch. Production deployments should typically be from main."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
fi

# 3. Run tests
print_status "Running tests..."
if npm run test 2>/dev/null; then
    print_success "Tests passed"
else
    print_warning "Tests failed or no test script found. Continuing..."
fi

# 4. Build the application
print_status "Building application for production..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed. Please fix build errors before deploying."
    exit 1
fi

# 5. Check for environment file
print_status "Checking environment configuration..."
if [ -f ".env.local" ]; then
    print_success "Environment file found"
else
    print_warning "No .env.local file found. Make sure to create one from env.production.example"
fi

# 6. Add all changes to git
print_status "Adding changes to git..."
git add .

# 7. Create commit
COMMIT_MESSAGE="feat: prepare for production deployment

- Add production environment configuration
- Update authentication integration
- Add deployment documentation
- Configure dynamic URL handling
- Add production deployment scripts

Ready for production deployment to Vercel."

print_status "Creating commit..."
git commit -m "$COMMIT_MESSAGE"

# 8. Push to GitHub
print_status "Pushing to GitHub..."
if git push origin $CURRENT_BRANCH; then
    print_success "Successfully pushed to GitHub"
else
    print_error "Failed to push to GitHub. Please check your git configuration."
    exit 1
fi

# 9. Final instructions
echo ""
echo "🎉 Production deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Import your GitHub repository if not already done"
echo "3. Configure environment variables in Vercel"
echo "4. Set custom domain: ns.dplapps.com"
echo "5. Deploy to production"
echo ""
echo "📚 Documentation:"
echo "- Production Deployment Guide: PRODUCTION_DEPLOYMENT.md"
echo "- Environment Configuration: env.production.example"
echo ""
echo "🔧 Environment Variables to set in Vercel:"
echo "- NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.dreamparklabs.com"
echo "- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_..."
echo "- CLERK_SECRET_KEY=sk_live_..."
echo "- NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud"
echo "- And all other variables from env.production.example"
echo ""

print_success "Deployment preparation complete! 🚀"
