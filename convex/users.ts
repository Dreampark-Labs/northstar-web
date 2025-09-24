import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to log user metric changes
async function logUserMetricChange(
  ctx: any,
  userId: string,
  changeType: string,
  previousValue: any,
  newValue: any,
  changeReason: string
) {
  await ctx.db.insert("userClassMetrics", {
    userId,
    metricType: "user_change_log" as const,
    changeType: changeType as any,
    previousValue,
    newValue,
    changeReason,
    calculatedAt: Date.now(),
  });
}

export const createUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hasCompletedDemographics: false,
      hasCompletedGuidedTour: false,
      totalAssignments: 0,
      totalClassesEnrolled: 0,
      totalSubmissions: 0,
      totalTermsCreated: 0,
    });
  },
});

export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();
  },
});

export const updateUserProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    birthday: v.optional(v.number()),
    gender: v.optional(v.string()),
    ethnicity: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error('Convex Unauthorized: no identity');
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const updateAcademicInfo = mutation({
  args: {
    school: v.optional(v.string()),
    major: v.optional(v.string()),
    majorCategory: v.optional(v.string()),
    minor: v.optional(v.string()),
    currentYear: v.optional(v.string()),
    gpa: v.optional(v.number()),
    transferGPA: v.optional(v.number()),
    transferCredits: v.optional(v.number()),
    currentGPA: v.optional(v.number()),
    institutionGPA: v.optional(v.number()),
    totalCreditsEarned: v.optional(v.number()),
    totalCreditsAttempted: v.optional(v.number()),
    expectedGraduationDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Track changes to GPA-related fields
    const gpaFields = ['transferGPA', 'transferCredits', 'currentGPA', 'institutionGPA', 'totalCreditsEarned', 'totalCreditsAttempted'];
    const changeTypeMap: Record<string, string> = {
      transferGPA: "transfer_gpa",
      transferCredits: "transfer_credits",
      currentGPA: "current_gpa",
      institutionGPA: "institution_gpa",
      totalCreditsEarned: "total_credits_earned",
      totalCreditsAttempted: "total_credits_attempted",
    };

    for (const field of gpaFields) {
      const newValue = (args as any)[field];
      const currentValue = (user as any)[field];
      
      if (newValue !== undefined && currentValue !== newValue) {
        const changeType = changeTypeMap[field];
        if (changeType) {
          await logUserMetricChange(ctx, user._id, changeType, currentValue, newValue, "academic_info_updated");
        }
      }
    }

    return await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const setActiveTerm = mutation({
  args: { termId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { currentActiveTerm: args.termId, updatedAt: Date.now() });
  },
});

export const ensureOnboardingStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { needsDemographics: false, needsAcademic: false, needsTerm: false };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    if (!user) return { needsDemographics: true, needsAcademic: true, needsTerm: true };

    const needsDemographics = !user.birthday || !user.gender || !user.ethnicity;
    const needsAcademic = !user.school || !user.majorCategory || !user.currentYear;

    const hasAnyTerms = await ctx.db
      .query("terms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    const needsTerm = !hasAnyTerms;

    return { needsDemographics, needsAcademic, needsTerm, currentActiveTerm: user.currentActiveTerm } as any;
  },
});

export const markDemographicsComplete = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.patch(user._id, {
      hasCompletedDemographics: true,
      updatedAt: Date.now(),
    });
  },
});

export const markGuidedTourComplete = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.patch(user._id, {
      hasCompletedGuidedTour: true,
      updatedAt: Date.now(),
    });
  },
});

// Debug utility to manually bypass onboarding (remove in production)
export const forceCompleteOnboarding = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.patch(user._id, {
      hasCompletedDemographics: true,
      birthday: user.birthday || Date.now(),
      gender: user.gender || "Prefer not to say",
      ethnicity: user.ethnicity || "Prefer not to say",
      school: user.school || "Test University",
      majorCategory: user.majorCategory || "Other",
      currentYear: user.currentYear || "Sophomore",
      updatedAt: Date.now(),
    });
  },
});