import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Outlet } from "react-router";
import AppLayout from "../components/AppLayout";

export default function AppLayoutRoute() {
  return (
    <>
      <SignedIn>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
