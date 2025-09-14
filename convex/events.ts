import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { containsObviousPII } from "./lib/pii";
import { eventValidator } from "./lib/validation";

export const create = mutation({
  args: eventValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Basic PII check
    if (containsObviousPII(args.title) || 
        (args.description && containsObviousPII(args.description))) {
      throw new Error("Content contains obvious PII");
    }

    const eventId = await ctx.db.insert("events", {
      userId: user._id,
      lc_title: args.title.toLowerCase(),
      ...args,
    });

    // Log activity event
    await ctx.db.insert("activityEvents", {
      userId: user._id,
      type: "create",
      entity: "event",
      entityId: eventId,
      ts: Date.now(),
    });

    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    ...eventValidator.fields,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...updateData } = args;

    const event = await ctx.db.get(id);
    if (!event) throw new Error("Event not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || event.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Basic PII check
    if (containsObviousPII(updateData.title) || 
        (updateData.description && containsObviousPII(updateData.description))) {
      throw new Error("Content contains obvious PII");
    }

    const patchData: any = { ...updateData };
    if (updateData.title) {
      patchData.lc_title = updateData.title.toLowerCase();
    }

    const result = await ctx.db.patch(id, patchData);

    // Log activity event
    await ctx.db.insert("activityEvents", {
      userId: user._id,
      type: "update",
      entity: "event",
      entityId: id,
      ts: Date.now(),
    });

    return result;
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
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || event.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return event;
  },
});

export const getByDateRange = query({
  args: { 
    startTime: v.number(), 
    endTime: v.number() 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("events")
      .withIndex("by_user_time", (q) => 
        q.eq("userId", user._id)
         .gte("startTime", args.startTime)
         .lte("startTime", args.endTime)
      )
      .filter((q) => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const softDelete = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || event.userId !== user._id) {
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
      entity: "event",
      entityId: args.id,
      ts: now,
    });
  },
});

export const getEvents = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});
