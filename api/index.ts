import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from '../server/routes.js';
import { connectDB } from '../server/storage/mongo.js';
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://lego-investor-client.onrender.com']
    : ['http://localhost:3000'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Register routes
registerRoutes(app).then(server => {
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
  next();
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default app; 