import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Northstar',
  description: 'Create your Northstar academic productivity account',
};

export default function SignUpPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: 'var(--color-bg)',
    }}>
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
        redirectUrl="/app/v1/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  );
}
