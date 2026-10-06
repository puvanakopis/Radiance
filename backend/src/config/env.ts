import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/skinova_db',

  // JWT Auth
  JWT_SECRET: process.env.JWT_SECRET || 'skinova_dev_secret_key_change_in_production_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // PayHere Sandbox
  PAYHERE_MERCHANT_ID: process.env.PAYHERE_MERCHANT_ID || '1211149',
  PAYHERE_MERCHANT_SECRET: process.env.PAYHERE_MERCHANT_SECRET || '4MTc3OTM3MzI3NzMxNjYzMTczNDkyOTcxMjMyMjEyMzQ1Nzg=',
  PAYHERE_SANDBOX: process.env.PAYHERE_SANDBOX !== 'false',
  PAYHERE_NOTIFY_URL: process.env.PAYHERE_NOTIFY_URL || 'http://localhost:5000/api/payments/payhere/notify',

  // Business settings
  WHATSAPP_BUSINESS_NUMBER: process.env.WHATSAPP_BUSINESS_NUMBER || '+94771234567',
  STORE_CURRENCY: process.env.STORE_CURRENCY || 'LKR',
  FREE_DELIVERY_THRESHOLD: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '7500'),
  DEFAULT_DELIVERY_FEE: parseFloat(process.env.DEFAULT_DELIVERY_FEE || '450'),

  // Email / SMTP Settings
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_FROM: process.env.SMTP_FROM || '"Velora Botanical Skincare" <noreply@velora.lk>',
};
