import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Helper function to get period boundaries
function getPeriodBoundaries(periodType: string, referenceDate: Date, weekStartDay = "Sunday") {
  const date = new Date(referenceDate);
  
  switch (periodType) {
    case "daily": {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { start: start.getTime(), end: end.getTime() };
    }
    
    case "5day_week": {
      // Monday to Friday
      const start = new Date(date);
      const dayOfWeek = start.getDay();
      const daysToMonday = (dayOfWeek + 6) % 7; // Convert to Monday=0 system
      start.setDate(start.getDate() - daysToMonday);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 4); // Friday
      end.setHours(23, 59, 59, 999);
      
      return { start: start.getTime(), end: end.getTime() };
    }
    
    case "7day_week": {
      // Full week based on weekStartDay preference
      const start = new Date(date);
      const dayOfWeek = start.getDay();
      const weekStartMap = {
        "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
        "Thursday": 4, "Friday": 5, "Saturday": 6
      };
      const startDayOffset = weekStartMap[weekStartDay as keyof typeof weekStartMap] || 0;
      const daysToSubtract = (dayOfWeek - startDayOffset + 7) % 7;
      start.setDate(start.getDate() - daysToSubtract);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      return { start: start.getTime(), end: end.getTime() };
    }
    
    case "biweekly": {
      // 14-day period starting from Monday
      const start = new Date(date);
      const dayOfWeek = start.getDay();
      const daysToMonday = (dayOfWeek + 6) % 7;
      start.setDate(start.getDate() - daysToMonday);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 13); // 14 days total
      end.setHours(23, 59, 59, 999);
      
      return { start: start.getTime(), end: end.getTime() };
    }
    
    case "monthly": {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: start.getTime(), end: end.getTime() };
    }
    
    case "semester": {
      // This would need to be based on term dates from the database
      // For now, we'll use a placeholder implementation
      const start = new Date(date.getFullYear(), date.getMonth() < 6 ? 0 : 6, 1);
      const end = new Date(date.getFullYear(), date.getMonth() < 6 ? 5 : 11, 0, 23, 59, 59, 999);
      return { start: start.getTime(), end: end.getTime() };
    }
    
    case "school_year": {
      // Academic year: August to July
      const year = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
      const start = new Date(year, 7, 1); // August 1st
      const end = new Date(year + 1, 6, 31, 23, 59, 59, 999); // July 31st
      return { start: start.getTime(), end: end.getTime() };
    }
    
    default:
      throw new Error(`Invalid period type: ${periodType}`);
  }
}

// Helper function to generate period label
function generatePeriodLabel(periodType: string, periodStart: number): string {
  const date = new Date(periodStart);
  
  switch (periodType) {
    case "daily":
      return date.toLocaleDateString("en-US", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    
    case "5day_week":
      return `Week of ${date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      })} (M-F)`;
    
    case "7day_week":
      return `Week of ${date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      })}`;
    
    case "biweekly":
      const endDate = new Date(periodStart + 13 * 24 * 60 * 60 * 1000);
      return `${date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      })} - ${endDate.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      })}`;
    
    case "monthly":
      return date.toLocaleDateString("en-US", { 
        month: "long", 
        year: "numeric" 
      });
    
    case "semester":
      const month = date.getMonth();
      const season = month < 6 ? "Spring" : "Fall";
      return `${season} ${date.getFullYear()}`;
    
    case "school_year":
      return `${date.getFullYear()}-${date.getFullYear() + 1} Academic Year`;
    
    default:
      return "Unknown Period";
  }
}

// Helper function to get day of week from timestamp
function getDayOfWeek(timestamp: number): string {
  const date = new Date(timestamp);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()];
}

// Helper function to categorize grade
function categorizeGrade(percentage: number): { gradesA: number, gradesB: number, gradesC: number, gradesD: number, gradesF: number } {
  const result = { gradesA: 0, gradesB: 0, gradesC: 0, gradesD: 0, gradesF: 0 };
  
  if (percentage >= 90) result.gradesA = 1;
  else if (percentage >= 80) result.gradesB = 1;
  else if (percentage >= 70) result.gradesC = 1;
  else if (percentage >= 60) result.gradesD = 1;
  else result.gradesF = 1;
  
  return result;
}

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

