import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Timestamp convention:
 * - Use epoch milliseconds (number) for all times (createdAt, dueAt, uploadedAt, softDeletedAt, purgeAt).
 * String dates (YYYY-MM-DD) are allowed only for UI-friendly fields like term start/end.
 *
 * Search convention:
 * - Store a lowercased duplicate of searchable text in `lc_*` fields so queries can
 *   filter consistently (update these server-side in create/update mutations).
 */

export default defineSchema({
  users: defineTable({
    // System & Tracking Fields
    clerkUserId: v.optional(v.string()), // renamed from clerkId for consistency
    clerkId: v.optional(v.string()), // legacy field for backward compatibility
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    
    // Profile Information
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    birthday: v.optional(v.number()), // stored as timestamp
    gender: v.optional(v.string()),
    ethnicity: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    
    // Academic Information
    school: v.optional(v.string()),
    major: v.optional(v.string()),
    majorCategory: v.optional(v.string()),
    minor: v.optional(v.string()),
    
    // GPA Tracking System
    transferGPA: v.optional(v.number()), // GPA from transfer credits
    transferCredits: v.optional(v.number()), // Number of transfer credit hours
    currentGPA: v.optional(v.number()), // Current overall GPA (including transfers)
    institutionGPA: v.optional(v.number()), // GPA from current institution only
    predictedTermGPA: v.optional(v.number()), // Calculated from current assignments
    totalCreditsEarned: v.optional(v.number()), // Total credit hours earned
    totalCreditsAttempted: v.optional(v.number()), // Total credit hours attempted
    
    // Legacy field for backward compatibility
    gpa: v.optional(v.number()),
    
    expectedGraduationDate: v.optional(v.string()), // ISO date string
    numberActiveTerms: v.optional(v.number()),
    currentActiveTerm: v.optional(v.string()), // not typed FK
    
    // User Experience & Onboarding
    hasCompletedDemographics: v.optional(v.boolean()),
    hasCompletedGuidedTour: v.optional(v.boolean()),
    
    // Usage Statistics (per user)
    totalAssignments: v.optional(v.number()),
    totalClassesEnrolled: v.optional(v.number()),
    totalSubmissions: v.optional(v.number()),
    totalTermsCreated: v.optional(v.number()),
    
    // Account-level deletion (optional for symmetry)
    softDeletedAt: v.optional(v.number()),
    purgeAt: v.optional(v.number()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_school", ["school"])
    .index("by_major", ["major"])
    .index("by_majorCategory", ["majorCategory"])
    .index("by_purgeAt", ["purgeAt"]),

  terms: defineTable({
    userId: v.id("users"),
    name: v.string(),
    startDate: v.string(), // ISO date (YYYY-MM-DD)
    endDate: v.string(),   // ISO date (YYYY-MM-DD)
    status: v.union(v.literal("past"), v.literal("current"), v.literal("future")),
    // Deletion metadata
    softDeletedAt: v.optional(v.number()),
    purgeAt: v.optional(v.number()),
    // Search helpers
    lc_name: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_purgeAt", ["purgeAt"])
    .index("by_user_name", ["userId", "lc_name"]),

  courses: defineTable({
    userId: v.id("users"),
    termId: v.id("terms"),
    title: v.string(),
    code: v.string(),
    creditHours: v.number(),
    instructor: v.optional(v.string()),
    // Optional: minimal schedule fields for "This Week" (MVP can stub)
    meetingDays: v.optional(
      v.array(
        v.union(
          v.literal("Mon"), v.literal("Tue"), v.literal("Wed"),
          v.literal("Thu"), v.literal("Fri"), v.literal("Sat"), v.literal("Sun")
        )
      )
    ),
    meetingStart: v.optional(v.string()), // "09:00"
    meetingEnd: v.optional(v.string()),   // "10:15"
    building: v.optional(v.string()),     // "Science Hall"
    room: v.optional(v.string()),         // "Room 101"
    // Deletion metadata
    softDeletedAt: v.optional(v.number()),
    purgeAt: v.optional(v.number()),
    // Search helpers
    lc_title: v.string(),
    lc_code: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_term", ["userId", "termId"])
    .index("by_user_code", ["userId", "lc_code"])
    .index("by_purgeAt", ["purgeAt"])
    .index("by_user_title", ["userId", "lc_title"]),

  assignments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    title: v.string(),
    lc_title: v.string(),
    dueAt: v.number(), // epoch ms
    status: v.union(v.literal("todo"), v.literal("done")),
    grade: v.optional(v.number()), // 0–100 (legacy field for backward compatibility)
    pointsEarned: v.optional(v.number()), // actual points earned on assignment
    pointsPossible: v.optional(v.number()), // total points possible for assignment
    gradePercentage: v.optional(v.number()), // calculated percentage (pointsEarned/pointsPossible * 100)
    notes: v.optional(v.string()),
    // Deletion metadata
    softDeletedAt: v.optional(v.number()),
    purgeAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_status_due", ["userId", "status", "dueAt"])
    .index("by_user_due", ["userId", "dueAt"])
    .index("by_user_title", ["userId", "lc_title"])
    .index("by_purgeAt", ["purgeAt"]),

  files: defineTable({
    userId: v.id("users"),
    parentType: v.union(v.literal("course"), v.literal("assignment")),
    parentId: v.union(v.id("courses"), v.id("assignments")),
    name: v.string(),
    lc_name: v.string(),
    mimeType: v.string(),
    size: v.number(),
    storageKey: v.string(),
    uploadedAt: v.number(), // epoch ms
    // Deletion metadata
    softDeletedAt: v.optional(v.number()),
    purgeAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentType", "parentId"])
    .index("by_user_name", ["userId", "lc_name"])
    .index("by_purgeAt", ["purgeAt"]),

  // Calendar events table for meetings, personal appointments, etc.
  events: defineTable({
    userId: v.id("users"),
    title: v.string(),
    lc_title: v.string(),
    type: v.union(
      v.literal("meeting"),
      v.literal("class"),
      v.literal("assignment"),
      v.literal("exam"),
      v.literal("office-hours")
    ),
    startTime: v.number(), // epoch ms
    endTime: v.optional(v.number()), // epoch ms
    isAllDay: v.optional(v.boolean()),
    color: v.string(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    courseCode: v.optional(v.string()),
    courseId: v.optional(v.id("courses")),
    meetingUrl: v.optional(v.string()),
    meetingType: v.optional(v.union(
      v.literal("google-meet"),
      v.literal("zoom"),
      v.literal("teams")
    )),
    attendees: v.optional(v.array(v.object({
      name: v.string(),
      initials: v.string(),
      avatar: v.optional(v.string())
    }))),
    // Deletion metadata
    softDeletedAt: v.optional(v.number()),
    purgeAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_time", ["userId", "startTime"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_title", ["userId", "lc_title"])
    .index("by_purgeAt", ["purgeAt"]),

  // Non-PII activity trail for debugging/metrics (keep metadata minimal)
  activityEvents: defineTable({
    userId: v.id("users"),
    type: v.string(),      // e.g., "create","update","delete","export"
    entity: v.string(),    // "term","course","assignment","file"
    entityId: v.string(),
    ts: v.number(),
    metadata: v.optional(v.object({})), // keep empty or non-PII flags only
  }).index("by_user_ts", ["userId", "ts"]),

  // User sessions tracking
  userSessions: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    isActive: v.boolean(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    device: v.optional(v.string()),
    os: v.optional(v.string()),
    browser: v.optional(v.string()),
    geoCity: v.optional(v.string()),
    geoRegion: v.optional(v.string()),
    geoCountry: v.optional(v.string()),
    referrer: v.optional(v.string()),
    source: v.optional(v.string()),
    actionsCount: v.optional(v.number()),
    pagesViewed: v.optional(v.number()),
    lastActivityAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_startedAt", ["startedAt"]),

  // Recurring user sessions (aggregated)
  recurringUserSessions: defineTable({
    userId: v.id("users"),
    window: v.string(), // e.g., "daily", "weekly", "monthly"
    periodStart: v.number(),
    periodEnd: v.number(),
    sessionsCount: v.number(),
    totalDurationSec: v.number(),
    avgSessionSec: v.number(),
    maxStreakDays: v.optional(v.number()),
    lastSeenAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_window", ["userId", "window"])
    .index("by_period", ["periodStart", "periodEnd"]),

  // Soft deleted users
  softDeletedUsers: defineTable({
    userId: v.id("users"),
    deletedAt: v.number(),
    deletedBy: v.optional(v.string()), // admin ID or "user"
    reason: v.optional(v.string()),
    snapshot: v.optional(v.object({})), // anonymized subset of user data
    email: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    gdprErasure: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .index("by_deletedAt", ["deletedAt"])
    .index("by_gdprErasure", ["gdprErasure"]),

  // Soft deleted sessions
  softDeletedSessions: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    deletedAt: v.number(),
    reason: v.optional(v.string()),
    snapshot: v.optional(v.object({})), // session metadata
  })
    .index("by_userId", ["userId"])
    .index("by_sessionId", ["sessionId"])
    .index("by_deletedAt", ["deletedAt"]),

  // Account deletions tracking
  accountDeletions: defineTable({
    userId: v.id("users"),
    requestedAt: v.number(),
    verifiedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    reason: v.optional(v.string()),
    method: v.optional(v.string()), // "user_request", "admin", "automated"
    gdprErasure: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_requestedAt", ["requestedAt"])
    .index("by_status", ["verifiedAt", "completedAt"])
    .index("by_gdprErasure", ["gdprErasure"]),

  // Aggregate retention metrics (no PII)
  retentionMetrics: defineTable({
    cohort: v.string(), // e.g., "2024-09", "fall-2024"
    school: v.optional(v.string()),
    startedAt: v.number(),
    deletedAt: v.optional(v.number()),
    lifetimeDays: v.optional(v.number()),
    graduatedEarly: v.optional(v.boolean()),
    graduatedOnTime: v.optional(v.boolean()),
    graduatedLate: v.optional(v.boolean()),
    graduatedUnknown: v.optional(v.boolean()),
    demographicsBucket: v.optional(v.string()), // anonymized demographic grouping
    counts: v.object({
      users: v.number(),
      activeUsers: v.optional(v.number()),
      retainedUsers: v.optional(v.number()),
    }),
  })
    .index("by_cohort", ["cohort"])
    .index("by_school", ["school"])
    .index("by_startedAt", ["startedAt"])
    .index("by_demographics", ["demographicsBucket"]),

  userSettings: defineTable({
    userId: v.id("users"),
    // Week preferences
    weekStartDay: v.optional(v.union(
      v.literal("Sunday"), v.literal("Monday"), v.literal("Tuesday"), 
      v.literal("Wednesday"), v.literal("Thursday"), v.literal("Friday"), v.literal("Saturday")
    )), // Default: Sunday
    
    // Dashboard layout preferences (stored as JSON string)
    dashboardLayouts: v.optional(v.object({
      dashboard: v.optional(v.string()), // JSON string of grid layout
      assignments: v.optional(v.string()), // JSON string of grid layout
      calendar: v.optional(v.string()), // JSON string of grid layout
      grades: v.optional(v.string()), // JSON string of grid layout
      files: v.optional(v.string()), // JSON string of grid layout
    })),
    
    // Display preferences
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    dateFormat: v.optional(v.union(v.literal("MM/DD/YYYY"), v.literal("DD/MM/YYYY"), v.literal("YYYY-MM-DD"))),
    timeFormat: v.optional(v.union(v.literal("12h"), v.literal("24h"))),
    
    // Notification preferences
    emailNotifications: v.optional(v.boolean()),
    dueSoonDays: v.optional(v.number()), // How many days ahead for "due soon" (default: 7)
    
    // Metadata
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"]),

  // Comprehensive metrics tracking for assignments and grades across time periods
  userClassMetrics: defineTable({
    userId: v.id("users"),
    courseId: v.optional(v.id("courses")), // null for cross-course aggregations
    termId: v.optional(v.id("terms")), // null for cross-term aggregations
    
    // Metric type - either period-based or change-tracking
    metricType: v.union(
      v.literal("period_summary"), // regular time period metrics
      v.literal("user_change_log"), // tracks changes to user fields
      v.literal("gpa_calculation") // GPA calculation snapshots
    ),
    
    // Time period definition (for period_summary type)
    periodType: v.optional(v.union(
      v.literal("daily"), v.literal("5day_week"), v.literal("7day_week"), 
      v.literal("biweekly"), v.literal("monthly"), v.literal("semester"), v.literal("school_year")
    )),
    periodStart: v.optional(v.number()), // epoch ms - start of the period
    periodEnd: v.optional(v.number()), // epoch ms - end of the period
    periodLabel: v.optional(v.string()), // human readable: "Week of Sept 9, 2024", "Fall 2024", etc.
    
    // Assignment counts
    totalAssignments: v.optional(v.number()), // total assignments due in this period
    completedAssignments: v.optional(v.number()), // assignments marked as done
    pendingAssignments: v.optional(v.number()), // assignments still todo
    overdueAssignments: v.optional(v.number()), // assignments past due and still todo
    
    // Grade metrics (only for completed assignments with grades)
    gradedAssignments: v.optional(v.number()), // count of assignments with grades
    totalPointsEarned: v.optional(v.number()), // sum of all earned points
    totalPointsPossible: v.optional(v.number()), // sum of all possible points
    averageGrade: v.optional(v.number()), // calculated average grade percentage
    highestGrade: v.optional(v.number()), // highest grade in period
    lowestGrade: v.optional(v.number()), // lowest grade in period
    
    // Grade distribution (count of assignments in each range)
    gradesA: v.optional(v.number()), // 90-100%
    gradesB: v.optional(v.number()), // 80-89%
    gradesC: v.optional(v.number()), // 70-79%
    gradesD: v.optional(v.number()), // 60-69%
    gradesF: v.optional(v.number()), // 0-59%
    
    // Workload analysis
    assignmentsPerDay: v.optional(v.object({
      monday: v.number(),
      tuesday: v.number(),
      wednesday: v.number(),
      thursday: v.number(),
      friday: v.number(),
      saturday: v.optional(v.number()), // only for 7day periods
      sunday: v.optional(v.number()), // only for 7day periods
    })),
    
    // Performance trends (compared to previous similar period)
    gradeImprovement: v.optional(v.number()), // percentage point change from previous period
    completionRateImprovement: v.optional(v.number()), // percentage point change in completion rate
    
    // User metrics change tracking (for user_change_log type)
    changeType: v.optional(v.union(
      v.literal("total_assignments"), v.literal("total_classes_enrolled"), 
      v.literal("total_submissions"), v.literal("total_terms_created"),
      v.literal("transfer_gpa"), v.literal("current_gpa"), v.literal("institution_gpa"),
      v.literal("predicted_term_gpa"), v.literal("total_credits_earned"), v.literal("total_credits_attempted")
    )),
    previousValue: v.optional(v.union(v.number(), v.string(), v.null())), // previous value
    newValue: v.optional(v.union(v.number(), v.string(), v.null())), // new value
    changeReason: v.optional(v.string()), // reason for change (e.g., "assignment_completed", "grade_updated", "manual_entry")
    
    // GPA Calculations (for gpa_calculation type)
    gpaData: v.optional(v.object({
      transferGPA: v.optional(v.number()),
      transferCredits: v.optional(v.number()),
      currentGPA: v.optional(v.number()),
      institutionGPA: v.optional(v.number()),
      predictedTermGPA: v.optional(v.number()),
      totalCreditsEarned: v.optional(v.number()),
      totalCreditsAttempted: v.optional(v.number()),
      termCreditsEarned: v.optional(v.number()), // credits earned this term
      termPointsEarned: v.optional(v.number()), // grade points earned this term
      calculationMethod: v.optional(v.string()), // how GPA was calculated
    })),
    
    // Metadata
    calculatedAt: v.number(), // when this metric was last calculated
    isComplete: v.optional(v.boolean()), // false for current/ongoing periods, true for past periods
    
    // Soft delete support
    softDeletedAt: v.optional(v.number()),
    purgeAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_metric_type", ["userId", "metricType"])
    .index("by_user_period", ["userId", "periodType"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_term", ["userId", "termId"])
    .index("by_user_course_period", ["userId", "courseId", "periodType"])
    .index("by_period_range", ["userId", "periodStart", "periodEnd"])
    .index("by_user_change_type", ["userId", "changeType"])
    .index("by_calculated", ["calculatedAt"])
    .index("by_purgeAt", ["purgeAt"]),
});