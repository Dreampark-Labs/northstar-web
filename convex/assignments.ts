import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assignmentValidator } from "./lib/validation";
// import { updateOverdueAssignmentsCount } from "./analytics";

export const create = mutation({
  args: assignmentValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Verify course ownership
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id) {
      throw new Error("Course not found or unauthorized");
    }

    return await ctx.db.insert("assignments", {
      userId: user._id,
      lc_title: args.title.toLowerCase(),
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("assignments"),
    ...assignmentValidator.fields,
    pointsEarned: v.optional(v.number()),
    pointsPossible: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...updateData } = args;

    const assignment = await ctx.db.get(id);
    if (!assignment) throw new Error("Assignment not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || assignment.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Build patch data
    const patchData: any = {};
    
    // Update searchable fields
    if (updateData.title) {
      patchData.lc_title = updateData.title.toLowerCase();
    }

    // Add all other fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        patchData[key] = updateData[key as keyof typeof updateData];
      }
    });

    // Auto-calculate grade percentage if points are provided
    if (updateData.pointsEarned !== undefined && updateData.pointsPossible !== undefined && updateData.pointsPossible > 0) {
      patchData.gradePercentage = (updateData.pointsEarned / updateData.pointsPossible) * 100;
    }

    // Check if status is changing to track overdue assignments
    const statusChanged = updateData.status && updateData.status !== assignment.status;

    const result = await ctx.db.patch(id, patchData);

    // If status changed, update overdue count tracking
    if (statusChanged) {
      // TODO: Re-enable analytics tracking
      // await updateOverdueAssignmentsCount(ctx, {
      //   userId: user._id,
      //   changeReason: `assignment_status_changed: ${assignment.title} from ${assignment.status} to ${updateData.status}`,
      // });
    }

    return result;
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get authenticated user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    // Get all assignments for the user
    return await ctx.db
      .query("assignments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const getAssignments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get authenticated user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("assignments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const getAssignmentsDueSoon = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get authenticated user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("assignments")
      .withIndex("by_user_due", (q) => q.eq("userId", user._id).gte("dueAt", now).lt("dueAt", now + oneWeek))
      .filter(q => q.and(
        q.eq(q.field("softDeletedAt"), undefined),
        q.eq(q.field("status"), "todo")
      ))
      .order("asc")
      .collect();
  },
});

export const getCompletedAssignments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get authenticated user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("assignments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.and(
        q.eq(q.field("softDeletedAt"), undefined),
        q.eq(q.field("status"), "done")
      ))
      .collect();
  },
});

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Check user authorization
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
  },
});

export const getById = query({
  args: { id: v.id("assignments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return null;

    const assignment = await ctx.db.get(args.id);
    if (!assignment || assignment.userId !== user._id || assignment.softDeletedAt) {
      return null;
    }

    // Get course information
    const course = await ctx.db.get(assignment.courseId);
    if (!course || course.softDeletedAt) {
      return null;
    }

    return {
      ...assignment,
      course,
    };
  },
});

export const remove = mutation({
  args: { id: v.id("assignments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const assignment = await ctx.db.get(args.id);
    if (!assignment) throw new Error("Assignment not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || assignment.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    return await ctx.db.patch(args.id, {
      softDeletedAt: now,
      purgeAt: now + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
  },
});

export const restore = mutation({
  args: { id: v.id("assignments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const assignment = await ctx.db.get(args.id);
    if (!assignment) throw new Error("Assignment not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || assignment.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Check if still within undo window (7 days)
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (!assignment.softDeletedAt || now > assignment.softDeletedAt + sevenDays) {
      throw new Error("Assignment cannot be restored (past undo window)");
    }

    return await ctx.db.patch(args.id, {
      softDeletedAt: undefined,
      purgeAt: undefined,
    });
  },
});