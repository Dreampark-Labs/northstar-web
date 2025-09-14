import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { fileValidator } from "./lib/validation";

export const create = mutation({
  args: fileValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Verify parent ownership
    if (args.parentType === "course") {
      const course = await ctx.db.get(args.parentId as any);
      if (!course || course.userId !== user._id) {
        throw new Error("Course not found or unauthorized");
      }
    } else if (args.parentType === "assignment") {
      const assignment = await ctx.db.get(args.parentId as any);
      if (!assignment || assignment.userId !== user._id) {
        throw new Error("Assignment not found or unauthorized");
      }
    }

    return await ctx.db.insert("files", {
      userId: user._id,
      parentType: args.parentType,
      parentId: args.parentType === "course" ? args.parentId as any : args.parentId as any,
      name: args.name,
      lc_name: args.name.toLowerCase(),
      mimeType: args.mimeType,
      size: args.size,
      storageKey: args.storageKey,
      uploadedAt: Date.now(),
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

export const listByParent = query({
  args: {
    parentType: v.union(v.literal("course"), v.literal("assignment")),
    parentId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    // Verify parent ownership
    if (args.parentType === "course") {
      const course = await ctx.db.get(args.parentId as any);
      if (!course || course.userId !== user._id) {
        return [];
      }
    } else if (args.parentType === "assignment") {
      const assignment = await ctx.db.get(args.parentId as any);
      if (!assignment || assignment.userId !== user._id) {
        return [];
      }
    }

    return await ctx.db
      .query("files")
      .withIndex("by_user_parent", (q) => 
        q.eq("userId", user._id)
         .eq("parentType", args.parentType)
         .eq("parentId", args.parentId as any)
      )
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const file = await ctx.db.get(args.id);
    if (!file) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || file.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return file;
  },
});

export const getRecentFiles = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    const limit = args.limit || 10;

    return await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .order("desc")
      .take(limit);
  },
});

export const searchFiles = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    const searchTerm = args.searchTerm.toLowerCase();

    return await ctx.db
      .query("files")
      .withIndex("by_user_name", (q) => q.eq("userId", user._id))
      .filter(q => q.and(
        q.eq(q.field("softDeletedAt"), undefined),
        // Simple contains search on lowercase name
        q.gte(q.field("lc_name"), searchTerm),
        q.lt(q.field("lc_name"), searchTerm + "\uffff")
      ))
      .order("desc")
      .collect();
  },
});

export const softDelete = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const file = await ctx.db.get(args.id);
    if (!file) throw new Error("File not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || file.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const purgeAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.patch(args.id, { 
      softDeletedAt: now,
      purgeAt 
    });

    // Log activity event
    await ctx.db.insert("activityEvents", {
      userId: user._id,
      type: "delete",
      entity: "file",
      entityId: args.id,
      ts: now,
    });
  },
});

export const getStorageStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { totalFiles: 0, totalSize: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return { totalFiles: 0, totalSize: 0 };

    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return {
      totalFiles: files.length,
      totalSize,
    };
  },
});
