import type {
  LegoDeal,
  LegoSet,
  InsertLegoSet,
  InsertLegoDeal,
  DealFilter,
  DealStats,
  LegoDealWithSet,
  User,
  InsertUser
} from "@shared/schema";

// Main storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // LEGO Set methods
  getLegoSet(id: number): Promise<LegoSet | undefined>;
  getLegoSetBySetNumber(setNumber: string): Promise<LegoSet | undefined>;
  getLegoSets(): Promise<LegoSet[]>;
  createLegoSet(legoSet: InsertLegoSet): Promise<LegoSet>;

  // LEGO Deal methods
  getLegoDeal(id: number): Promise<LegoDeal | undefined>;
  getLegoDeals(filter?: DealFilter): Promise<{ deals: LegoDealWithSet[]; total: number }>;
  createLegoDeal(legoDeal: InsertLegoDeal): Promise<LegoDeal>;
  updateLegoDeal(id: number, legoDeal: Partial<InsertLegoDeal>): Promise<LegoDeal | undefined>;
  getDealsBySetId(setId: string): Promise<LegoDeal[]>;
  getAvailableSources(): Promise<string[]>;

  // Stats
  getDealStats(): Promise<DealStats>;
}

// Re-export the dynamic implementation
export { storage } from "./storage/index";
