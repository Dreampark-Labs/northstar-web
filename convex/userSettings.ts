import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserSettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return null;

    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // If no settings exist, create default ones
    if (!settings) {
      const settingsId = await ctx.db.insert("userSettings", {
        userId: user._id,
        weekStartDay: "Sunday",
        theme: "system",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        emailNotifications: true,
        dueSoonDays: 7,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      settings = await ctx.db.get(settingsId);
    }

    return settings;
  },
});

export const updateUserSettings = mutation({
  args: {
    weekStartDay: v.optional(v.union(
      v.literal("Sunday"), v.literal("Monday"), v.literal("Tuesday"), 
      v.literal("Wednesday"), v.literal("Thursday"), v.literal("Friday"), v.literal("Saturday")
    )),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    dateFormat: v.optional(v.union(v.literal("MM/DD/YYYY"), v.literal("DD/MM/YYYY"), v.literal("YYYY-MM-DD"))),
    timeFormat: v.optional(v.union(v.literal("12h"), v.literal("24h"))),
    emailNotifications: v.optional(v.boolean()),
    dueSoonDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const updateData = {
      ...args,
      updatedAt: Date.now(),
    };

    if (settings) {
      await ctx.db.patch(settings._id, updateData);
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        weekStartDay: "Sunday",
        theme: "system",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        emailNotifications: true,
        dueSoonDays: 7,
        createdAt: Date.now(),
        ...updateData,
      });
    }

    return true;
  },
});

export const updateDashboardLayout = mutation({
  args: {
    pageId: v.string(),
    layout: v.string(), // JSON string of grid layout
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!settings) {
      // Create default settings first
      const settingsId = await ctx.db.insert("userSettings", {
        userId: user._id,
        weekStartDay: "Sunday",
        theme: "system",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        emailNotifications: true,
        dueSoonDays: 7,
        dashboardLayouts: {
          [args.pageId]: args.layout
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return true;
    }

    const currentLayouts = settings.dashboardLayouts || {};
    await ctx.db.patch(settings._id, {
      dashboardLayouts: {
        ...currentLayouts,
        [args.pageId]: args.layout
      },
      updatedAt: Date.now(),
    });

    return true;
  },
});
