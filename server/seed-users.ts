import { UserModel } from './models/User';
import { isMongoConnected } from './database';

const demoUsers = [
  { name: "Demo User", phone: "9876543210", email: "demo@example.com", password: "password123" },
  { name: "Test User", phone: "1234567890", email: "test@example.com", password: "demo" },
  { name: "Sample User", phone: "9999999999", email: "sample@example.com", password: "test123" },
  { name: "Silai User", phone: "8888888888", email: "silai@example.com", password: "silai123" },
  { name: "Admin User", phone: "7777777777", email: "admin@example.com", password: "admin" },
  { name: "Regular User", phone: "6666666666", email: "user@example.com", password: "user123" },
];

export async function seedUsers() {
  try {
    console.log('Creating database indexes...');
    await UserModel.createIndexes();

    if (isMongoConnected()) {
      console.log('Seeding demo users to MongoDB...');
      
      for (const userData of demoUsers) {
        try {
          // Check if user already exists
          const existingUser = await UserModel.findByPhone(userData.phone);
          if (!existingUser) {
            await UserModel.createUser({
              name: userData.name,
              phone: userData.phone,
              email: userData.email,
              password: userData.password,
              verified: true // Pre-verify demo users
            });
            console.log(`Created user: ${userData.name} (${userData.phone})`);
          } else {
            console.log(`User already exists: ${userData.phone}`);
          }
        } catch (error) {
          console.error(`Failed to create user ${userData.phone}:`, error);
        }
      }
      
      console.log('User seeding completed');
    } else {
      console.log('Using in-memory demo users (MongoDB not available)');
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}