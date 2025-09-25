import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedCameronData = mutation({
  args: {},
  handler: async (ctx) => {
    // First, find or create Cameron's user
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), "user_2pGQ8aXXXXXXXXXXXXXX")) // This would be Cameron's actual Clerk ID
      .first();

    let userId;
    if (!existingUser) {
      const now = Date.now();
      // Create Cameron's user profile
      userId = await ctx.db.insert("users", {
        clerkUserId: "user_2pGQ8aXXXXXXXXXXXXXX", // Replace with actual Clerk ID
        email: "cameron@dreampark.dev",
        firstName: "Cameron",
        lastName: "McCullough",
        hasCompletedDemographics: true,
        hasCompletedGuidedTour: true,
        birthday: new Date("1995-03-15").getTime(),
        ethnicity: "White",
        gender: "male",
        school: "University of California, Berkeley - Berkeley, CA",
        majorCategory: "Computer Science",
        major: "Computer Science",
        minor: "Business Administration",
        currentYear: "senior",
        createdAt: now,
        updatedAt: now,
        totalAssignments: 0,
        totalClassesEnrolled: 0,
        totalSubmissions: 0,
        totalTermsCreated: 0
      });
    } else {
      userId = existingUser._id;
    }

    // Create Fall 2024 term
    const termId = await ctx.db.insert("terms", {
      userId,
      name: "Fall 2024",
      lc_name: "fall 2024",
      startDate: "2024-08-26",
      endDate: "2024-12-13",
      status: "active"
    });

    // Create courses
    const courses = [
      {
        title: "Advanced Algorithms",
        code: "CS 170",
        lc_code: "cs 170",
        lc_title: "advanced algorithms",
        creditHours: 4,
        instructor: "Dr. Sarah Chen",
        meetingDays: ["Monday", "Wednesday", "Friday"],
        meetingStart: "10:00 AM",
        meetingEnd: "11:00 AM",
        building: "Soda Hall",
        room: "310"
      },
      {
        title: "Database Systems",
        code: "CS 186",
        lc_code: "cs 186",
        lc_title: "database systems",
        creditHours: 4,
        instructor: "Prof. Michael Rodriguez",
        meetingDays: ["Tuesday", "Thursday"],
        meetingStart: "2:00 PM",
        meetingEnd: "3:30 PM",
        building: "Soda Hall",
        room: "306"
      },
      {
        title: "Machine Learning",
        code: "CS 189",
        lc_code: "cs 189",
        lc_title: "machine learning",
        creditHours: 4,
        instructor: "Dr. Emily Wang",
        meetingDays: ["Monday", "Wednesday", "Friday"],
        meetingStart: "1:00 PM",
        meetingEnd: "2:00 PM",
        building: "Wheeler Hall",
        room: "150"
      },
      {
        title: "Software Engineering",
        code: "CS 169",
        lc_code: "cs 169",
        lc_title: "software engineering",
        creditHours: 3,
        instructor: "Prof. David Kim",
        meetingDays: ["Tuesday", "Thursday"],
        meetingStart: "11:00 AM",
        meetingEnd: "12:30 PM",
        building: "Soda Hall",
        room: "320"
      },
      {
        title: "Entrepreneurship",
        code: "UGBA 192",
        lc_code: "ugba 192",
        lc_title: "entrepreneurship",
        creditHours: 3,
        instructor: "Prof. Lisa Thompson",
        meetingDays: ["Wednesday"],
        meetingStart: "6:00 PM",
        meetingEnd: "9:00 PM",
        building: "Haas School",
        room: "F295"
      }
    ];

    const courseIds = [];
    for (const course of courses) {
      const courseId = await ctx.db.insert("courses", {
        userId,
        termId,
        ...course
      });
      courseIds.push({ id: courseId, ...course });
    }

    // Create assignments
    const assignments = [
      // CS 170 - Advanced Algorithms
      {
        courseId: courseIds[0].id,
        title: "Problem Set 1: Divide and Conquer",
        lc_title: "problem set 1: divide and conquer",
        notes: "Implement and analyze divide-and-conquer algorithms",
        dueAt: new Date("2024-09-15").getTime(),
        status: "completed",
        grade: 95
      },
      {
        courseId: courseIds[0].id,
        title: "Midterm Exam",
        lc_title: "midterm exam",
        notes: "Covers algorithms analysis and complexity theory",
        dueAt: new Date("2024-10-10").getTime(),
        status: "completed",
        grade: 88
      },
      {
        courseId: courseIds[0].id,
        title: "Problem Set 2: Dynamic Programming",
        lc_title: "problem set 2: dynamic programming",
        notes: "Solve complex optimization problems using DP",
        dueAt: new Date("2024-10-28").getTime(),
        status: "in_progress"
      },
      {
        courseId: courseIds[0].id,
        title: "Final Project: Algorithm Comparison",
        lc_title: "final project: algorithm comparison",
        notes: "Compare different algorithmic approaches for a real-world problem",
        dueAt: new Date("2024-12-05").getTime(),
        status: "pending"
      },

      // CS 186 - Database Systems
      {
        courseId: courseIds[1].id,
        title: "SQL Assignment 1",
        lc_title: "sql assignment 1",
        notes: "Complex queries and database design",
        dueAt: new Date("2024-09-20").getTime(),
        status: "completed",
        grade: 92
      },
      {
        courseId: courseIds[1].id,
        title: "Database Design Project",
        lc_title: "database design project",
        notes: "Design and implement a complete database system",
        dueAt: new Date("2024-11-15").getTime(),
        status: "in_progress"
      },
      {
        courseId: courseIds[1].id,
        title: "Query Optimization Lab",
        lc_title: "query optimization lab",
        notes: "Optimize database queries for performance",
        dueAt: new Date("2024-11-01").getTime(),
        status: "pending"
      },

      // CS 189 - Machine Learning
      {
        courseId: courseIds[2].id,
        title: "Linear Regression Implementation",
        lc_title: "linear regression implementation",
        notes: "Implement linear regression from scratch",
        dueAt: new Date("2024-09-25").getTime(),
        status: "completed",
        grade: 90
      },
      {
        courseId: courseIds[2].id,
        title: "Neural Networks Project",
        lc_title: "neural networks project",
        notes: "Build and train a neural network for image classification",
        dueAt: new Date("2024-11-20").getTime(),
        status: "in_progress"
      },
      {
        courseId: courseIds[2].id,
        title: "Midterm Exam",
        lc_title: "midterm exam",
        notes: "Supervised and unsupervised learning concepts",
        dueAt: new Date("2024-10-15").getTime(),
        status: "completed",
        grade: 85
      },

      // CS 169 - Software Engineering
      {
        courseId: courseIds[3].id,
        title: "Agile Development Essay",
        lc_title: "agile development essay",
        notes: "Analyze agile methodologies in software development",
        dueAt: new Date("2024-09-30").getTime(),
        status: "completed",
        grade: 94
      },
      {
        courseId: courseIds[3].id,
        title: "Team Project: Web Application",
        lc_title: "team project: web application",
        notes: "Build a full-stack web application with a team",
        dueAt: new Date("2024-12-10").getTime(),
        status: "in_progress"
      },

      // UGBA 192 - Entrepreneurship
      {
        courseId: courseIds[4].id,
        title: "Business Plan Draft",
        lc_title: "business plan draft",
        notes: "Create a comprehensive business plan for a startup idea",
        dueAt: new Date("2024-10-25").getTime(),
        status: "completed",
        grade: 87
      },
      {
        courseId: courseIds[4].id,
        title: "Pitch Presentation",
        lc_title: "pitch presentation",
        notes: "Present your startup idea to a panel of investors",
        dueAt: new Date("2024-11-30").getTime(),
        status: "pending"
      }
    ];

    for (const assignment of assignments) {
      await ctx.db.insert("assignments", {
        userId,
        ...assignment
      });
    }

    // Create some events for the calendar
    const events = [
      {
        title: "CS 170 Office Hours",
        lc_title: "cs 170 office hours",
        description: "Weekly office hours with TA",
        startTime: new Date("2024-10-24T15:00:00").getTime(),
        endTime: new Date("2024-10-24T16:00:00").getTime(),
        type: "office_hours",
        location: "Soda Hall 330",
        color: "#3B82F6"
      },
      {
        title: "Database Systems Study Group",
        lc_title: "database systems study group",
        description: "Group study session for upcoming exam",
        startTime: new Date("2024-10-25T19:00:00").getTime(),
        endTime: new Date("2024-10-25T21:00:00").getTime(),
        type: "study_group",
        location: "Main Library",
        color: "#10B981"
      },
      {
        title: "CS Career Fair",
        lc_title: "cs career fair",
        description: "Annual computer science career fair",
        startTime: new Date("2024-10-26T10:00:00").getTime(),
        endTime: new Date("2024-10-26T16:00:00").getTime(),
        type: "career_fair",
        location: "RSF Fieldhouse",
        color: "#8B5CF6"
      },
      {
        title: "Machine Learning Guest Lecture",
        lc_title: "machine learning guest lecture",
        description: "Industry expert speaking about AI in production",
        startTime: new Date("2024-10-28T13:00:00").getTime(),
        endTime: new Date("2024-10-28T14:00:00").getTime(),
        type: "lecture",
        location: "Wheeler Hall 150",
        color: "#F59E0B"
      }
    ];

    for (const event of events) {
      await ctx.db.insert("events", {
        userId,
        ...event
      });
    }

    return {
      message: "Successfully seeded data for Cameron McCullough",
      userId,
      termId,
      coursesCreated: courseIds.length,
      assignmentsCreated: assignments.length,
      eventsCreated: events.length
    };
  },
});

// Helper mutation to clear Cameron's data (for testing)
export const clearCameronData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "cameron@dreampark.dev"))
      .first();

    if (!user) {
      return { message: "Cameron's user not found" };
    }

    // Delete in reverse order to avoid foreign key issues
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    const assignments = await ctx.db
      .query("assignments")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
    for (const course of courses) {
      await ctx.db.delete(course._id);
    }

    const terms = await ctx.db
      .query("terms")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
    for (const term of terms) {
      await ctx.db.delete(term._id);
    }

    await ctx.db.delete(user._id);

    return { message: "Successfully cleared Cameron's data" };
  },
});
