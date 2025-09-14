import { mutation } from "./_generated/server";

export const updateTermsToCurrentYear = mutation({
  handler: async (ctx) => {
    console.log("🔄 Updating terms to current academic year (2025-2026)...");

    // Find the demo user
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), "demo@northstar.edu"))
      .first();

    if (!user) {
      throw new Error("Demo user not found. Run seed.ts first.");
    }

    // Find existing terms
    const fallTerm = await ctx.db
      .query("terms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.and(
        q.eq(q.field("name"), "Fall 2024"),
        q.eq(q.field("softDeletedAt"), undefined)
      ))
      .first();

    const springTerm = await ctx.db
      .query("terms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.and(
        q.eq(q.field("name"), "Spring 2025"),
        q.eq(q.field("softDeletedAt"), undefined)
      ))
      .first();

    if (!fallTerm || !springTerm) {
      throw new Error("Required terms not found. Expected Fall 2024 and Spring 2025.");
    }

    // Update Fall 2024 -> Fall 2025 (current term)
    await ctx.db.patch(fallTerm._id, {
      name: "Fall 2025",
      startDate: "2025-08-26", // August 26, 2025
      endDate: "2025-12-15",   // December 15, 2025
      status: "current" as const,
      lc_name: "fall 2025"
    });

    // Update Spring 2025 -> Spring 2026 (future term)
    await ctx.db.patch(springTerm._id, {
      name: "Spring 2026", 
      startDate: "2026-01-13", // January 13, 2026
      endDate: "2026-05-10",   // May 10, 2026
      status: "future" as const,
      lc_name: "spring 2026"
    });

    console.log("✅ Updated Fall 2024 -> Fall 2025 (current)");
    console.log("✅ Updated Spring 2025 -> Spring 2026 (future)");

    // Get updated course counts for verification
    const fallCourses = await ctx.db
      .query("courses")
      .withIndex("by_user_term", (q) => q.eq("userId", user._id).eq("termId", fallTerm._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();

    const springCourses = await ctx.db
      .query("courses")
      .withIndex("by_user_term", (q) => q.eq("userId", user._id).eq("termId", springTerm._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();

    console.log(`📚 Fall 2025 now has ${fallCourses.length} courses:`);
    fallCourses.forEach(course => {
      console.log(`  - ${course.code}: ${course.title}`);
      console.log(`    Meeting: ${course.meetingDays?.join(', ')} ${course.meetingStart}-${course.meetingEnd}`);
    });

    console.log(`📚 Spring 2026 now has ${springCourses.length} courses:`);
    springCourses.forEach(course => {
      console.log(`  - ${course.code}: ${course.title}`);
    });

    return {
      success: true,
      message: "Terms updated to current academic year",
      data: {
        fallTerm: {
          id: fallTerm._id,
          name: "Fall 2025",
          courseCount: fallCourses.length
        },
        springTerm: {
          id: springTerm._id,
          name: "Spring 2026", 
          courseCount: springCourses.length
        }
      }
    };
  },
});

export const verifyTermUpdate = mutation({
  handler: async (ctx) => {
    console.log("🔍 Verifying term updates...");

    // Find the demo user
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), "demo@northstar.edu"))
      .first();

    if (!user) {
      throw new Error("Demo user not found.");
    }

    // Get all terms
    const terms = await ctx.db
      .query("terms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();

    console.log("📅 Current terms:");
    terms.forEach(term => {
      console.log(`  ${term.name}: ${term.startDate} to ${term.endDate} (${term.status})`);
    });

    // Get current term courses with meeting details
    const currentTerm = terms.find(t => t.status === "current");
    if (currentTerm) {
      const courses = await ctx.db
        .query("courses")
        .withIndex("by_user_term", (q) => q.eq("userId", user._id).eq("termId", currentTerm._id))
        .filter(q => q.eq(q.field("softDeletedAt"), undefined))
        .collect();

      console.log(`\n📚 Current term (${currentTerm.name}) courses:`);
      courses.forEach(course => {
        console.log(`  ${course.code}: ${course.title}`);
        console.log(`    Days: ${course.meetingDays?.join(', ') || 'Not set'}`);
        console.log(`    Time: ${course.meetingStart || 'Not set'} - ${course.meetingEnd || 'Not set'}`);
        console.log(`    Instructor: ${course.instructor || 'Not set'}`);
      });
    }

    return {
      success: true,
      terms: terms.map(t => ({
        name: t.name,
        startDate: t.startDate,
        endDate: t.endDate,
        status: t.status
      }))
    };
  },
});