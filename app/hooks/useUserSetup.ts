import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export function useUserSetup() {
  const { user, isLoaded } = useUser();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userCreationFailed, setUserCreationFailed] = useState(false);
  
  const createUser = useMutation(api.users.createUser);
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  // Create user in Convex when Clerk user is available
  useEffect(() => {
    const createConvexUser = async () => {
      if (isLoaded && user && !convexUser && !isCreatingUser && !userCreationFailed) {
        console.log("Creating Convex user for:", user.id);
        setIsCreatingUser(true);
        setUserCreationFailed(false);
        try {
          await createUser({
            clerkUserId: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          });
          console.log("Successfully created Convex user");
        } catch (error) {
          console.error("Failed to create user in Convex:", error);
          setUserCreationFailed(true);
        } finally {
          setIsCreatingUser(false);
        }
      }
    };

    createConvexUser();
  }, [isLoaded, user, convexUser, createUser, isCreatingUser, userCreationFailed]);

  const needsOnboarding = convexUser && !convexUser.hasCompletedDemographics;
  
  // User is ready when Clerk is loaded and we either have a convex user or finished trying to create one
  const isUserReady = isLoaded && user && (convexUser || !isCreatingUser);

  return {
    user,
    convexUser,
    needsOnboarding,
    isUserReady,
    isCreatingUser,
    isLoaded,
    userCreationFailed,
  };
}
