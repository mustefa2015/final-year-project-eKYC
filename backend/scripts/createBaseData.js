#!/usr/bin/env node
// File: backend/scripts/createBaseData.js
//✅ Successfully created:
//User ID: 680ea993a464520dd8235104
//API Key: 97012be1dfd2d572b593af721490e7b17ff266a0cbb7da74d486ad97f090894a

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeModels, getModels } from '../models/index.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';

// 1. Enhanced path comparison for Windows
const normalizePath = (p) => p.replace(/\\/g, '/').toLowerCase();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// 2. Explicit execution detection
const isDirectExecution = normalizePath(import.meta.url).endsWith(normalizePath(process.argv[1]));

// 3. Load config
dotenv.config({ path: envPath });
if (!process.env.MONGO_URL) {
  console.error('❌ MONGO_URL missing in .env');
  process.exit(1);
}

// 4. Main function
async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    console.log('🛠️ Initializing models...');
    await initializeModels();
    const { Client, ApiKey } = getModels();

    console.log('🔍 Checking for existing admin...');
    const existing = await Client.findOne({ email: 'diguwasofts1216@gmail.com' });
    if (existing) {
      console.log('ℹ️ Admin already exists');
      return;
    }

    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('G7zvVrPsk9kMj6i8RpZ0qXx2cD4w8kLm', 12);
    const admin = new Client({
      fan: '3485327089250384',
      name: 'Natinael Samuel Assefa',
      photo: 'https://res.cloudinary.com/dnsnj1z1g/image/upload/v1724857625/jidplwe5x2xwlxoxntyc.png',
      email: 'diguwasofts1216@gmail.com',
      firstName: 'Natinael',
      middleName: 'Samuel',
      lastName: 'Assefa',
      region: "Southern Nations Nationalities And People's Region",
      dateOfBirth: new Date('2003-02-05'),
      zone: 'Hadiya Zone',
      gender: 'male',
      woreda: 'Limu Woreda',
      nationality: 'Ethiopian',
      phoneNumber: '0904161978',
      isActive: true,
      password: 'G7zvVrPsk9kMj6i8RpZ0qXx2cD4w8kLm',
      
    });
    await admin.save();

    console.log('🔑 Generating API key...');
    const apiKey = crypto.randomBytes(32).toString('hex');
    await new ApiKey({
      key: apiKey,
      client: admin._id,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }).save();

    console.log('✅ Successfully created:');
    console.log(`   User ID: ${admin._id}`);
    console.log(`   API Key: ${apiKey}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// 5. Execution guard with Windows support
if (isDirectExecution) {
  console.log('🚀 Starting admin creation...');
  createAdmin();
} else {
  console.log('📦 Script loaded as module (use "node createBaseData.js" to run)');
}