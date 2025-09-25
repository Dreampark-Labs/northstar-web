import { SignUp } from "@clerk/clerk-react";
import type { Route } from "./+types/sign-up";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - My React Router App" },
    { name: "description", content: "Create a new account" },
  ];
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign up to get started with our application
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700",
              }
            }}
            signInUrl="/sign-in"
            redirectUrl="/onboarding"
            routing="path"
            path="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
