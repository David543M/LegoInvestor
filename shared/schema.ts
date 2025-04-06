import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// LEGO Set schema
export const legoSets = pgTable("lego_sets", {
  id: serial("id").primaryKey(),
  setNumber: text("set_number").notNull().unique(),
  name: text("name").notNull(),
  theme: text("theme").notNull(),
  retailPrice: doublePrecision("retail_price").notNull(),
  imageUrl: text("image_url"),
  pieceCount: integer("piece_count"),
  yearReleased: integer("year_released"),
  avgRating: doublePrecision("avg_rating"),
  numReviews: integer("num_reviews"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// LEGO Deal schema
export const legoDeals = pgTable("lego_deals", {
  id: serial("id").primaryKey(),
  setId: integer("set_id").notNull(),
  source: text("source").notNull(), // Amazon, Walmart, Target, LEGO Shop, etc.
  currentPrice: doublePrecision("current_price").notNull(),
  originalPrice: doublePrecision("original_price").notNull(),
  discountPercentage: doublePrecision("discount_percentage").notNull(),
  url: text("url").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  isProfitable: boolean("is_profitable").default(false).notNull(),
  profitAmount: doublePrecision("profit_amount").default(0).notNull(),
  lastChecked: timestamp("last_checked").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for inserting data
export const insertLegoSetSchema = createInsertSchema(legoSets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLegoDealSchema = createInsertSchema(legoDeals).omit({
  id: true,
  createdAt: true,
  lastChecked: true,
});

// Types for TypeScript
export type LegoSet = typeof legoSets.$inferSelect;
export type InsertLegoSet = z.infer<typeof insertLegoSetSchema>;

export type LegoDeal = typeof legoDeals.$inferSelect;
export type InsertLegoDeal = z.infer<typeof insertLegoDealSchema>;

// Extended types for frontend use
export type LegoDealWithSet = LegoDeal & {
  legoSet: LegoSet;
};

// Schema for filtering deals
export const dealFilterSchema = z.object({
  profitability: z.enum(['all', 'profitable', 'not-profitable']).optional().default('all'),
  source: z.string().optional(),
  theme: z.string().optional(),
  priceRange: z.enum(['all', '0-50', '50-100', '100-200', '200+']).optional().default('all'),
  sortBy: z.enum(['profit-desc', 'profit-asc', 'discount-desc', 'price-asc', 'price-desc']).optional().default('profit-desc'),
  search: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(8),
});

export type DealFilter = z.infer<typeof dealFilterSchema>;

// Stats schema
export type DealStats = {
  totalDeals: number;
  profitableDeals: number;
  averageProfit: number;
  topProfitDeal: number;
};
