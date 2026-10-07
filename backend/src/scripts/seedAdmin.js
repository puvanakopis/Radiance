import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { AdminModel } from '../models/admin.model.js';

async function seedAdmin() {
  try {
    await connectDB();

    const adminEmail = ENV.ADMIN_EMAIL || 'admin@skinova.com';
    const adminPassword = ENV.ADMIN_PASSWORD || 'Admin@123456';
    const adminFirstName = ENV.ADMIN_FIRST_NAME || 'Master';
    const adminLastName = ENV.ADMIN_LAST_NAME || 'Admin';

    const existingAdmin = await AdminModel.findOne({ email: adminEmail.toLowerCase() });
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.firstName = adminFirstName;
      existingAdmin.lastName = adminLastName;
      existingAdmin.isActive = true;
      await existingAdmin.save();

      console.log(`[Seed Admin]: Admin with email ${adminEmail} updated successfully (${existingAdmin._id}).`);
      console.log(`- Updated password for: ${existingAdmin.email}`);
    } else {
      const newAdmin = await AdminModel.create({
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'ADMIN',
        permissions: ['all'],
        isActive: true,
      });

      console.log(`[Seed Admin]: Admin successfully created:`);
      console.log(`- ID: ${newAdmin._id}`);
      console.log(`- Email: ${newAdmin.email}`);
      console.log(`- Role: ${newAdmin.role}`);
    }
  } catch (error) {
    console.error('[Seed Admin Error]:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seedAdmin();
