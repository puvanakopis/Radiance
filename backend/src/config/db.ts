import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

// Mask password for safe logging
function getSafeDbUrl(url: string): string {
  return url.replace(/:\/\/(.*?):(.*?)@/, '://$1:****@');
}

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const safeUrl = getSafeDbUrl(ENV.DATABASE_URL);
    console.log(`[MongoDB] Connecting to: ${safeUrl}`);

    const conn = await mongoose.connect(ENV.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err: any) {
    console.error(`\n================== [MONGODB CONNECTION ERROR] ==================`);
    console.error(`Error Message: ${err.message}`);
    console.error(`Configured DATABASE_URL: ${getSafeDbUrl(ENV.DATABASE_URL)}`);
    console.error(`\nTroubleshooting tips:`);
    if (err.message.includes('ENOTFOUND') || err.message.includes('querySrv')) {
      console.error(`1. Check your MongoDB Atlas cluster hostname in .env for any typos.`);
      console.error(`2. Ensure your Atlas cluster is running (not paused/deleted).`);
      console.error(`3. Or test with a local MongoDB: DATABASE_URL=mongodb://localhost:27017/skinova_db`);
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error(`1. Check your database username and password in .env.`);
      console.error(`2. Ensure the user exists in MongoDB Atlas -> Database Access.`);
    } else if (err.message.includes('IP') || err.message.includes('whitelist') || err.message.includes('timeout')) {
      console.error(`1. In MongoDB Atlas -> Network Access, ensure your IP address is whitelisted (or 0.0.0.0/0 for dev).`);
    }
    console.error(`=================================================================\n`);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected successfully.');
  } catch (err: any) {
    console.error('[MongoDB] Error during disconnect:', err.message);
  }
}

export default mongoose;
