import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// Helper function to get or create user from external auth
export async function getOrCreateUser(
  ctx: QueryCtx | MutationCtx
): Promise<{
  _id: Id<"users">;
  _creationTime: number;
  clerkUserId?: string;
  clerkId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
} | null> {
  const identity = await ctx.auth.getUserIdentity();
  let user = null;

  if (identity) {
    // Try to find user by external auth subject
    user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    // If not found by clerkUserId, try by clerkId for backward compatibility
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .first();
    }

    // If user doesn't exist, create them
    if (!user && 'insert' in ctx.db) {
      const now = Date.now();
      const userId = await (ctx.db as any).insert("users", {
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

  return user as any;
}
