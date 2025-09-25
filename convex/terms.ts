import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new term for the user
export const createTerm = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const termId = await ctx.db.insert("terms", {
      userId: args.userId,
      name: args.name,
      lc_name: args.name.toLowerCase(),
      startDate: args.startDate,
      endDate: args.endDate,
      status: args.status,
    });

    // Update user's active term and increment terms created
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        currentActiveTerm: termId,
        totalTermsCreated: user.totalTermsCreated + 1,
        updatedAt: Date.now(),
      });
    }

    return termId;
  },
});

// Get user's terms
export const getUserTerms = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("terms")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Get user's terms by Clerk ID
export const getUserTermsByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("terms")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});
