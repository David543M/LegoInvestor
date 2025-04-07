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
  import type { IStorage } from "../storage";

  function sanitizeLegoSet(set: InsertLegoSet): InsertLegoSet {
    return {
      ...set,
      imageUrl: set.imageUrl ?? undefined,
      pieceCount: set.pieceCount ?? undefined,
      yearReleased: set.yearReleased ?? undefined,
      avgRating: set.avgRating ?? undefined,
      numReviews: set.numReviews ?? undefined,
    };
  }
  
  
  export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private legoSets: Map<number, LegoSet>;
    private legoDeals: Map<number, LegoDeal>;
    private currentUserId = 1;
    private currentLegoSetId = 1;
    private currentLegoDealId = 1;
  
    constructor() {
      this.users = new Map();
      this.legoSets = new Map();
      this.legoDeals = new Map();
  
      this.initializeSampleData();
    }
  
    private initializeSampleData() {
      const sampleSets: InsertLegoSet[] = [
        {
          setNumber: "75313",
          name: "Star Wars AT-AT",
          theme: "Star Wars",
          retailPrice: 184.99,
          imageUrl: "https://images.unsplash.com/photo-1558208846-f197910b7c18",
          pieceCount: 1267,
          yearReleased: 2021,
          avgRating: 4.5,
          numReviews: 127,
        },
        {
          setNumber: "71043",
          name: "Hogwarts Castle",
          theme: "Harry Potter",
          retailPrice: 449.99,
          imageUrl: "https://images.unsplash.com/photo-1603532648955-039310d9ed75",
          pieceCount: 6020,
          yearReleased: 2020,
          avgRating: 4.8,
          numReviews: 243,
        },
        {
          setNumber: "42083",
          name: "Bugatti Chiron",
          theme: "Technic",
          retailPrice: 379.99,
          imageUrl: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60",
          pieceCount: 3599,
          yearReleased: 2018,
          avgRating: 4.9,
          numReviews: 198,
        }
        // ... add more sets if needed
      ];
  
      for (const set of sampleSets) {
        this.createLegoSet(set);
      }
  
      setTimeout(() => {
        const createDeal = (
          setId: string,
          source: string,
          currentPrice: number,
          originalPrice: number,
          isProfitable: boolean,
          profitAmount: number
        ) => {
          const discountPercentage = ((originalPrice - currentPrice) / originalPrice) * 100;
          this.createLegoDeal({
            setId,
            source,
            currentPrice,
            originalPrice,
            discountPercentage,
            url: "https://example.com/lego-deal",
            isAvailable: true,
            isProfitable,
            profitAmount,
          });
        };
  
        createDeal("75313", "Amazon", 139.99, 184.99, true, 65.25);
        createDeal("71043", "Walmart", 369.99, 449.99, true, 21.5);
        createDeal("42083", "Target", 249.99, 379.99, true, 89.75);
      }, 0);
    }
  
    // Users
    async getUser(id: number) {
      return this.users.get(id);
    }
  
    async getUserByUsername(username: string) {
      return Array.from(this.users.values()).find(user => user.username === username);
    }
  
    async createUser(insertUser: InsertUser): Promise<User> {
      const id = this.currentUserId++;
      const user: User = { ...insertUser, id };
      this.users.set(id, user);
      return user;
    }
  
    // LEGO Sets
    async getLegoSet(id: number) {
      return this.legoSets.get(id);
    }
  
    async getLegoSetBySetNumber(setNumber: string) {
      return Array.from(this.legoSets.values()).find(set => set.setNumber === setNumber);
    }
  
    async getLegoSets() {
      return Array.from(this.legoSets.values());
    }
  
    async createLegoSet(insertLegoSet: InsertLegoSet): Promise<LegoSet> {
  const id = this.currentLegoSetId++;
  const now = new Date();

  const legoSet: LegoSet = {
    ...insertLegoSet,
    id,
    createdAt: now,
    updatedAt: now,
    imageUrl: insertLegoSet.imageUrl ?? undefined,
    pieceCount: insertLegoSet.pieceCount ?? undefined,
    yearReleased: insertLegoSet.yearReleased ?? undefined,
    avgRating: insertLegoSet.avgRating ?? undefined,
    numReviews: insertLegoSet.numReviews ?? undefined,
  };

  this.legoSets.set(id, legoSet);
  return legoSet;
}
  
    // LEGO Deals
    async getLegoDeal(id: number) {
      return this.legoDeals.get(id);
    }
  
    async getLegoDeals(filter: Partial<DealFilter> = {}): Promise<{ deals: LegoDealWithSet[]; total: number }> {
      let deals = Array.from(this.legoDeals.values());

      // Apply filters
      if (filter.profitability === "profitable") {
        deals = deals.filter(d => d.isProfitable);
      } else if (filter.profitability === "not-profitable") {
        deals = deals.filter(d => !d.isProfitable);
      }

      if (filter.source && filter.source !== "all") {
        deals = deals.filter(d => d.source.toLowerCase() === filter.source!.toLowerCase());
      }

      if (filter.theme && filter.theme !== "all") {
        deals = deals.filter(d => {
          const set = this.legoSets.get(Number(d.setId));
          return set && set.theme && set.theme.toLowerCase() === filter.theme!.toLowerCase();
        });
      }

      if (filter.priceRange && filter.priceRange !== "all") {
        if (filter.priceRange === "200+") {
          deals = deals.filter(d => d.currentPrice >= 200);
        } else {
          const [min, max] = filter.priceRange.split("-").map(Number);
          deals = deals.filter(d => d.currentPrice >= min && d.currentPrice <= max);
        }
      }

      if (filter.search) {
        const q = filter.search.toLowerCase();
        deals = deals.filter(d => {
          const set = this.legoSets.get(Number(d.setId));
          return (
            set &&
            ((set.name && set.name.toLowerCase().includes(q)) ||
              set.setNumber.toLowerCase().includes(q) ||
              (set.theme && set.theme.toLowerCase().includes(q)))
          );
        });
      }

      // Sorting
      switch (filter.sortBy) {
        case "profit-desc":
          deals.sort((a, b) => b.profitAmount - a.profitAmount);
          break;
        case "profit-asc":
          deals.sort((a, b) => a.profitAmount - b.profitAmount);
          break;
        case "discount-desc":
          deals.sort((a, b) => b.discountPercentage - a.discountPercentage);
          break;
        case "price-asc":
          deals.sort((a, b) => a.currentPrice - b.currentPrice);
          break;
        case "price-desc":
          deals.sort((a, b) => b.currentPrice - a.currentPrice);
          break;
      }

      // Pagination
      const page = filter.page || 1;
      const limit = filter.limit || 8;
      const paginated = deals.slice((page - 1) * limit, page * limit);

      // Map deals with their sets
      const dealsWithSet = paginated.map(deal => {
        const legoSet = this.legoSets.get(Number(deal.setId));
        if (!legoSet) {
          throw new Error(`LEGO set not found for deal ${deal.id}`);
        }
        return {
          ...deal,
          legoSet
        };
      });

      return {
        deals: dealsWithSet,
        total: deals.length
      };
    }
  
    async createLegoDeal(insertLegoDeal: InsertLegoDeal): Promise<LegoDeal> {
      const id = this.currentLegoDealId++;
      const now = new Date();

      const legoDeal: LegoDeal = {
        ...insertLegoDeal,
        id: id.toString(),
        createdAt: now,
        isAvailable: insertLegoDeal.isAvailable ?? true,
        isProfitable: insertLegoDeal.isProfitable ?? false,
        profitAmount: insertLegoDeal.profitAmount ?? 0,
        lastChecked: now
      };

      this.legoDeals.set(id, legoDeal);
      return legoDeal;
    }
  
    async updateLegoDeal(id: number, data: Partial<InsertLegoDeal>): Promise<LegoDeal | undefined> {
      const existing = this.legoDeals.get(id);
      if (!existing) return undefined;
  
      const updated = {
        ...existing,
        ...data,
        lastChecked: new Date(),
      };
      this.legoDeals.set(id, updated);
      return updated;
    }
  
    async getAvailableSources(): Promise<string[]> {
      const sources = new Set<string>();
      for (const deal of this.legoDeals.values()) {
        sources.add(deal.source);
      }
      return Array.from(sources).sort();
    }
  
    async getDealsBySetId(setId: string): Promise<LegoDeal[]> {
      return Array.from(this.legoDeals.values()).filter(deal => deal.setId === setId);
    }
  
    async getDealStats(): Promise<DealStats> {
      const deals = Array.from(this.legoDeals.values());
      const profitable = deals.filter(d => d.isProfitable);
  
      const totalDeals = deals.length;
      const profitableDeals = profitable.length;
      const averageProfit = profitable.length
        ? profitable.reduce((sum, d) => sum + d.profitAmount, 0) / profitable.length
        : 0;
      const topProfitDeal = profitable.length
        ? Math.max(...profitable.map(d => d.profitAmount))
        : 0;
  
      return {
        totalDeals,
        profitableDeals,
        averageProfit,
        topProfitDeal,
      };
    }
  }
  