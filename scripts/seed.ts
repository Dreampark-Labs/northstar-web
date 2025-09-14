#!/usr/bin/env tsx

import * as dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    const result = await client.mutation(api.seed.seedDatabase);
    console.log("✅ Seeding completed:", result);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
