import { mutation } from "./_generated/server";

export const clearDatabase = mutation({
  handler: async (ctx) => {
    console.log("🧹 Clearing all data from database...");

    // Get all documents from each table and delete them
    const tables = ["events", "assignments", "courses", "terms", "users", "userClassMetrics", "activityEvents"];
    
    for (const tableName of tables) {
      try {
        const docs = await ctx.db.query(tableName as any).collect();
        console.log(`Found ${docs.length} documents in ${tableName}`);
        
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
        console.log(`✅ Cleared ${docs.length} documents from ${tableName}`);
      } catch (error) {
        console.log(`⚠️  Skipped ${tableName} (table might not exist or be empty)`);
      }
    }

    console.log("✅ Database cleared successfully!");
    return { success: true, message: "Database cleared" };
  },
});

export const seedDatabase = mutation({
  handler: async (ctx) => {
    console.log("🌱 Database seeding is disabled...");

    console.log("⚠️ This application now requires real user authentication through Clerk.");
    console.log("Users and their data will be created automatically when they sign up.");
    console.log("No demo/seed data is needed or supported.");
    
    return {
      success: false,
      message: "Seeding disabled - application uses authenticated users only. Sign up through the app to create real user data."
    };
  },
});