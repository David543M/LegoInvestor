import { z } from "zod";

// ========== LEGO SET TYPES ==========

export type LegoSet = {
  id: number | string;
  setNumber: string;
  name?: string;
  theme?: string;
  retailPrice?: number;
  imageUrl?: string;
  pieceCount?: number;
  yearReleased?: number;
  avgRating?: number;
  numReviews?: number;
  createdAt: Date;
  updatedAt: Date;
};

export const insertLegoSetSchema = z.object({
  setNumber: z.string(),
  name: z.string().optional().default(""),
  theme: z.string().optional().default("Unknown"),
  retailPrice: z.number().optional().default(0),
  imageUrl: z.string().optional().default("https://placeholder.com/lego.png"),
  pieceCount: z.number().optional().default(0),
  yearReleased: z.number().optional().default(() => new Date().getFullYear()),
  avgRating: z.number().optional().default(0),
  numReviews: z.number().optional().default(0),
});

export type InsertLegoSet = z.infer<typeof insertLegoSetSchema>;

// ========== LEGO DEAL TYPES ==========

export type LegoDeal = {
  id?: string;
  setId: string;
  source: string;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  url: string;
  isAvailable: boolean;
  isProfitable: boolean;
  profitAmount: number;
  lastChecked: Date;
  createdAt: Date;
};

export const insertLegoDealSchema = z.object({
  setId: z.string(),
  source: z.string(),
  currentPrice: z.number(),
  originalPrice: z.number(),
  discountPercentage: z.number(),
  url: z.string(),
  isAvailable: z.boolean().optional(),
  isProfitable: z.boolean().optional(),
  profitAmount: z.number().optional(),
  lastChecked: z.date().optional(),
});

export type InsertLegoDeal = z.infer<typeof insertLegoDealSchema>;

export type LegoDealWithSet = LegoDeal & {
  legoSet: LegoSet;
};

// ========== FILTER & STATS ==========

export const dealFilterSchema = z.object({
  profitability: z.enum(["all", "profitable", "not-profitable"]).optional().default("all"),
  source: z.string().optional(),
  theme: z.string().optional(),
  priceRange: z.enum(["all", "0-50", "50-100", "100-200", "200+"]).optional().default("all"),
  sortBy: z.enum(["profit-desc", "profit-asc", "discount-desc", "price-asc", "price-desc"]).optional().default("profit-desc"),
  search: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(8),
});

export type DealFilter = z.infer<typeof dealFilterSchema>;

export type DealStats = {
  totalDeals: number;
  profitableDeals: number;
  averageProfit: number;
  topProfitDeal: number;
};

// ========== USER ==========

export type User = {
  id: number;
  username: string;
  email?: string;
};

export type InsertUser = Omit<User, "id">;
