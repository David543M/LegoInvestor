import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { dealFilterSchema } from '../shared/schema';
import { connectDB } from '../server/storage/mongo';

// Ensure MongoDB connection
let isConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Connect to MongoDB if not already connected
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log('✅ Connected to MongoDB in serverless function');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  try {
    console.log("📨 Received deals request with query:", req.query);
    
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
    
    console.log("🎯 Parsed filter:", filter);
    
    const { deals, total } = await storage.getLegoDeals(filter);
    console.log(`✅ Returning ${deals.length} deals out of ${total} total`);
    
    return res.json({
      deals,
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit)
    });
  } catch (error) {
    console.error("❌ Error in /api/deals:", error);
    return res.status(400).json({ error: "Invalid filter parameters" });
  }
} 