// Helper function to convert percentage to GPA points (4.0 scale)
function percentageToGPA(percentage: number): number {
  if (percentage >= 97) return 4.0;
  if (percentage >= 93) return 3.7;
  if (percentage >= 90) return 3.3;
  if (percentage >= 87) return 3.0;
  if (percentage >= 83) return 2.7;
  if (percentage >= 80) return 2.3;
  if (percentage >= 77) return 2.0;
  if (percentage >= 73) return 1.7;
  if (percentage >= 70) return 1.3;
  if (percentage >= 67) return 1.0;
  if (percentage >= 65) return 0.7;
  return 0.0;
}

// Helper function to calculate weighted GPA
function calculateWeightedGPA(
  transferGPA: number = 0,
  transferCredits: number = 0,
  institutionGPA: number = 0,
  institutionCredits: number = 0
): number {
  const totalCredits = transferCredits + institutionCredits;
  if (totalCredits === 0) return 0;
  
  const transferPoints = transferGPA * transferCredits;
  const institutionPoints = institutionGPA * institutionCredits;
  const totalPoints = transferPoints + institutionPoints;
  
  return totalPoints / totalCredits;
}

// Calculate metrics for a specific user, course, and time period
export const calculateMetrics = mutation({
  args: {
    userId: v.optional(v.id("users")),
    courseId: v.optional(v.id("courses")),
    termId: v.optional(v.id("terms")),
    periodType: v.union(
      v.literal("daily"), v.literal("5day_week"), v.literal("7day_week"), 
      v.literal("biweekly"), v.literal("monthly"), v.literal("semester"), v.literal("school_year")
    ),
    referenceDate: v.optional(v.number()), // timestamp, defaults to now
    weekStartDay: v.optional(v.string()), // for week calculations
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) throw new Error("Authentication required");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    const userId = args.userId || user._id;
    const referenceDate = new Date(args.referenceDate || Date.now());
    const weekStartDay = args.weekStartDay || "Sunday";

    // Calculate period boundaries
    const { start: periodStart, end: periodEnd } = getPeriodBoundaries(
      args.periodType, 
      referenceDate, 
      weekStartDay
    );

    // Build query for assignments in this period
    let assignmentsQuery = ctx.db
      .query("assignments")
      .withIndex("by_user_due", (q) => 
        q.eq("userId", userId)
         .gte("dueAt", periodStart)
         .lte("dueAt", periodEnd)
      )
      .filter(q => q.eq(q.field("softDeletedAt"), undefined));

    const assignments = await assignmentsQuery.collect();

    // Filter by course if specified
    const filteredAssignments = args.courseId 
      ? assignments.filter(a => a.courseId === args.courseId)
      : assignments;

    // Initialize metrics
    const metrics = {
      userId,
      courseId: args.courseId,
      termId: args.termId,
      metricType: "period_summary" as const,
      periodType: args.periodType,
      periodStart,
      periodEnd,
      periodLabel: generatePeriodLabel(args.periodType, periodStart),
      
      totalAssignments: filteredAssignments.length,
      completedAssignments: 0,
      pendingAssignments: 0,
      overdueAssignments: 0,
      
      gradedAssignments: 0,
      totalPointsEarned: 0,
      totalPointsPossible: 0,
      averageGrade: undefined as number | undefined,
      highestGrade: undefined as number | undefined,
      lowestGrade: undefined as number | undefined,
      
      gradesA: 0,
      gradesB: 0,
      gradesC: 0,
      gradesD: 0,
      gradesF: 0,
      
      assignmentsPerDay: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: args.periodType === "7day_week" ? 0 : undefined,
        sunday: args.periodType === "7day_week" ? 0 : undefined,
      },
      
      gradeImprovement: undefined as number | undefined,
      completionRateImprovement: undefined as number | undefined,
      
      calculatedAt: Date.now(),
      isComplete: periodEnd < Date.now(),
      
      softDeletedAt: undefined,
      purgeAt: undefined,
    };

    const now = Date.now();
    const grades: number[] = [];

    // Process each assignment
    for (const assignment of filteredAssignments) {
      // Count by status
      if (assignment.status === "done") {
        metrics.completedAssignments++;
      } else {
        metrics.pendingAssignments++;
        if (assignment.dueAt < now) {
          metrics.overdueAssignments++;
        }
      }

      // Count by day of week
      const dayOfWeek = getDayOfWeek(assignment.dueAt);
      if (dayOfWeek in metrics.assignmentsPerDay) {
        (metrics.assignmentsPerDay as any)[dayOfWeek]++;
      }

      // Process grades (prioritize new point system, fallback to legacy grade)
      let gradePercentage: number | undefined;
      
      if (assignment.pointsEarned !== undefined && assignment.pointsPossible !== undefined && assignment.pointsPossible > 0) {
        gradePercentage = (assignment.pointsEarned / assignment.pointsPossible) * 100;
        metrics.totalPointsEarned += assignment.pointsEarned;
        metrics.totalPointsPossible += assignment.pointsPossible;
      } else if (assignment.grade !== undefined) {
        gradePercentage = assignment.grade;
        // For legacy grades, assume they're out of 100 points
        metrics.totalPointsEarned += assignment.grade;
        metrics.totalPointsPossible += 100;
      }

      if (gradePercentage !== undefined) {
        metrics.gradedAssignments++;
        grades.push(gradePercentage);
        
        // Track highest/lowest
        if (metrics.highestGrade === undefined || gradePercentage > metrics.highestGrade) {
          metrics.highestGrade = gradePercentage;
        }
        if (metrics.lowestGrade === undefined || gradePercentage < metrics.lowestGrade) {
          metrics.lowestGrade = gradePercentage;
        }
        
        // Categorize grade
        const gradeCategory = categorizeGrade(gradePercentage);
        metrics.gradesA += gradeCategory.gradesA;
        metrics.gradesB += gradeCategory.gradesB;
        metrics.gradesC += gradeCategory.gradesC;
        metrics.gradesD += gradeCategory.gradesD;
        metrics.gradesF += gradeCategory.gradesF;
      }
    }

    // Calculate average grade
    if (grades.length > 0) {
      metrics.averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    }

    // Check if metrics already exist for this period
    const existingMetrics = await ctx.db
      .query("userClassMetrics")
      .withIndex("by_period_range", (q) => 
        q.eq("userId", userId)
         .eq("periodStart", periodStart)
         .eq("periodEnd", periodEnd)
      )
      .filter(q => q.and(
        q.eq(q.field("courseId"), args.courseId),
        q.eq(q.field("periodType"), args.periodType),
        q.eq(q.field("softDeletedAt"), undefined)
      ))
      .first();

    if (existingMetrics) {
      // Update existing metrics
      return await ctx.db.patch(existingMetrics._id, metrics);
    } else {
      // Create new metrics record
      return await ctx.db.insert("userClassMetrics", metrics);
    }
  },
});

