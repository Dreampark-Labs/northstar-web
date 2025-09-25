import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to calculate assignment status based on due date and completion
function calculateAssignmentStatus(assignment: any): string {
  const now = Date.now();
  
  if (assignment.status === "completed") {
    return "completed";
  }
  
  if (assignment.dueAt < now) {
    return "overdue";
  }
  
  return "todo";
}

// Function to update overdue assignments in the database
async function updateOverdueAssignments(ctx: any, userId: any) {
  const now = Date.now();
  
  // Find all assignments that should be overdue but aren't marked as such
  const assignments = await ctx.db
    .query("assignments")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();
    
  const assignmentsToUpdate = assignments.filter(assignment => 
    assignment.status !== "completed" && 
    assignment.status !== "overdue" && 
    assignment.dueAt < now
  );
  
  // Update each assignment that should be overdue
  for (const assignment of assignmentsToUpdate) {
    await ctx.db.patch(assignment._id, {
      status: "overdue"
    });
  }
  
  return assignmentsToUpdate.length;
}

// Mutation to update overdue assignments
export const updateOverdueAssignmentStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await updateOverdueAssignments(ctx, user._id);
  },
});

// Get all assignments for a user
export const getUserAssignments = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    // First get the user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
      .first();

    if (!user) {
      return [];
    }

    // Get all assignments for the user
    const assignments = await ctx.db
      .query("assignments")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    // Get course information for each assignment
    const assignmentsWithCourses = await Promise.all(
      assignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId);
        return {
          ...assignment,
          // Use the actual database status
          courseCode: course?.code,
          courseName: course?.title,
          courseColor: "#3B82F6" // Default blue since color isn't in the schema
        };
      })
    );

    return assignmentsWithCourses.sort((a, b) => a.dueAt - b.dueAt);
  },
});

// Get upcoming deadlines (next 7 days)
export const getUpcomingDeadlines = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const now = Date.now();
    const oneWeekFromNow = now + (7 * 24 * 60 * 60 * 1000);

    const assignments = await ctx.db
      .query("assignments")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    const upcomingAssignments = assignments
      .filter(assignment => 
        assignment.dueAt >= now && 
        assignment.dueAt <= oneWeekFromNow &&
        assignment.status !== "completed"
      )
      .sort((a, b) => a.dueAt - b.dueAt);

    // Get course information
    const assignmentsWithCourses = await Promise.all(
      upcomingAssignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId);
        return {
          ...assignment,
          // Use the actual database status
          courseCode: course?.code,
          courseName: course?.title
        };
      })
    );

    return assignmentsWithCourses;
  },
});

// Get recent grades (assignments with grades)
export const getRecentGrades = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const assignments = await ctx.db
      .query("assignments")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    const gradedAssignments = assignments
      .filter(assignment => assignment.grade !== undefined)
      .sort((a, b) => b.dueAt - a.dueAt) // Most recent first
      .slice(0, 5); // Get last 5 graded assignments

    // Get course information
    const assignmentsWithCourses = await Promise.all(
      gradedAssignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId);
        return {
          _id: assignment._id,
          title: assignment.title,
          grade: assignment.grade,
          maxPoints: 100, // Default since not in schema
          courseCode: course?.code,
          dueAt: assignment.dueAt,
          status: assignment.status // Use the actual database status
        };
      })
    );

    return assignmentsWithCourses;
  },
});

// Create a new assignment
export const createAssignment = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    dueDate: v.number(),
    maxPoints: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("assignments", {
      userId: user._id,
      courseId: args.courseId,
      title: args.title,
      lc_title: args.title.toLowerCase(),
      notes: args.description,
      dueAt: args.dueDate, // Map dueDate to dueAt to match schema
      status: "todo",
      grade: undefined
    });
  },
});

// Update assignment status
export const updateAssignmentStatus = mutation({
  args: {
    assignmentId: v.id("assignments"),
    status: v.string(),
    grade: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Verify the assignment belongs to the user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || assignment.userId !== user._id) {
      throw new Error("Not authorized");
    }

    return await ctx.db.patch(args.assignmentId, {
      status: args.status,
      grade: args.grade
    });
  },
});

// Update/Edit assignment
export const updateAssignment = mutation({
  args: {
    assignmentId: v.id("assignments"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    maxPoints: v.optional(v.number()),
    grade: v.optional(v.number()),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Verify the assignment belongs to the user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || assignment.userId !== user._id) {
      throw new Error("Not authorized");
    }

    const updateData: any = {};
    
    if (args.title !== undefined) {
      updateData.title = args.title;
      updateData.lc_title = args.title.toLowerCase();
    }
    if (args.description !== undefined) updateData.notes = args.description;
    if (args.dueDate !== undefined) updateData.dueAt = args.dueDate;
    if (args.grade !== undefined) updateData.grade = args.grade;
    if (args.status !== undefined) updateData.status = args.status;

    return await ctx.db.patch(args.assignmentId, updateData);
  },
});

// Delete assignment
export const deleteAssignment = mutation({
  args: {
    assignmentId: v.id("assignments")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Verify the assignment belongs to the user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || assignment.userId !== user._id) {
      throw new Error("Not authorized");
    }

    return await ctx.db.delete(args.assignmentId);
  },
});

// Get a single assignment by ID
export const getAssignment = query({
  args: {
    assignmentId: v.id("assignments")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Verify the assignment belongs to the user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || assignment.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Get course information
    const course = await ctx.db.get(assignment.courseId);

    return {
      ...assignment,
      // Use the actual database status
      courseCode: course?.code,
      courseName: course?.title
    };
  },
});