import { useEffect } from "react";
import { useNavigate } from "react-router";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import type { Route } from "./+types/settings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - My React Router App" },
    { name: "description", content: "Application settings and preferences" },
  ];
}

export default function Settings() {
  const navigate = useNavigate();

  // Redirect to dashboard with settings modal open
  useEffect(() => {
    navigate("/app/v2/dashboard?settings=true", { replace: true });
  }, [navigate]);

  return (
    <>
      <SignedIn>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to settings...</p>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