// Get metrics for a specific period
export const getMetrics = query({
  args: {
    courseId: v.optional(v.id("courses")),
    termId: v.optional(v.id("terms")),
    periodType: v.union(
      v.literal("daily"), v.literal("5day_week"), v.literal("7day_week"), 
      v.literal("biweekly"), v.literal("monthly"), v.literal("semester"), v.literal("school_year")
    ),
    periodStart: v.optional(v.number()),
    periodEnd: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let user;
    if (identity) {
      // Authenticated user
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .first();
      
      if (!user) return [];
    } else {
      // Demo/unauthenticated mode - use first user
      user = await ctx.db
        .query("users")
        .first();
      
      if (!user) return [];
    }

    let query = ctx.db
      .query("userClassMetrics")
      .withIndex("by_user_period", (q) => q.eq("userId", user._id).eq("periodType", args.periodType))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined));

    if (args.courseId) {
      query = query.filter(q => q.eq(q.field("courseId"), args.courseId));
    }

    if (args.termId) {
      query = query.filter(q => q.eq(q.field("termId"), args.termId));
    }

    if (args.periodStart && args.periodEnd) {
      query = query.filter(q => q.and(
        q.gte(q.field("periodStart"), args.periodStart!),
        q.lte(q.field("periodEnd"), args.periodEnd!)
      ));
    }

    query = (query as any).order("desc"); // Most recent first

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Bulk calculate metrics for all active periods
export const calculateAllMetrics = mutation({
  args: {
    userId: v.optional(v.id("users")),
    weekStartDay: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) throw new Error("Authentication required");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    const userId = args.userId || user._id;
    const now = Date.now();
    const weekStartDay = args.weekStartDay || "Sunday";

    // Get all user's courses to calculate course-specific metrics
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();

    const periodTypes = ["daily", "5day_week", "7day_week", "biweekly", "monthly", "semester", "school_year"] as const;
    const results = [];

    // Calculate overall metrics (across all courses)
    for (const periodType of periodTypes) {
      try {
        const result: any = await ctx.runMutation(api.userClassMetrics.calculateMetrics, {
          userId,
          periodType,
          referenceDate: now,
          weekStartDay,
        });
        results.push({ type: "overall", periodType, result });
      } catch (error) {
        console.error(`Error calculating overall ${periodType} metrics:`, error);
      }
    }

    // Calculate course-specific metrics
    for (const course of courses) {
      for (const periodType of periodTypes) {
        try {
          const result: any = await ctx.runMutation(api.userClassMetrics.calculateMetrics, {
            userId,
            courseId: course._id,
            termId: course.termId,
            periodType,
            referenceDate: now,
            weekStartDay,
          });
          results.push({ type: "course", courseId: course._id, periodType, result });
        } catch (error) {
          console.error(`Error calculating ${periodType} metrics for course ${course._id}:`, error);
        }
      }
    }

    return results;
  },
});

