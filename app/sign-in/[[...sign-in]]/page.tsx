import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Northstar',
  description: 'Sign in to your Northstar academic productivity account',
};

export default function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: 'var(--color-bg)',
    }}>
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
        redirectUrl="/app/v1/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
