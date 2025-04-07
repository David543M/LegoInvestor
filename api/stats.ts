import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
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
    const stats = await storage.getDealStats();
    return res.json(stats);
  } catch (error) {
    console.error("❌ Error in /api/stats:", error);
    return res.status(500).json({ error: "Failed to get deal stats" });
  }
} 