// Get summary statistics across all periods
export const getSummaryStats = query({
  args: {
    courseId: v.optional(v.id("courses")),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let user;
    if (identity) {
      // Authenticated user
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .first();
      
      if (!user) return null;
    } else {
      // Demo/unauthenticated mode - use first user
      user = await ctx.db
        .query("users")
        .first();
      
      if (!user) return null;
    }

    let query = ctx.db
      .query("userClassMetrics")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined));

    if (args.courseId) {
      query = query.filter(q => q.eq(q.field("courseId"), args.courseId));
    }

    if (args.termId) {
      query = query.filter(q => q.eq(q.field("termId"), args.termId));
    }

    const allMetrics = await query.collect();

    if (allMetrics.length === 0) {
      return null;
    }

    // Calculate summary statistics
    const summary = {
      totalPeriods: allMetrics.length,
      totalAssignments: 0,
      totalCompletedAssignments: 0,
      totalGradedAssignments: 0,
      overallAverageGrade: 0,
      bestPeriodGrade: 0,
      worstPeriodGrade: 100,
      gradeDistribution: {
        gradesA: 0,
        gradesB: 0,
        gradesC: 0,
        gradesD: 0,
        gradesF: 0,
      },
      periodTypeBreakdown: {} as Record<string, number>,
    };

    let totalGradeSum = 0;
    let periodsWithGrades = 0;

    for (const metric of allMetrics) {
      summary.totalAssignments += metric.totalAssignments || 0;
      summary.totalCompletedAssignments += metric.completedAssignments || 0;
      summary.totalGradedAssignments += metric.gradedAssignments || 0;
      
      summary.gradeDistribution.gradesA += metric.gradesA || 0;
      summary.gradeDistribution.gradesB += metric.gradesB || 0;
      summary.gradeDistribution.gradesC += metric.gradesC || 0;
      summary.gradeDistribution.gradesD += metric.gradesD || 0;
      summary.gradeDistribution.gradesF += metric.gradesF || 0;

      // Track period types
      if (metric.periodType) {
        summary.periodTypeBreakdown[metric.periodType] = 
          (summary.periodTypeBreakdown[metric.periodType] || 0) + 1;
      }

      if (metric.averageGrade !== undefined) {
        totalGradeSum += metric.averageGrade;
        periodsWithGrades++;
        
        if (metric.averageGrade > summary.bestPeriodGrade) {
          summary.bestPeriodGrade = metric.averageGrade;
        }
        if (metric.averageGrade < summary.worstPeriodGrade) {
          summary.worstPeriodGrade = metric.averageGrade;
        }
      }
    }

    if (periodsWithGrades > 0) {
      summary.overallAverageGrade = totalGradeSum / periodsWithGrades;
    }

    return summary;
  },
});

