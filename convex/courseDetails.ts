import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return null;

    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id || course.softDeletedAt) {
      return null;
    }

    return course;
  }
});

export const getTerm = query({
  args: { termId: v.id("terms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return null;

    const term = await ctx.db.get(args.termId);
    if (!term || term.userId !== user._id || term.softDeletedAt) {
      return null;
    }

    return term;
  }
});

export const getAssignmentsByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    // Verify course ownership
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id) {
      return [];
    }

    return await ctx.db
      .query("assignments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  }
});
