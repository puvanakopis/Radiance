import mongoose from 'mongoose';
import { ENV } from './env.js';

let cachedPromise = null;

// Mask password for safe logging
function getSafeDbUrl(url) {
  if (!url) return '';
  return url.replace(/:\/\/(.*?):(.*?)@/, '://$1:****@');
}

export async function connectDB() {
  // If already connected, return existing connection immediately
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If connection is in progress, reuse the existing promise
  if (cachedPromise && mongoose.connection.readyState === 2) {
    return cachedPromise;
  }

  try {
    const dbUrl = ENV.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not defined.');
    }

    const safeUrl = getSafeDbUrl(dbUrl);
    console.log(`[MongoDB] Connecting to: ${safeUrl}`);

    cachedPromise = mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    const conn = await cachedPromise;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (err) {
    cachedPromise = null;
    console.error(`\n================== [MONGODB CONNECTION ERROR] ==================`);
    console.error(`Error Message: ${err.message}`);
    console.error(`Configured DATABASE_URL: ${getSafeDbUrl(ENV.DATABASE_URL)}`);
    console.error(`\nTroubleshooting tips:`);
    if (err.message.includes('ENOTFOUND') || err.message.includes('querySrv')) {
      console.error(`1. Check your MongoDB Atlas cluster hostname in environment variables.`);
      console.error(`2. Ensure your Atlas cluster is running (not paused/deleted).`);
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error(`1. Check your database username and password.`);
      console.error(`2. Ensure the user exists in MongoDB Atlas -> Database Access.`);
    } else if (err.message.includes('IP') || err.message.includes('whitelist') || err.message.includes('timeout')) {
      console.error(`1. In MongoDB Atlas -> Network Access, whitelist 0.0.0.0/0 to allow Vercel serverless connections.`);
    }
    console.error(`=================================================================\n`);
    throw err;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState === 0) return;
  try {
    await mongoose.disconnect();
    cachedPromise = null;
    console.log('[MongoDB] Disconnected successfully.');
  } catch (err) {
    console.error('[MongoDB] Error during disconnect:', err.message);
  }
}

export default mongoose;

