import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("ethnicities").withIndex("by_name", (q) => q).collect();
    return items.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const seed = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const count = await ctx.db.query("ethnicities").collect();
    if (count.length > 0 && !args.force) return count.length;

    // Basic standardized list (can be expanded per requirements)
    const values = [
      "American Indian or Alaska Native",
      "Asian",
      "Black or African American",
      "Hispanic or Latino",
      "Middle Eastern or North African",
      "Native Hawaiian or Other Pacific Islander",
      "White",
      "Multiracial",
      "Other",
      "Prefer not to say",
    ];

    // Clear existing if force seeding
    if (count.length > 0 && args.force) {
      for (const r of count) {
        await ctx.db.delete(r._id);
      }
    }

    for (const name of values) {
      await ctx.db.insert("ethnicities", { name, lc_name: name.toLowerCase() });
    }
    return values.length;
  },
});


