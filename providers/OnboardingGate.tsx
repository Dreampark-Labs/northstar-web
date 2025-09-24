"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { PortalErrorBoundary } from "@/components/ErrorBoundary";
import OnboardingModal from "@/components/ui/OnboardingModal/OnboardingModal";

export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const me = useQuery(api.users.getCurrentUser);
  const onboardingStatus = useQuery(api.users.ensureOnboardingStatus);
  const setActiveTerm = useMutation(api.users.setActiveTerm);
  const markDone = useMutation(api.users.markDemographicsComplete);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lastCreatedTermId, setLastCreatedTermId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [demographicsCompleted, setDemographicsCompleted] = useState(false);

  const needsOnboarding = useMemo(() => {
    // While loading, don't block render yet
    if (me === undefined || onboardingStatus === undefined) return false;
    // If the user record isn't created yet, treat as needing onboarding.
    // The ConvexProvider ensures user creation shortly after auth, so by the
    // time the user interacts with the modal, the record should exist.
    if (!me || !onboardingStatus) return true;
    
    // Use the more comprehensive onboarding status check that looks at actual data
    const needsAnyStep = onboardingStatus.needsDemographics || onboardingStatus.needsAcademic || onboardingStatus.needsTerm;
    
    // Check both the comprehensive status and local completion state
    return needsAnyStep && !demographicsCompleted;
  }, [me, onboardingStatus, demographicsCompleted]);

  useEffect(() => {
    // Debug logs during rollout
    // eslint-disable-next-line no-console
    console.log("[OnboardingGate] me:", me, "onboardingStatus:", onboardingStatus, "needsOnboarding:", needsOnboarding);
  }, [me, onboardingStatus, needsOnboarding]);

  // Ensure URL reflects onboarding state like other modals
  useEffect(() => {
    if (!needsOnboarding) return;
    const current = searchParams.get("onboarding");
    if (!current) {
      const url = new URL(window.location.href);
      url.searchParams.set("onboarding", "demographics");
      window.history.replaceState({}, "", url.toString());
    }
  }, [needsOnboarding, searchParams]);

  const handleCompleted = async (createdTermId?: string) => {
    setIsCompleting(true);
    try {
      if (createdTermId) {
        setLastCreatedTermId(createdTermId);
        await setActiveTerm({ termId: createdTermId });
      }
      await markDone();
      // Set local flag to prevent re-showing modal before query updates
      setDemographicsCompleted(true);
      const termId = createdTermId || me?.currentActiveTerm || "0";
      // Remove onboarding param and navigate to the dashboard for the new/active term
      const url = new URL(window.location.href);
      url.searchParams.delete("onboarding");
      window.history.replaceState({}, "", url.toString());
      router.replace(`/app/v1/term-${termId}/dashboard`);
    } catch (e) {
      console.error("Onboarding completion failed", e);
      setIsCompleting(false);
    }
  };

  // Show modal only if user needs onboarding AND we're not in the middle of completion
  const showModal = needsOnboarding && !lastCreatedTermId && !isCompleting;

  return (
    <>
      {children}
      {showModal && (
        <PortalErrorBoundary>
          <OnboardingModal
            isOpen
            onCompleted={handleCompleted}
          />
        </PortalErrorBoundary>
      )}
    </>
  );
}


