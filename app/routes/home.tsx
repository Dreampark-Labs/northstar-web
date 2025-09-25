import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import type { Route } from "./+types/home";
import { useUserSetup } from "../hooks/useUserSetup";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home - My React Router App" },
    { name: "description", content: "Welcome to our homepage!" },
  ];
}

export default function Home() {
  const { needsOnboarding, isUserReady } = useUserSetup();
  
  // Determine the correct dashboard URL based on onboarding status
  const getDashboardUrl = () => {
    if (!isUserReady) return "/onboarding"; // Default while loading
    return needsOnboarding ? "/onboarding" : "/app/v2/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Our App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            This is the homepage of our React Router application with Tailwind CSS styling.
            Explore our features and get started today!
          </p>
          <div className="space-x-4">
            <SignedIn>
              <a
                href={getDashboardUrl()}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </a>
              <div className="inline-block">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-12 h-12"
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            </SignedIn>
            <SignedOut>
              <a
                href="/sign-up"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </a>
              <a
                href="/sign-in"
                className="inline-block bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 transition duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </a>
            </SignedOut>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fast & Modern</h3>
            <p className="text-gray-600 dark:text-gray-300">Built with React Router and optimized for performance.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Reliable</h3>
            <p className="text-gray-600 dark:text-gray-300">Tested and trusted by thousands of developers worldwide.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Responsive</h3>
            <p className="text-gray-600 dark:text-gray-300">Beautiful design that works on all devices and screen sizes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
