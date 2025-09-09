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
  instructor: v.optional(v.string()),
});

export const assignmentValidator = v.object({
  courseId: v.id("courses"),
  title: v.string(),
  dueAt: v.number(),
  status: v.union(v.literal("todo"), v.literal("done")),
  grade: v.optional(v.number()),
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