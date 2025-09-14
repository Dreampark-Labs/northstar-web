import { v } from "convex/values";

export const termValidator = v.object({
  name: v.string(),
  startDate: v.string(), // ISO date (YYYY-MM-DD)
  endDate: v.string(),   // ISO date (YYYY-MM-DD)
  status: v.union(v.literal("past"), v.literal("current"), v.literal("future")),
});

export const courseValidator = v.object({
  termId: v.id("terms"),
  title: v.string(),
  code: v.string(),
  creditHours: v.number(),
  instructor: v.string(),
  meetingDays: v.optional(
    v.array(
      v.union(
        v.literal("Mon"), v.literal("Tue"), v.literal("Wed"),
        v.literal("Thu"), v.literal("Fri"), v.literal("Sat"), v.literal("Sun")
      )
    )
  ),
  meetingStart: v.optional(v.string()),
  meetingEnd: v.optional(v.string()),
  building: v.optional(v.string()),
  room: v.optional(v.string()),
});

export const assignmentValidator = v.object({
  courseId: v.id("courses"),
  title: v.string(),
  dueAt: v.number(),
  status: v.union(v.literal("todo"), v.literal("done")),
  grade: v.optional(v.number()), // legacy field for backward compatibility
  pointsEarned: v.optional(v.number()),
  pointsPossible: v.optional(v.number()),
  notes: v.optional(v.string()),
});

export const fileValidator = v.object({
  parentType: v.union(v.literal("course"), v.literal("assignment")),
  parentId: v.string(),
  name: v.string(),
  mimeType: v.string(),
  size: v.number(),
  storageKey: v.string(),
});

export const eventValidator = v.object({
  title: v.string(),
  type: v.union(
    v.literal("meeting"),
    v.literal("class"),
    v.literal("assignment"),
    v.literal("exam"),
    v.literal("office-hours"),
    v.literal("personal"),
    v.literal("study")
  ),
  startTime: v.number(),
  endTime: v.optional(v.number()),
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
});