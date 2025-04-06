import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dealFilterSchema } from "@shared/schema";
import { scheduleScrapingJobs } from "./scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize and start the scraper
  scheduleScrapingJobs();

  // API Routes - prefix all routes with /api
  
  // Get all LEGO deals with filtering
  app.get("/api/deals", async (req: Request, res: Response) => {
    try {
      const filter = dealFilterSchema.parse({
        profitability: req.query.profitability || 'all',
        source: req.query.source || 'all',
        theme: req.query.theme || 'all',
        priceRange: req.query.priceRange || 'all',
        sortBy: req.query.sortBy || 'profit-desc',
        search: req.query.search || '',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 8
      });
      
      const { deals, total } = await storage.getLegoDeals(filter);
      res.json({
        deals,
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit)
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid filter parameters" });
    }
  });

  // Get a specific LEGO deal by ID
  app.get("/api/deals/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const deal = await storage.getLegoDeal(id);
    
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    
    const legoSet = await storage.getLegoSet(deal.setId);
    
    if (!legoSet) {
      return res.status(404).json({ error: "LEGO set not found" });
    }
    
    res.json({
      ...deal,
      legoSet
    });
  });

  // Get LEGO deal stats
  app.get("/api/stats", async (_req: Request, res: Response) => {
    const stats = await storage.getDealStats();
    res.json(stats);
  });

  // Get all available themes
  app.get("/api/themes", async (_req: Request, res: Response) => {
    const legoSets = await storage.getLegoSets();
    const themes = [...new Set(legoSets.map(set => set.theme))].sort();
    res.json(themes);
  });

  // Get all available sources
  app.get("/api/sources", async (_req: Request, res: Response) => {
    const { deals } = await storage.getLegoDeals();
    const sources = [...new Set(deals.map(deal => deal.source))].sort();
    res.json(sources);
  });

  // Manually trigger a refresh of the deals (scrape)
  app.post("/api/refresh", async (_req: Request, res: Response) => {
    try {
      await scheduleScrapingJobs();
      res.json({ success: true, message: "Deal refresh triggered successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to trigger deal refresh" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
