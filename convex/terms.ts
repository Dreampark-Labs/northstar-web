import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { termValidator } from "./lib/validation";
// import { updateActiveCourseCount } from "./analytics";

// Helper function to get or create user from external auth
async function getOrCreateUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  let user = null;

  if (identity) {
    // Try to find user by external auth subject
    user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", identity.subject))
      .first();

    // If not found by clerkUserId, try by clerkId for backward compatibility
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", identity.subject))
        .first();
    }

    // If user doesn't exist, create them
    if (!user) {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkUserId: identity.subject,
        email: identity.email || `user-${identity.subject}@example.com`,
        firstName: identity.name?.split(' ')[0] || 'User',
        lastName: identity.name?.split(' ').slice(1).join(' ') || '',
        createdAt: now,
        updatedAt: now,
      });
      user = await ctx.db.get(userId);
    }
  }

  return user;
}

export const create = mutation({
  args: termValidator,
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Enforce unique name per user
    const existingWithName = await ctx.db
      .query("terms")
      .withIndex("by_user_name", (q: any) => q.eq("userId", user._id).eq("lc_name", args.name.toLowerCase()))
      .first();
    if (existingWithName) {
      throw new Error("A term with this name already exists");
    }

    const newId = await ctx.db.insert("terms", {
      userId: user._id,
      lc_name: args.name.toLowerCase(),
      ...args,
    });

    // If this is created as current, set currentActiveTerm on user
    if (args.status === "current") {
      await ctx.db.patch(user._id, { currentActiveTerm: String(newId), totalTermsCreated: (user.totalTermsCreated || 0) + 1, updatedAt: Date.now() });
    } else {
      await ctx.db.patch(user._id, { totalTermsCreated: (user.totalTermsCreated || 0) + 1, updatedAt: Date.now() });
    }

    return newId;
  },
});

export const update = mutation({
  args: {
    id: v.id("terms"),
    ...termValidator.fields,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...updateData } = args;

    const term = await ctx.db.get(id);
    if (!term) throw new Error("Term not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || term.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const patchData: any = { ...updateData };
    if (updateData.name) {
      patchData.lc_name = updateData.name.toLowerCase();

      // Enforce unique name per user on update
      const dup = await ctx.db
        .query("terms")
        .withIndex("by_user_name", (q) => q.eq("userId", user._id).eq("lc_name", updateData.name.toLowerCase()))
        .first();
      if (dup && dup._id !== id) {
        throw new Error("A term with this name already exists");
      }
    }

    // Check if status is changing (affects active courses)
    const statusChanged = updateData.status && updateData.status !== term.status;

    const result = await ctx.db.patch(id, patchData);

    // If status changed, update active course count
    if (statusChanged) {
      // TODO: Re-enable analytics tracking
      // await updateActiveCourseCount(ctx, {
      //   userId: user._id,
      //   changeReason: `term_status_changed: ${term.name} from ${term.status} to ${updateData.status}`,
      // });
    }

    return result;
  },
});

export const list = query({
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("terms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const getTerms = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("terms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("terms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const term = await ctx.db.get(args.id);
    if (!term) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || term.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return term;
  },
});

export const get = query({
  args: { termId: v.id("terms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const term = await ctx.db.get(args.termId);
    if (!term) return null;

    // Check user authorization
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || term.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Check if term is soft deleted
    if (term.softDeletedAt) {
      return null;
    }

    return term;
  },
});

// Temporary function for development - fetches terms for specific user ID
export const listByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("terms")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("softDeletedAt"), undefined))
      .collect();
  },
});


export const softDelete = mutation({
  args: { id: v.id("terms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const term = await ctx.db.get(args.id);
    if (!term) throw new Error("Term not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!user || term.userId !== user._id) {
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
      entity: "term",
      entityId: args.id,
      ts: now,
    });
  },
});