// Calculate and update user GPA based on current assignments
export const calculateUserGPA = mutation({
  args: {
    userId: v.optional(v.id("users")),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) throw new Error("Authentication required");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    const userId = args.userId || user._id;
    const currentUser = await ctx.db.get(userId);
    if (!currentUser) throw new Error("Target user not found");

    // Get all completed assignments with grades
    let assignmentsQuery = ctx.db
      .query("assignments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter(q => q.and(
        q.eq(q.field("status"), "done"),
        q.eq(q.field("softDeletedAt"), undefined)
      ));

    const assignments = await assignmentsQuery.collect();

    // Get courses to calculate credit hours
    const courseIds = [...new Set(assignments.map(a => a.courseId))];
    const courses = await Promise.all(courseIds.map(id => ctx.db.get(id)));
    const validCourses = courses.filter(c => c && !c.softDeletedAt);

    // Filter assignments by term if specified
    let filteredAssignments = assignments;
    if (args.termId) {
      const termCourses = validCourses.filter(c => c?.termId === args.termId);
      const termCourseIds = new Set(termCourses.map(c => c!._id));
      filteredAssignments = assignments.filter(a => termCourseIds.has(a.courseId));
    }

    // Calculate term GPA from assignments
    let totalGradePoints = 0;
    let totalCredits = 0;
    const courseGrades: Record<string, { points: number; credits: number; count: number }> = {};

    for (const assignment of filteredAssignments) {
      const course = validCourses.find(c => c?._id === assignment.courseId);
      if (!course) continue;

      let gradePercentage: number | undefined;
      
      // Get grade percentage (prioritize calculated percentage, then points, then legacy grade)
      if (assignment.gradePercentage !== undefined) {
        gradePercentage = assignment.gradePercentage;
      } else if (assignment.pointsEarned !== undefined && assignment.pointsPossible !== undefined && assignment.pointsPossible > 0) {
        gradePercentage = (assignment.pointsEarned / assignment.pointsPossible) * 100;
      } else if (assignment.grade !== undefined) {
        gradePercentage = assignment.grade;
      }

      if (gradePercentage === undefined) continue;

      const gpaPoints = percentageToGPA(gradePercentage);
      const courseId = course._id;

      if (!courseGrades[courseId]) {
        courseGrades[courseId] = { points: 0, credits: course.creditHours, count: 0 };
      }
      
      courseGrades[courseId].points += gpaPoints;
      courseGrades[courseId].count++;
    }

    // Calculate average GPA per course, then weight by credit hours
    for (const courseData of Object.values(courseGrades)) {
      if (courseData.count > 0) {
        const avgCourseGPA = courseData.points / courseData.count;
        totalGradePoints += avgCourseGPA * courseData.credits;
        totalCredits += courseData.credits;
      }
    }

    const predictedTermGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Calculate overall GPA including transfers
    const transferGPA = currentUser.transferGPA || 0;
    const transferCredits = currentUser.transferCredits || 0;
    const currentInstitutionCredits = totalCredits;
    
    // Get existing institution GPA or use predicted term GPA
    let institutionGPA = currentUser.institutionGPA || predictedTermGPA;
    
    // If this is a new calculation and we have more current data, update institution GPA
    if (totalCredits > 0) {
      institutionGPA = predictedTermGPA; // Use current calculation
    }

    const overallGPA = calculateWeightedGPA(
      transferGPA,
      transferCredits,
      institutionGPA,
      currentInstitutionCredits
    );

    // Store GPA calculation snapshot
    const gpaCalculation = {
      userId,
      termId: args.termId,
      metricType: "gpa_calculation" as const,
      gpaData: {
        transferGPA,
        transferCredits,
        currentGPA: overallGPA,
        institutionGPA,
        predictedTermGPA,
        totalCreditsEarned: transferCredits + currentInstitutionCredits,
        totalCreditsAttempted: transferCredits + currentInstitutionCredits,
        termCreditsEarned: totalCredits,
        termPointsEarned: totalGradePoints,
        calculationMethod: "assignment_based",
      },
      calculatedAt: Date.now(),
    };

    await ctx.db.insert("userClassMetrics", gpaCalculation);

    // Update user record if values have changed
    const updates: any = {};
    
    if (Math.abs((currentUser.predictedTermGPA || 0) - predictedTermGPA) > 0.01) {
      updates.predictedTermGPA = predictedTermGPA;
      await logUserMetricChange(ctx, userId, "predicted_term_gpa", currentUser.predictedTermGPA, predictedTermGPA, "assignment_grades_updated");
    }
    
    if (Math.abs((currentUser.institutionGPA || 0) - institutionGPA) > 0.01) {
      updates.institutionGPA = institutionGPA;
      await logUserMetricChange(ctx, userId, "institution_gpa", currentUser.institutionGPA, institutionGPA, "assignment_grades_updated");
    }
    
    if (Math.abs((currentUser.currentGPA || 0) - overallGPA) > 0.01) {
      updates.currentGPA = overallGPA;
      await logUserMetricChange(ctx, userId, "current_gpa", currentUser.currentGPA, overallGPA, "assignment_grades_updated");
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await ctx.db.patch(userId, updates);
    }

    return {
      transferGPA,
      transferCredits,
      currentGPA: overallGPA,
      institutionGPA,
      predictedTermGPA,
      totalCreditsEarned: transferCredits + currentInstitutionCredits,
      calculationId: gpaCalculation,
    };
  },
});

