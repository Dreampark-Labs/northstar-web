import { z } from "zod";

export const termSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be valid date (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be valid date (YYYY-MM-DD)"),
  status: z.enum(["past", "current", "future"]),
});

export const courseSchema = z.object({
  termId: z.string(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  code: z.string().min(1, "Code is required").max(20, "Code too long"),
  creditHours: z.number().min(1).max(10),
  instructor: z.string().max(100, "Instructor name too long").optional(),
});

export const assignmentSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  dueAt: z.number(),
  status: z.enum(["todo", "done"]),
  grade: z.number().min(0).max(100).optional(),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const fileSchema = z.object({
  parentType: z.enum(["course", "assignment"]),
  parentId: z.string(),
  name: z.string().min(1, "Name is required"),
  mimeType: z.string(),
  size: z.number().min(1),
  storageKey: z.string(),
});

export type TermFormData = z.infer<typeof termSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type FileFormData = z.infer<typeof fileSchema>;