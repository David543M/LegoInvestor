import { IStorage } from './index.js';
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
} from '../../shared/schema.js';

import UserModel from '../models/user.js';
import { LegoSetModel } from '../models/legoSet.js';
import LegoDealModel from '../models/legoDeal.js';
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
    console.log("🔍 Getting LEGO deals with filter:", filter);
    const query: any = {};

    if (filter.profitability === "profitable") query.isProfitable = true;
    if (filter.profitability === "not-profitable") query.isProfitable = false;
    if (filter.source && filter.source !== "all") query.source = filter.source;

    console.log("📊 MongoDB query:", query);

    const limit = filter.limit || 8;
    const page = filter.page || 1;

    try {
      const [deals, total] = await Promise.all([
          LegoDealModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("setId")
            .lean()
            .exec(),
          LegoDealModel.countDocuments(query),
        ]);
        
      console.log(`📦 Found ${deals.length} deals out of ${total} total`);
        
      // Map deals to LegoDealWithSet[]
      const dealsWithSet: LegoDealWithSet[] = deals.map((deal: any) => {
        const legoSet = deal.setId;
        console.log("🏗️ Processing deal:", { id: deal._id, setId: legoSet?.id || legoSet?._id });
        
        return {
          ...deal,
          id: deal._id.toString(),
          setId: legoSet?._id.toString(),
          legoSet: legoSet ? {
            ...legoSet,
            id: legoSet._id.toString()
          } : null,
        };
      });
              
      return { deals: dealsWithSet, total };
    } catch (error) {
      console.error("❌ Error getting LEGO deals:", error);
      throw error;
    }
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
