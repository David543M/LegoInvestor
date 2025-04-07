import { IStorage } from "../storage";
import { isValidObjectId } from "mongoose";

import type {
  LegoSet,
  LegoDeal,
  InsertLegoDeal,
  InsertLegoSet,
  DealFilter,
  DealStats,
  LegoDealWithSet,
  InsertUser,
  User
} from "@shared/schema";

import UserModel from "../models/user";
import { LegoSetModel } from "../models/legoSet";
import LegoDealModel from "../models/legoDeal";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./server/Database.env" });

// ✅ Connexion MongoDB
export async function connectDB() {
  const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/legodeals";
  console.log("🔌 Attempting MongoDB connection...");

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

export class MongoStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    return undefined as any;
  }

  // ✅ LEGO Sets
  async getLegoSet(id: number): Promise<LegoSet | undefined> {
    const result = await LegoSetModel.findOne({ id }).lean();
    if (!result) return undefined;
    return {
      ...result,
      id: result._id.toString(),
    } as LegoSet;
  }

  async getLegoSetBySetNumber(setNumber: string): Promise<LegoSet | undefined> {
    const result = await LegoSetModel.findOne({ setNumber }).lean();
    if (!result) return undefined;
    return {
      ...result,
      id: result._id.toString(),
    } as LegoSet;
  }

  async getLegoSets(): Promise<LegoSet[]> {
    const results = await LegoSetModel.find().lean();
    return results.map(result => ({
      ...result,
      id: result._id.toString(),
    })) as LegoSet[];
  }

  async createLegoSet(insertLegoSet: InsertLegoSet): Promise<LegoSet> {
    const result = await LegoSetModel.create(insertLegoSet);
    const set = result.toObject();
    return {
      ...set,
      id: set._id.toString(),
    } as LegoSet;
  }

  // ✅ LEGO Deals
  async getLegoDeal(id: number): Promise<LegoDeal | undefined> {
    const result = await LegoDealModel.findOne({ id }).lean();
    if (!result) return undefined;
  
    // Convertir l'ObjectId en string
    return {
      ...result,
      setId: result.setId.toString(),
    } as LegoDeal;
  }
  

  async getLegoDeals(filter: Partial<DealFilter> = {}): Promise<{ deals: LegoDealWithSet[]; total: number }> {
    const query: any = {};

    if (filter.profitability === "profitable") query.isProfitable = true;
    if (filter.profitability === "not-profitable") query.isProfitable = false;
    if (filter.source && filter.source !== "all") query.source = filter.source;

    const limit = filter.limit || 8;
    const page = filter.page || 1;

    const [deals, total] = await Promise.all([
        LegoDealModel.find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("setId")
          .lean()
          .exec(),
        LegoDealModel.countDocuments(query),
      ]);
      
      // Map deals to LegoDealWithSet[]
      const dealsWithSet: LegoDealWithSet[] = deals.map((deal: any) => {
        const legoSet = deal.setId;
      
        return {
          ...deal,
          setId: legoSet.id,
          legoSet,
        };
      });
            
    return { deals: dealsWithSet, total };
  }

  // Add method to get available sources
  async getAvailableSources(): Promise<string[]> {
    const sources = await LegoDealModel.distinct('source');
    return sources.sort();
  }

  async createLegoDeal(insertLegoDeal: InsertLegoDeal): Promise<LegoDeal> {
    const result = await LegoDealModel.create(insertLegoDeal);
    const deal = result.toObject();
    return {
      ...deal,
      setId: deal.setId.toString(), 
    } as LegoDeal;
  }

  async updateLegoDeal(id: number, legoDeal: Partial<InsertLegoDeal>): Promise<LegoDeal | undefined> {
    const result = await LegoDealModel.findOneAndUpdate(
      { id },
      { ...legoDeal },
      { new: true }
    ).lean();
  
    if (!result) return undefined;
  
    return {
      ...result,
      setId: result.setId.toString(), // 🔁 ObjectId → string
    } as LegoDeal;
  }
  

  async getDealsBySetId(setId: string): Promise<LegoDeal[]> {
    const deals = await LegoDealModel.find({ setId }).lean();
    return deals.map((deal: any) => ({
      ...deal,
      setId: deal.setId.toString()
    })) as LegoDeal[];
  }

  // ✅ Statistiques
  async getDealStats(): Promise<DealStats> {
    const rawDeals = await LegoDealModel.find().lean();
  
    const deals: LegoDeal[] = rawDeals.map((deal: any) => ({
      ...deal,
      setId: deal.setId.toString(), // ⚠️ cast ObjectId → string
    }));
  
    const profitableDeals = deals.filter(d => d.isProfitable);
    const total = deals.length;
    const averageProfit = profitableDeals.length
      ? profitableDeals.reduce((sum, d) => sum + d.profitAmount, 0) / profitableDeals.length
      : 0;
  
    const topProfitDeal = Math.max(...(deals.map(d => d.profitAmount) || [0]));
  
    return {
      totalDeals: total,
      profitableDeals: profitableDeals.length,
      averageProfit,
      topProfitDeal,
    };
  }
  
}
