import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import type { Route } from "./+types/logout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Logging out - Northstar" },
    { name: "description", content: "Signing out of your account" },
  ];
}

export default function Logout() {
  const { signOut } = useClerk();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut();
        // Redirect to external website
        window.location.href = "https://northstarstudenthub.com";
      } catch (error) {
        console.error("Logout failed:", error);
        // Fallback to home page if external redirect fails
        window.location.href = "/";
      }
    };

    handleLogout();
  }, [signOut]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Signing out...</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we sign you out securely.</p>
      </div>
    </div>
  );
}

