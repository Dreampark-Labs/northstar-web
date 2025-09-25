import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import DemographicsStep from "./DemographicsStep";
import SchoolInfoStep from "./SchoolInfoStep";
import TermSetupStep from "./TermSetupStep";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const updateDemographics = useMutation(api.users.updateUserDemographics);
  const updateSchoolInfo = useMutation(api.users.updateUserSchoolInfo);
  const createTerm = useMutation(api.terms.createTerm);
  const completeGuidedTour = useMutation(api.users.completeGuidedTour);
  const verifyUserData = useQuery(
    api.users.verifyUserDataCompleteness,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Step data
  const [demographicsData, setDemographicsData] = useState({
    birthday: "",
    ethnicity: "",
    gender: "",
  });

  const [schoolData, setSchoolData] = useState({
    school: "",
    majorCategory: "",
    major: "",
    minor: "",
    currentYear: "",
  });

  const [termData, setTermData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const handleDemographicsNext = async (data: typeof demographicsData) => {
    if (!convexUser?._id) return;
    
    setIsLoading(true);
    try {
      await updateDemographics({
        userId: convexUser._id,
        birthday: new Date(data.birthday).getTime(),
        ethnicity: data.ethnicity,
        gender: data.gender,
      });
      
      // Verify data was saved by checking if the mutation succeeded
      setDemographicsData(data);
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to update demographics:", error);
      alert("Failed to save demographic information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolInfoNext = async (data: typeof schoolData) => {
    if (!convexUser?._id) return;
    
    setIsLoading(true);
    try {
      await updateSchoolInfo({
        userId: convexUser._id,
        school: data.school,
        majorCategory: data.majorCategory,
        major: data.major,
        minor: data.minor,
        currentYear: data.currentYear,
      });
      
      // Data saved successfully, proceed to next step
      setSchoolData(data);
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to update school info:", error);
      alert("Failed to save school information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermSetupComplete = async (data: typeof termData) => {
    if (!convexUser?._id) return;
    
    setIsLoading(true);
    try {
      // Create the term
      const termId = await createTerm({
        userId: convexUser._id,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "active",
      });
      
      // Verify the term was created successfully
      if (termId) {
        // Complete the guided tour and mark demographics as complete
        await completeGuidedTour({
          userId: convexUser._id,
        });
        
        setTermData(data);
        onComplete();
      } else {
        throw new Error("Failed to create term");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // Show user-friendly error message
      alert("There was an issue completing your setup. Please try again or contact support if the problem persists.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen || !convexUser) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep} of 3
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep === 1 && "Demographics"}
                {currentStep === 2 && "School Information"}
                {currentStep === 3 && "Term Setup"}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          {currentStep === 1 && (
            <DemographicsStep
              onNext={handleDemographicsNext}
              initialData={demographicsData}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && (
            <SchoolInfoStep
              onNext={handleSchoolInfoNext}
              onBack={handleBack}
              initialData={schoolData}
              isLoading={isLoading}
            />
          )}

          {currentStep === 3 && (
            <TermSetupStep
              onComplete={handleTermSetupComplete}
              onBack={handleBack}
              initialData={termData}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
