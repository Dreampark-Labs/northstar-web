import { SignIn } from "@clerk/clerk-react";
import type { Route } from "./+types/sign-in";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In - My React Router App" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to your account to continue
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700",
              }
            }}
            signUpUrl="/sign-up"
            redirectUrl="/app/v2/dashboard"
            routing="path"
            path="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
