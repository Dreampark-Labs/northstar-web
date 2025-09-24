'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const getMessageText = (messageType: string | null) => {
    switch (messageType) {
      case 'signup-complete':
        return 'Your account has been created successfully! Please sign in.';
      case 'verification-complete':
        return 'Email verification complete! Please sign in to continue.';
      case 'please-sign-in':
        return 'Please sign in to continue.';
      default:
        return null;
    }
  };

  const messageText = getMessageText(message);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {messageText && (
          <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="text-sm text-green-700">{messageText}</div>
          </div>
        )}
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
          signUpUrl="/sign-up"
          afterSignInUrl="/app/v1/dashboard"
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
}

export function CustomSignIn() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
          signUpUrl="/sign-up"
          afterSignInUrl="/app/v1/dashboard"
          routing="path"
          path="/sign-in"
        />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