// Update user metrics and log changes
export const updateUserMetrics = mutation({
  args: {
    userId: v.optional(v.id("users")),
    updates: v.object({
      totalAssignments: v.optional(v.number()),
      totalClassesEnrolled: v.optional(v.number()),
      totalSubmissions: v.optional(v.number()),
      totalTermsCreated: v.optional(v.number()),
      transferGPA: v.optional(v.number()),
      transferCredits: v.optional(v.number()),
      currentGPA: v.optional(v.number()),
      institutionGPA: v.optional(v.number()),
      totalCreditsEarned: v.optional(v.number()),
      totalCreditsAttempted: v.optional(v.number()),
    }),
    changeReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) throw new Error("Authentication required");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    const userId = args.userId || user._id;
    const currentUser = await ctx.db.get(userId);
    if (!currentUser) throw new Error("Target user not found");

    const changeReason = args.changeReason || "manual_update";
    const updates: any = { updatedAt: Date.now() };

    // Track each change and log it
    for (const [key, newValue] of Object.entries(args.updates)) {
      if (newValue !== undefined) {
        const currentValue = (currentUser as any)[key];
        
        if (currentValue !== newValue) {
          updates[key] = newValue;
          
          // Map field names to change types
          const changeTypeMap: Record<string, string> = {
            totalAssignments: "total_assignments",
            totalClassesEnrolled: "total_classes_enrolled",
            totalSubmissions: "total_submissions",
            totalTermsCreated: "total_terms_created",
            transferGPA: "transfer_gpa",
            currentGPA: "current_gpa",
            institutionGPA: "institution_gpa",
            totalCreditsEarned: "total_credits_earned",
            totalCreditsAttempted: "total_credits_attempted",
          };

          const changeType = changeTypeMap[key];
          if (changeType) {
            await logUserMetricChange(ctx, userId, changeType, currentValue, newValue, changeReason);
          }
        }
      }
    }

    // Update user record if there are changes
    if (Object.keys(updates).length > 1) { // More than just updatedAt
      await ctx.db.patch(userId, updates);
    }

    return updates;
  },
});

