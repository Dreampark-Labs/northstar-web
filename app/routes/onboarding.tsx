import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "../../convex/_generated/api";
import DemographicsStep from "../components/onboarding/DemographicsStep";
import SchoolInfoStep from "../components/onboarding/SchoolInfoStep";
import TermSetupStep from "../components/onboarding/TermSetupStep";
import type { Route } from "./+types/onboarding";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome - Complete Your Setup" },
    { name: "description", content: "Complete your account setup to get started" },
  ];
}

export default function OnboardingPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  // Redirect users who have already completed demographics
  useEffect(() => {
    if (convexUser && convexUser.hasCompletedDemographics) {
      navigate("/app/v2/dashboard", { replace: true });
    }
  }, [convexUser, navigate]);

  const updateDemographics = useMutation(api.users.updateUserDemographics);
  const updateSchoolInfo = useMutation(api.users.updateUserSchoolInfo);
  const createTerm = useMutation(api.terms.createTerm);
  const completeGuidedTour = useMutation(api.users.completeGuidedTour);

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
        // Redirect to dashboard after successful completion
        navigate("/app/v2/dashboard");
      } else {
        throw new Error("Failed to create term");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
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

  // Show loading if user data isn't ready
  if (!convexUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 flex flex-col lg:flex-row">
      {/* Left Side - Header & Progress */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-8 lg:px-12 lg:py-0">
        <div className="space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="mb-4 lg:mb-6 flex justify-center lg:justify-start">
              <img 
                src="/logo-light.png" 
                alt="Northstar Logo" 
                className="h-12 lg:h-16 w-auto dark:hidden"
              />
              <img 
                src="/logo-dark.png" 
                alt="Northstar Logo" 
                className="h-12 lg:h-16 w-auto hidden dark:block"
              />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-4">
              Welcome to Northstar!
            </h1>
            <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Let's get your account set up so you can start managing your academic life effectively.
            </p>
          </div>

          {/* Progress indicator */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep} of 3
              </span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {currentStep === 1 && "Demographics"}
                {currentStep === 2 && "School Information"}
                {currentStep === 3 && "Term Setup"}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              <div className={`flex items-center space-x-1 lg:space-x-2 ${currentStep >= 1 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                <span className="text-xs lg:text-sm font-medium">Demographics</span>
              </div>
              <div className={`flex items-center space-x-1 lg:space-x-2 ${currentStep >= 2 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                <span className="text-xs lg:text-sm font-medium">School Info</span>
              </div>
              <div className={`flex items-center space-x-1 lg:space-x-2 ${currentStep >= 3 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                <span className="text-xs lg:text-sm font-medium">Term Setup</span>
              </div>
            </div>
          </div>

          {/* Footer - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact support at{" "}
              <a href="mailto:support@dreampark.dev" className="text-purple-600 dark:text-purple-400 hover:underline">
                support@dreampark.dev
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8">
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

      {/* Footer - Shown on mobile, hidden on desktop */}
      <div className="lg:hidden px-6 pb-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Need help? Contact support at{" "}
          <a href="mailto:support@dreampark.dev" className="text-purple-600 dark:text-purple-400 hover:underline">
            support@dreampark.dev
          </a>
        </p>
      </div>
    </div>
  );
}
