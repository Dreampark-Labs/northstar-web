import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useUserSettings() {
  const userSettings = useQuery(api.userSettings.getUserSettings);
  const updateSettings = useMutation(api.userSettings.updateUserSettings);
  const updateLayout = useMutation(api.userSettings.updateDashboardLayout);

  return {
    userSettings,
    updateSettings,
    updateLayout,
    // Helper getters with defaults
    weekStartDay: userSettings?.weekStartDay || "Sunday",
    theme: userSettings?.theme || "system",
    dateFormat: userSettings?.dateFormat || "MM/DD/YYYY",
    timeFormat: userSettings?.timeFormat || "12h",
    emailNotifications: userSettings?.emailNotifications ?? true,
    dueSoonDays: userSettings?.dueSoonDays || 7,
  };
}
