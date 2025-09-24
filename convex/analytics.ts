import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Get authenticated user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return null;

    // Get current term
    const currentTerm = await ctx.db
      .query("terms")
      .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "current"))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .first();

    // Get active courses (courses in current terms)
    const currentTerms = await ctx.db
      .query("terms")
      .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "current"))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
    
    const activeCourses = await Promise.all(
      currentTerms.map(term => 
        ctx.db
          .query("courses")
          .withIndex("by_user_term", (q) => q.eq("userId", user._id).eq("termId", term._id))
          .filter(q => q.eq(q.field("softDeletedAt"), undefined))
          .collect()
      )
    ).then(courseArrays => courseArrays.flat());

    // Get total counts
    const [totalTerms, totalCourses, totalAssignments, totalFiles] = await Promise.all([
      ctx.db
        .query("terms")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter(q => q.eq(q.field("softDeletedAt"), undefined))
        .collect()
        .then(terms => terms.length),
      
      ctx.db
        .query("courses")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter(q => q.eq(q.field("softDeletedAt"), undefined))
        .collect()
        .then(courses => courses.length),
      
      ctx.db
        .query("assignments")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter(q => q.eq(q.field("softDeletedAt"), undefined))
        .collect()
        .then(assignments => assignments.length),
      
      ctx.db
        .query("files")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter(q => q.eq(q.field("softDeletedAt"), undefined))
        .collect()
        .then(files => files.length),
    ]);

    // Get assignment stats
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();

    const completedAssignments = assignments.filter(a => a.status === "done").length;
    const pendingAssignments = assignments.filter(a => a.status === "todo").length;

    // Get grade stats
    const gradesAssignments = assignments.filter(a => a.grade !== undefined);
    const averageGrade = gradesAssignments.length > 0 
      ? gradesAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradesAssignments.length
      : null;

    return {
      currentTerm,
      totals: {
        terms: totalTerms,
        courses: totalCourses,
        activeCourses: activeCourses.length,
        assignments: totalAssignments,
        files: totalFiles,
      },
      assignments: {
        completed: completedAssignments,
        pending: pendingAssignments,
        total: totalAssignments,
        averageGrade,
        gradedCount: gradesAssignments.length,
      },
    };
  },
});

export const getWeeklyActivity = query({
  args: { weeks: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    const weeksBack = args.weeks || 4;
    const now = Date.now();
    const startTime = now - (weeksBack * 7 * 24 * 60 * 60 * 1000);

    const activities = await ctx.db
      .query("activityEvents")
      .withIndex("by_user_ts", (q) => q.eq("userId", user._id).gte("ts", startTime))
      .collect();

    // Group by week
    const weeklyData = new Map<string, { [key: string]: number }>();
    
    activities.forEach(activity => {
      const date = new Date(activity.ts);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {});
      }
      
      const week = weeklyData.get(weekKey)!;
      week[activity.type] = (week[activity.type] || 0) + 1;
    });

    return Array.from(weeklyData.entries()).map(([week, data]) => ({
      week,
      ...data,
    })).sort((a, b) => a.week.localeCompare(b.week));
  },
});

export const getUpcomingDeadlines = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    const daysAhead = args.days || 14;
    const now = Date.now();
    const futureDate = now + (daysAhead * 24 * 60 * 60 * 1000);

    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_user_due", (q) => q.eq("userId", user._id).gte("dueAt", now).lt("dueAt", futureDate))
      .filter(q => q.and(
        q.eq(q.field("softDeletedAt"), undefined),
        q.eq(q.field("status"), "todo")
      ))
      .order("asc")
      .collect();

    // Enrich with course information
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId);
        return {
          ...assignment,
          course: course ? { title: course.title, code: course.code } : null,
        };
      })
    );

    return enrichedAssignments;
  },
});

// Helper function to calculate active courses for a user
async function calculateActiveCourses(ctx: any, userId: string) {
  const currentTerms = await ctx.db
    .query("terms")
    .withIndex("by_user_status", (q: any) => q.eq("userId", userId).eq("status", "current"))
    .filter((q: any) => q.eq(q.field("softDeletedAt"), undefined))
    .collect();
  
  const activeCourses = await Promise.all(
    currentTerms.map((term: any) => 
      ctx.db
        .query("courses")
        .withIndex("by_user_term", (q: any) => q.eq("userId", userId).eq("termId", term._id))
        .filter((q: any) => q.eq(q.field("softDeletedAt"), undefined))
        .collect()
    )
  ).then(courseArrays => courseArrays.flat());

  return activeCourses.length;
}

// Helper function to calculate overdue assignments for a user
async function calculateOverdueAssignments(ctx: any, userId: string) {
  const now = Date.now();
  
  const overdueAssignments = await ctx.db
    .query("assignments")
    .withIndex("by_user_due", (q: any) => 
      q.eq("userId", userId)
       .lt("dueAt", now)
    )
    .filter((q: any) => q.and(
      q.eq(q.field("softDeletedAt"), undefined),
      q.eq(q.field("status"), "todo")
    ))
    .collect();

  return overdueAssignments.length;
}

// Function to update user's active course count and log the change
export const updateActiveCourseCount = mutation({
  args: {
    userId: v.id("users"),
    changeReason: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user data
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Calculate current active courses
    const currentActiveCount = await calculateActiveCourses(ctx, args.userId);
    const previousActiveCount = user.totalClassesEnrolled || 0;

    // Update user record if count changed
    if (currentActiveCount !== previousActiveCount) {
      await ctx.db.patch(args.userId, {
        totalClassesEnrolled: currentActiveCount,
        updatedAt: Date.now(),
      });

      // Log the change
      await ctx.db.insert("userClassMetrics", {
        userId: args.userId,
        metricType: "user_change_log" as const,
        changeType: "total_classes_enrolled" as const,
        previousValue: previousActiveCount,
        newValue: currentActiveCount,
        changeReason: args.changeReason,
        calculatedAt: Date.now(),
      });

      return {
        changed: true,
        previousCount: previousActiveCount,
        newCount: currentActiveCount,
      };
    }

    return {
      changed: false,
      count: currentActiveCount,
    };
  },
});

// Function to update and log overdue assignments count
export const updateOverdueAssignmentsCount = mutation({
  args: {
    userId: v.id("users"),
    changeReason: v.string(),
  },
  handler: async (ctx, args) => {
    // Calculate current overdue assignments
    const currentOverdueCount = await calculateOverdueAssignments(ctx, args.userId);

    // Log the current overdue count (we track all changes)
    await ctx.db.insert("userClassMetrics", {
      userId: args.userId,
      metricType: "user_change_log" as const,
      changeType: "total_assignments" as const, // We can reuse this for overdue tracking
      previousValue: null, // For overdue, we just log current state
      newValue: currentOverdueCount,
      changeReason: args.changeReason,
      calculatedAt: Date.now(),
    });

    return {
      overdueCount: currentOverdueCount,
    };
  },
});
