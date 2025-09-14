import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { courseValidator } from "./lib/validation";
// import { updateActiveCourseCount } from "./analytics";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: courseValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Verify term ownership
    const term = await ctx.db.get(args.termId);
    if (!term || term.userId !== user._id) {
      throw new Error("Term not found or unauthorized");
    }

    const courseId = await ctx.db.insert("courses", {
      userId: user._id,
      lc_title: args.title.toLowerCase(),
      lc_code: args.code.toLowerCase(),
      ...args,
    });

    // Update active course count and log the change
    // TODO: Re-enable analytics tracking
    // await updateActiveCourseCount(ctx, {
    //   userId: user._id,
    //   changeReason: `course_added: ${args.code} - ${args.title}`,
    // });

    return courseId;
  },
});

export const update = mutation({
  args: {
    id: v.id("courses"),
    ...courseValidator.fields,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...updateData } = args;

    const course = await ctx.db.get(id);
    if (!course) throw new Error("Course not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || course.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const patchData: any = { ...updateData };
    if (updateData.title) {
      patchData.lc_title = updateData.title.toLowerCase();
    }
    if (updateData.code) {
      patchData.lc_code = updateData.code.toLowerCase();
    }

    return await ctx.db.patch(id, patchData);
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const getCourses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const get = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    // Check user authorization
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || course.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Check if course is soft deleted
    if (course.softDeletedAt) {
      return null;
    }

    return course;
  }
});

export const listByTermFilter = query({
  args: { 
    termFilter: v.union(
      v.literal("all"), 
      v.literal("current"), 
      v.literal("past"), 
      v.literal("future"), 
      v.id("terms")
    ) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get authenticated user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    // Handle different term filter types
    let termIds: Id<"terms">[] = [];

    if (args.termFilter === "all") {
      // Get all terms for the user
      const allTerms = await ctx.db
        .query("terms")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter(q => q.eq(q.field("softDeletedAt"), undefined))
        .collect();
      termIds = allTerms.map(term => term._id);
    } else if (args.termFilter === "current" || args.termFilter === "past" || args.termFilter === "future") {
      // Get terms by status
      const statusTerms = await ctx.db
        .query("terms")
        .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", args.termFilter as "current" | "past" | "future"))
        .filter(q => q.eq(q.field("softDeletedAt"), undefined))
        .collect();
      termIds = statusTerms.map(term => term._id);
    } else {
      // Specific term ID
      const term = await ctx.db.get(args.termFilter);
      if (term && term.userId === user._id && !term.softDeletedAt) {
        termIds = [args.termFilter];
      }
    }

    if (termIds.length === 0) return [];

    // Get all courses for the selected terms
    const allCourses = await Promise.all(
      termIds.map(termId =>
        ctx.db
          .query("courses")
          .withIndex("by_user_term", (q) => q.eq("userId", user._id).eq("termId", termId))
          .filter(q => q.eq(q.field("softDeletedAt"), undefined))
          .collect()
      )
    );

    // Flatten the results and sort by term and course code
    return allCourses.flat().sort((a, b) => {
      // Sort by course code for consistency
      return a.code.localeCompare(b.code);
    });
  },
});

export const listByTerm = query({
  args: { termId: v.id("terms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    // Verify term ownership
    const term = await ctx.db.get(args.termId);
    if (!term || term.userId !== user._id) {
      return [];
    }

    return await ctx.db
      .query("courses")
      .withIndex("by_user_term", (q) => q.eq("userId", user._id).eq("termId", args.termId))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});


// Get comprehensive course statistics for the current user
export const getCourseStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Get authenticated user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return null;

    // Get all terms for the user
    const allTerms = await ctx.db
      .query("terms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();

    // Get current term
    const currentTerm = await ctx.db
      .query("terms")
      .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "current"))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .first();

    // Get all courses
    const allCourses = await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();

    // Get current term courses
    const currentTermCourses = currentTerm ? await ctx.db
      .query("courses")
      .withIndex("by_user_term", (q) => q.eq("userId", user._id).eq("termId", currentTerm._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect() : [];

    // Calculate statistics
    const totalCredits = allCourses.reduce((sum, course) => sum + (course.creditHours || 0), 0);
    const currentTermCredits = currentTermCourses.reduce((sum, course) => sum + (course.creditHours || 0), 0);
    const coursesWithInstructor = allCourses.filter(course => course.instructor).length;
    const currentTermCoursesWithInstructor = currentTermCourses.filter(course => course.instructor).length;

    // Get courses by term status
    const termsByStatus = {
      current: allTerms.filter(term => term.status === "current"),
      past: allTerms.filter(term => term.status === "past"),
      future: allTerms.filter(term => term.status === "future")
    };

    const coursesByTermStatus = {
      current: 0,
      past: 0,
      future: 0
    };

    // Count courses by term status
    for (const course of allCourses) {
      const term = allTerms.find(t => t._id === course.termId);
      if (term) {
        coursesByTermStatus[term.status]++;
      }
    }

    return {
      user: {
        totalClassesEnrolled: user.totalClassesEnrolled || 0,
        totalCreditsEarned: user.totalCreditsEarned || 0,
        totalCreditsAttempted: user.totalCreditsAttempted || 0,
        currentGPA: user.currentGPA,
        institutionGPA: user.institutionGPA
      },
      terms: {
        total: allTerms.length,
        current: termsByStatus.current.length,
        past: termsByStatus.past.length,
        future: termsByStatus.future.length,
        currentTerm
      },
      courses: {
        total: allCourses.length,
        current: coursesByTermStatus.current,
        past: coursesByTermStatus.past,
        future: coursesByTermStatus.future,
        withInstructor: coursesWithInstructor,
        currentTermWithInstructor: currentTermCoursesWithInstructor
      },
      credits: {
        total: totalCredits,
        currentTerm: currentTermCredits
      }
    };
  },
});

// Temporary function for development - fetches courses for specific user ID
export const listByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const course = await ctx.db.get(args.id);
    if (!course) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || course.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return course;
  },
});

export const softDelete = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Course not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || course.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const purgeAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.patch(args.id, { 
      softDeletedAt: now,
      purgeAt 
    });

    // Log activity event
    await ctx.db.insert("activityEvents", {
      userId: user._id,
      type: "delete",
      entity: "course",
      entityId: args.id,
      ts: now,
    });

    // Update active course count and log the change
    // TODO: Re-enable analytics tracking
    // await updateActiveCourseCount(ctx, {
    //   userId: user._id,
    //   changeReason: `course_deleted: ${course.code} - ${course.title}`,
    // });
  },
});
