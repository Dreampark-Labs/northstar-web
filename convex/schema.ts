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
    clerkId: v.string(),
    email: v.string(),
    createdAt: v.number(),
    // Account-level deletion (optional for symmetry)
    softDeletedAt: v.optional(v.number()),
    purgeAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
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
    grade: v.optional(v.number()), // 0–100
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

  // Non-PII activity trail for debugging/metrics (keep metadata minimal)
  activityEvents: defineTable({
    userId: v.id("users"),
    type: v.string(),      // e.g., "create","update","delete","export"
    entity: v.string(),    // "term","course","assignment","file"
    entityId: v.string(),
    ts: v.number(),
    metadata: v.optional(v.object({})), // keep empty or non-PII flags only
  }).index("by_user_ts", ["userId", "ts"]),

  // Aggregate retention metrics (no PII)
  retentionMetrics: defineTable({
    userId: v.id("users"),
    firstSeenAt: v.number(),
    lastActiveAt: v.number(),
    daysUsed: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});