// Get user metric change history
export const getUserChangeHistory = query({
  args: {
    userId: v.optional(v.id("users")),
    changeType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let user;
    if (identity) {
      // Authenticated user
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .first();
      
      if (!user) return [];
    } else {
      // Demo/unauthenticated mode - use first user
      user = await ctx.db
        .query("users")
        .first();
      
      if (!user) return [];
    }

    const userId = args.userId || user._id;

    let query = ctx.db
      .query("userClassMetrics")
      .withIndex("by_user_metric_type", (q) => q.eq("userId", userId).eq("metricType", "user_change_log"))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined));

    if (args.changeType) {
      query = query.filter(q => q.eq(q.field("changeType"), args.changeType));
    }

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Complete a term and update credit tracking
export const completeTerm = mutation({
  args: {
    termId: v.id("terms"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let user;
    if (identity) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .first();
      
      if (!user) throw new Error("User not found");
    } else {
      user = await ctx.db
        .query("users")
        .first();
      
      if (!user) throw new Error("User not found");
    }

    const userId = args.userId || user._id;
    const currentUser = await ctx.db.get(userId);
    if (!currentUser) throw new Error("User not found");

    // Get the term
    const term = await ctx.db.get(args.termId);
    if (!term || term.userId !== userId) {
      throw new Error("Term not found or unauthorized");
    }

    // Calculate GPA for this specific term
    const termGPA: any = await ctx.runMutation(api.userClassMetrics.calculateUserGPA, { userId, termId: args.termId });
    
    // Get courses for this term to calculate credit hours
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter(q => q.and(
        q.eq(q.field("termId"), args.termId),
        q.eq(q.field("softDeletedAt"), undefined)
      ))
      .collect();

    const termCredits = courses.reduce((total, course) => total + (course.creditHours || 0), 0);
    
    // Update user's credit tracking
    const previousCreditsEarned = currentUser.totalCreditsEarned || 0;
    const previousCreditsAttempted = currentUser.totalCreditsAttempted || 0;
    const transferCredits = currentUser.transferCredits || 0;
    
    // When a term completes, add the term credits to the total
    const newTotalCreditsEarned = previousCreditsEarned + termCredits;
    const newTotalCreditsAttempted = previousCreditsAttempted + termCredits;
    
    // Update the user record
    await ctx.db.patch(userId, {
      totalCreditsEarned: newTotalCreditsEarned,
      totalCreditsAttempted: newTotalCreditsAttempted,
      institutionGPA: termGPA.institutionGPA,
      currentGPA: termGPA.currentGPA,
      updatedAt: Date.now(),
    });

    // Mark the term as past (completed)
    await ctx.db.patch(args.termId, {
      status: "past" as const,
    });

    // Log the term completion
    await logUserMetricChange(
      ctx, 
      userId, 
      "term_completed", 
      term.status, 
      "completed", 
      `Completed term ${term.name} with ${termCredits} credits`
    );

    return {
      termId: args.termId,
      termCredits,
      newTotalCreditsEarned,
      newTotalCreditsAttempted,
      termGPA: termGPA.institutionGPA,
      overallGPA: termGPA.currentGPA,
    };
  },
});

// Get total credits for current semester (in progress)
export const getCurrentSemesterCredits = query({
  args: {
    userId: v.optional(v.id("users")),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let user;
    if (identity) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .first();
      
      if (!user) return { currentSemesterCredits: 0, totalCreditsEarned: 0 };
    } else {
      user = await ctx.db
        .query("users")
        .first();
      
      if (!user) return { currentSemesterCredits: 0, totalCreditsEarned: 0 };
    }

    const userId = args.userId || user._id;
    
    // Get current term if not specified
    let termId = args.termId;
    if (!termId) {
      const currentTerm = await ctx.db
        .query("terms")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter(q => q.eq(q.field("status"), "current"))
        .first();
      termId = currentTerm?._id;
    }

    if (!termId) {
      return { currentSemesterCredits: 0, totalCreditsEarned: user.totalCreditsEarned || 0 };
    }

    // Get courses for current term
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter(q => q.and(
        q.eq(q.field("termId"), termId),
        q.eq(q.field("softDeletedAt"), undefined)
      ))
      .collect();

    const currentSemesterCredits = courses.reduce((total, course) => total + (course.creditHours || 0), 0);
    const totalCreditsEarned = (user.totalCreditsEarned || 0) + currentSemesterCredits;

    return {
      currentSemesterCredits,
      totalCreditsEarned,
      previousCreditsEarned: user.totalCreditsEarned || 0,
      transferCredits: user.transferCredits || 0,
    };
  },
});

// Get GPA calculation history
export const getGPAHistory = query({
  args: {
    userId: v.optional(v.id("users")),
    termId: v.optional(v.id("terms")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let user;
    if (identity) {
      // Authenticated user
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .first();
      
      if (!user) return [];
    } else {
      // Demo/unauthenticated mode - use first user
      user = await ctx.db
        .query("users")
        .first();
      
      if (!user) return [];
    }

    const userId = args.userId || user._id;

    let query = ctx.db
      .query("userClassMetrics")
      .withIndex("by_user_metric_type", (q) => q.eq("userId", userId).eq("metricType", "gpa_calculation"))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined));

    if (args.termId) {
      query = query.filter(q => q.eq(q.field("termId"), args.termId));
    }

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});
