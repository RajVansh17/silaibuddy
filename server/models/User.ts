import { Collection, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { connectToDatabase, isMongoConnected } from '../database';

export interface User {
  _id?: ObjectId;
  name: string;
  phone: string;
  email: string;
  password: string;
  verified: boolean;
  createdAt: Date;
}

// In-memory fallback storage
const inMemoryUsers = new Map<string, User>();
const demoUsers = new Map<string, User>();

// Initialize demo users
const initDemoUsers = () => {
  const users = [
    { name: "Demo User", phone: "9876543210", email: "demo@example.com", password: "password123" },
    { name: "Test User", phone: "1234567890", email: "test@example.com", password: "demo" },
    { name: "Sample User", phone: "9999999999", email: "sample@example.com", password: "test123" },
    { name: "Silai User", phone: "8888888888", email: "silai@example.com", password: "silai123" },
    { name: "Admin User", phone: "7777777777", email: "admin@example.com", password: "admin" },
    { name: "Regular User", phone: "6666666666", email: "user@example.com", password: "user123" },
  ];

  users.forEach(userData => {
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    const user: User = {
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: hashedPassword,
      verified: true,
      createdAt: new Date()
    };
    demoUsers.set(userData.phone, user);
  });
};

// Initialize demo users
initDemoUsers();

export class UserModel {
  private static async getCollection(): Promise<Collection<User> | null> {
    const db = await connectToDatabase();
    return db ? db.collection<User>('users') : null;
  }

  static async createUser(userData: Omit<User, '_id' | 'createdAt'>): Promise<User> {
    const collection = await this.getCollection();
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const newUser: User = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    if (collection) {
      // MongoDB storage
      const result = await collection.insertOne(newUser);
      return { ...newUser, _id: result.insertedId };
    } else {
      // In-memory fallback
      inMemoryUsers.set(userData.phone, newUser);
      return newUser;
    }
  }

  static async findByPhone(phone: string): Promise<User | null> {
    const collection = await this.getCollection();
    
    if (collection) {
      return await collection.findOne({ phone });
    } else {
      // Check demo users first, then in-memory users
      return demoUsers.get(phone) || inMemoryUsers.get(phone) || null;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    
    if (collection) {
      return await collection.findOne({ email });
    } else {
      // Search in-memory storage
      for (const user of [...demoUsers.values(), ...inMemoryUsers.values()]) {
        if (user.email === email) {
          return user;
        }
      }
      return null;
    }
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateVerificationStatus(phone: string, verified: boolean): Promise<void> {
    const collection = await this.getCollection();
    
    if (collection) {
      await collection.updateOne({ phone }, { $set: { verified } });
    } else {
      // Update in-memory storage
      const user = demoUsers.get(phone) || inMemoryUsers.get(phone);
      if (user) {
        user.verified = verified;
      }
    }
  }

  static async createIndexes(): Promise<void> {
    if (!isMongoConnected()) {
      console.log('MongoDB not connected, skipping index creation');
      return;
    }

    try {
      const collection = await this.getCollection();
      if (collection) {
        // Create unique indexes
        await collection.createIndex({ phone: 1 }, { unique: true });
        await collection.createIndex({ email: 1 }, { unique: true });
        console.log('MongoDB indexes created successfully');
      }
    } catch (error) {
      console.warn('Failed to create indexes:', error);
    }
  }
}