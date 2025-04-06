import { LegoDeal, LegoSet, InsertLegoSet, InsertLegoDeal, DealFilter, DealStats, LegoDealWithSet } from "@shared/schema";

// Modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods from original template
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
  getLegoDeals(filter?: DealFilter): Promise<{deals: LegoDealWithSet[], total: number}>;
  createLegoDeal(legoDeal: InsertLegoDeal): Promise<LegoDeal>;
  updateLegoDeal(id: number, legoDeal: Partial<InsertLegoDeal>): Promise<LegoDeal | undefined>;
  getDealsBySetId(setId: number): Promise<LegoDeal[]>;
  
  // Stats methods
  getDealStats(): Promise<DealStats>;
}

// Import original User types
import { users, type User, type InsertUser } from "@shared/schema";

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private legoSets: Map<number, LegoSet>;
  private legoDeals: Map<number, LegoDeal>;
  private currentUserId: number;
  private currentLegoSetId: number;
  private currentLegoDealId: number;

  constructor() {
    this.users = new Map();
    this.legoSets = new Map();
    this.legoDeals = new Map();
    this.currentUserId = 1;
    this.currentLegoSetId = 1;
    this.currentLegoDealId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  // Initialize some sample data for testing
  private initializeSampleData() {
    // Sample LEGO sets
    const sampleSets: InsertLegoSet[] = [
      {
        setNumber: "75313",
        name: "Star Wars AT-AT",
        theme: "Star Wars",
        retailPrice: 184.99,
        imageUrl: "https://images.unsplash.com/photo-1558208846-f197910b7c18?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
        imageUrl: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
        imageUrl: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        pieceCount: 3599,
        yearReleased: 2018,
        avgRating: 4.9,
        numReviews: 198,
      },
      {
        setNumber: "60141",
        name: "Police Station",
        theme: "City",
        retailPrice: 99.99,
        imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        pieceCount: 894,
        yearReleased: 2019,
        avgRating: 4.2,
        numReviews: 87,
      },
      {
        setNumber: "21046",
        name: "Empire State Building",
        theme: "Architecture",
        retailPrice: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1579170053380-58064b2dee67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        pieceCount: 1767,
        yearReleased: 2020,
        avgRating: 4.7,
        numReviews: 156,
      },
      {
        setNumber: "21318",
        name: "Tree House",
        theme: "Ideas",
        retailPrice: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        pieceCount: 3036,
        yearReleased: 2019,
        avgRating: 4.6,
        numReviews: 112,
      },
      {
        setNumber: "10270",
        name: "Bookshop",
        theme: "Creator Expert",
        retailPrice: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        pieceCount: 2504,
        yearReleased: 2020,
        avgRating: 4.8,
        numReviews: 176,
      },
      {
        setNumber: "21319",
        name: "Central Perk",
        theme: "Ideas",
        retailPrice: 59.99,
        imageUrl: "https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        pieceCount: 1070,
        yearReleased: 2020,
        avgRating: 4.9,
        numReviews: 289,
      }
    ];

    // Add sample sets to storage
    for (const set of sampleSets) {
      this.createLegoSet(set);
    }

    // Create sample deals
    setTimeout(() => {
      const createDeal = (setId: number, source: string, currentPrice: number, originalPrice: number, isProfitable: boolean, profitAmount: number) => {
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
          profitAmount
        });
      };

      // Deal for AT-AT
      createDeal(1, "Amazon", 139.99, 184.99, true, 65.25);
      
      // Deal for Hogwarts Castle
      createDeal(2, "Walmart", 369.99, 449.99, true, 21.50);
      
      // Deal for Bugatti Chiron
      createDeal(3, "Target", 249.99, 379.99, true, 89.75);
      
      // Deal for Police Station
      createDeal(4, "LEGO Shop", 89.99, 99.99, false, -12.50);
      
      // Deal for Empire State Building
      createDeal(5, "Amazon", 99.99, 129.99, true, 45.25);
      
      // Deal for Tree House
      createDeal(6, "Walmart", 169.99, 199.99, false, -8.75);
      
      // Deal for Bookshop
      createDeal(7, "Target", 159.99, 199.99, true, 18.25);
      
      // Deal for Central Perk
      createDeal(8, "Amazon", 41.99, 59.99, true, 38.50);
    }, 0);
  }

  // User methods

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // LEGO Set methods

  async getLegoSet(id: number): Promise<LegoSet | undefined> {
    return this.legoSets.get(id);
  }

  async getLegoSetBySetNumber(setNumber: string): Promise<LegoSet | undefined> {
    return Array.from(this.legoSets.values()).find(
      (set) => set.setNumber === setNumber,
    );
  }

  async getLegoSets(): Promise<LegoSet[]> {
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
    };
    this.legoSets.set(id, legoSet);
    return legoSet;
  }

  // LEGO Deal methods

  async getLegoDeal(id: number): Promise<LegoDeal | undefined> {
    return this.legoDeals.get(id);
  }

  async getLegoDeals(filter: DealFilter = {}): Promise<{deals: LegoDealWithSet[], total: number}> {
    let deals = Array.from(this.legoDeals.values());
    const total = deals.length;

    // Apply filters
    if (filter.profitability === 'profitable') {
      deals = deals.filter(deal => deal.isProfitable);
    } else if (filter.profitability === 'not-profitable') {
      deals = deals.filter(deal => !deal.isProfitable);
    }

    if (filter.source) {
      const source = filter.source.toLowerCase();
      if (source !== 'all') {
        deals = deals.filter(deal => deal.source.toLowerCase() === source);
      }
    }

    if (filter.theme) {
      const theme = filter.theme.toLowerCase();
      if (theme !== 'all') {
        // Need to join with LEGO sets to filter by theme
        deals = deals.filter(deal => {
          const set = this.legoSets.get(deal.setId);
          return set && set.theme.toLowerCase() === theme;
        });
      }
    }

    if (filter.priceRange && filter.priceRange !== 'all') {
      const [min, max] = filter.priceRange.split('-').map(n => parseInt(n, 10));
      if (filter.priceRange === '200+') {
        deals = deals.filter(deal => deal.currentPrice >= 200);
      } else {
        deals = deals.filter(deal => deal.currentPrice >= min && deal.currentPrice <= max);
      }
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      deals = deals.filter(deal => {
        const set = this.legoSets.get(deal.setId);
        return set && (
          set.name.toLowerCase().includes(search) ||
          set.setNumber.toLowerCase().includes(search) ||
          set.theme.toLowerCase().includes(search)
        );
      });
    }

    // Sort deals
    switch (filter.sortBy) {
      case 'profit-desc':
        deals.sort((a, b) => b.profitAmount - a.profitAmount);
        break;
      case 'profit-asc':
        deals.sort((a, b) => a.profitAmount - b.profitAmount);
        break;
      case 'discount-desc':
        deals.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      case 'price-asc':
        deals.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price-desc':
        deals.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
    }

    // Pagination
    const page = filter.page || 1;
    const limit = filter.limit || 8;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    deals = deals.slice(startIndex, endIndex);

    // Join with LEGO sets
    const dealsWithSets = deals.map(deal => {
      const legoSet = this.legoSets.get(deal.setId);
      return {
        ...deal,
        legoSet: legoSet!
      };
    });

    return { 
      deals: dealsWithSets,
      total 
    };
  }

  async createLegoDeal(insertLegoDeal: InsertLegoDeal): Promise<LegoDeal> {
    const id = this.currentLegoDealId++;
    const now = new Date();
    const legoDeal: LegoDeal = {
      ...insertLegoDeal,
      id,
      lastChecked: now,
      createdAt: now,
    };
    this.legoDeals.set(id, legoDeal);
    return legoDeal;
  }

  async updateLegoDeal(id: number, legoDeal: Partial<InsertLegoDeal>): Promise<LegoDeal | undefined> {
    const existingDeal = this.legoDeals.get(id);
    if (!existingDeal) {
      return undefined;
    }
    const updatedDeal = {
      ...existingDeal,
      ...legoDeal,
      lastChecked: new Date(),
    };
    this.legoDeals.set(id, updatedDeal);
    return updatedDeal;
  }

  async getDealsBySetId(setId: number): Promise<LegoDeal[]> {
    return Array.from(this.legoDeals.values()).filter(
      (deal) => deal.setId === setId
    );
  }

  // Stats methods

  async getDealStats(): Promise<DealStats> {
    const deals = Array.from(this.legoDeals.values());
    const profitableDeals = deals.filter(deal => deal.isProfitable);
    
    const totalDeals = deals.length;
    const profitableDealsCount = profitableDeals.length;
    
    // Calculate average profit from profitable deals
    const totalProfit = profitableDeals.reduce((sum, deal) => sum + deal.profitAmount, 0);
    const averageProfit = profitableDealsCount > 0 ? totalProfit / profitableDealsCount : 0;
    
    // Find the most profitable deal
    const topProfitDeal = deals.reduce(
      (max, deal) => deal.profitAmount > max ? deal.profitAmount : max,
      0
    );

    return {
      totalDeals,
      profitableDeals: profitableDealsCount,
      averageProfit,
      topProfitDeal
    };
  }
}

export const storage = new MemStorage();
