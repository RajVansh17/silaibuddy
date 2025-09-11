import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

export async function connectToDatabase(): Promise<Db | null> {
  if (db && isConnected) {
    return db;
  }

  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI environment variable is not set, falling back to in-memory storage');
    return null;
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      connectTimeoutMS: 10000,
      socketTimeoutMS: 0,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    
    // Extract database name from URI or use default
    const dbName = process.env.MONGODB_URI.includes('/') 
      ? process.env.MONGODB_URI.split('/')[3]?.split('?')[0] || 'silaibuddy'
      : 'silaibuddy';
    
    db = client.db(dbName);
    isConnected = true;
    console.log('Successfully connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.warn('Failed to connect to MongoDB, falling back to in-memory storage:', error);
    isConnected = false;
    return null;
  }
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    isConnected = false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});