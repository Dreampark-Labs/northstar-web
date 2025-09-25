# Clerk Authentication Setup

## Quick Setup Instructions

1. **Sign up for Clerk**: Go to [https://clerk.com](https://clerk.com) and create a free account

2. **Create a new application**: 
   - Click "Create Application"
   - Choose "Email" and "Password" as authentication methods
   - Give your app a name

3. **Configure user profile fields**:
   - Go to "User & Authentication" → "Email, Phone, Username"
   - Ensure "Email address" is set as required
   - Go to "User & Authentication" → "Personal information"
   - Set "First name" as required
   - Set "Last name" as required
   - This ensures users must provide first name, last name, email, and password during sign-up

4. **Get your keys**:
   - Copy your "Publishable Key" 
   - Copy your "Secret Key" from the API Keys section

5. **Create environment file**:
   ```bash
   # Create .env.local file in the project root
   touch .env.local
   ```

6. **Add your keys to .env.local**:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   ```

7. **Restart the development server**:
   ```bash
   npm run dev
   ```

## Testing Authentication

- Visit `http://localhost:5173` - you'll see sign up/sign in buttons for unauthenticated users
- Visit `http://localhost:5173/sign-up` to create a new account
- Visit `http://localhost:5173/sign-in` to sign in with existing account
- Visit `http://localhost:5173/app` - this will redirect to sign-in if not authenticated
- Once signed in, you'll see the dashboard with a user profile button

## Features Implemented

✅ **Complete User Registration**: First name, last name, email, and password required  
✅ **Protected Routes**: `/app/*` routes require authentication  
✅ **Automatic Redirects**: Unauthenticated users redirected to sign-in  
✅ **Personalized Experience**: Dashboard shows user's first name  
✅ **User Profile Management**: Built-in profile button with sign-out  
✅ **Responsive Design**: Works on all devices with dark mode support  

## User Registration Fields

When users sign up, they will be required to provide:
- **First Name** (required)
- **Last Name** (required) 
- **Email Address** (required)
- **Password** (required)

The authentication is fully functional once you add your Clerk keys and configure the required fields!
