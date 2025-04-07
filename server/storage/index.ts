import { MongoStorage } from "./mongo";
import { MemStorage } from "./memory";
import type { IStorage } from "../storage";

// Determine whether to use in-memory or MongoDB storage
const useMemory = process.env.USE_MEM_STORAGE === "true";

// Choose the appropriate storage backend
export const storage: IStorage = useMemory ? new MemStorage() : new MongoStorage();
