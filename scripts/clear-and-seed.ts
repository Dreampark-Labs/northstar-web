#!/usr/bin/env tsx

import * as dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function clearAndSeedDatabase() {
  console.log("🧹 Clearing database first...");

  try {
    // Clear existing data
    const clearResult = await client.mutation(api.seed.clearDatabase);
    console.log("✅ Database cleared:", clearResult);

    console.log("\n🌱 Now seeding fresh data...");

    // Seed fresh data
    const seedResult = await client.mutation(api.seed.seedDatabase);
    console.log("✅ Seeding completed:", seedResult);

    console.log("\n🎉 Database successfully cleared and reseeded!");
  } catch (error) {
    console.error("❌ Error during clear and seed:", error);
    process.exit(1);
  }
}

// Run the clear and seed function
clearAndSeedDatabase();
