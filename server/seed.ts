// server/seed.ts
import { connectDB } from "./storage/mongo";
import { scrapeLegoDeals } from "./scraper";
import { LegoSetModel } from "./models/legoSet";
import LegoDealModel from "./models/legoDeal";
import type { CollectionInfo } from "mongodb";

async function seed() {
  console.log("🔌 Attempting MongoDB connection...");
  await connectDB();
  console.log("✅ Connected to MongoDB");

  console.log("🗑️  Dropping collections...");
  await LegoDealModel.deleteMany({});
  await LegoSetModel.deleteMany({});

  console.log("🔄 Running scrapers...");
  await scrapeLegoDeals();

  const setCount = await LegoSetModel.countDocuments();
  const dealCount = await LegoDealModel.countDocuments();
  console.log(`📊 Final counts - Sets: ${setCount}, Deals: ${dealCount}`);

  console.log("\n📚 Collections in database:");
  const collections = await LegoSetModel.db.listCollections();
  collections.forEach((col: CollectionInfo) => console.log(`- ${col.name}`));

  console.log("\n📄 Sample documents:");
  const sampleSet = await LegoSetModel.findOne();
  console.log("Sample Set:", JSON.stringify(sampleSet, null, 2));

  const sampleDeal = await LegoDealModel.findOne();
  console.log("Sample Deal:", JSON.stringify(sampleDeal, null, 2));
}

seed().catch(console.error);
