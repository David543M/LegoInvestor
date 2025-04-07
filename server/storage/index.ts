import { MongoStorage } from './mongo.js';
import { MemStorage } from './memory.js';
import type { IStorage } from '../storage.js';

// Determine whether to use in-memory or MongoDB storage
const useMemory = process.env.USE_MEM_STORAGE === "true";

// Choose the appropriate storage backend
export const storage: IStorage = useMemory ? new MemStorage() : new MongoStorage();
