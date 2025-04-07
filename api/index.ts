import express, { type Request, Response } from "express";
import { registerRoutes } from "../server/routes";
import { connectDB } from "../server/storage/mongo";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Register routes
registerRoutes(app);

// Error handling
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default app; 