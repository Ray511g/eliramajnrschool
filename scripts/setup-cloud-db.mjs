// Cloud Database Setup Script
// Usage: node scripts/setup-cloud-db.mjs <DATABASE_URL>
// Example: node scripts/setup-cloud-db.mjs "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const dbUrl = process.argv[2];
if (!dbUrl) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ELIRAMA SCHOOL — Cloud Database Setup');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('  1. Go to https://neon.tech and sign up (free)');
    console.log('  2. Create a project named "elirama-school"');
    console.log('  3. Copy the connection string');
    console.log('  4. Run this command:');
    console.log('');
    console.log('     node scripts/setup-cloud-db.mjs "YOUR_CONNECTION_STRING"');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(0);
}

console.log('🚀 Setting up cloud database...');

// Step 1: Update .env with the cloud DATABASE_URL
const envPath = resolve(rootDir, '.env');
let envContent = '';
try {
    envContent = readFileSync(envPath, 'utf8');
} catch { /* no .env file yet */ }

// Replace or add DATABASE_URL
if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${dbUrl}"`);
} else {
    envContent += `\nDATABASE_URL="${dbUrl}"\n`;
}

// Make sure JWT_SECRET exists
if (!envContent.includes('JWT_SECRET=')) {
    envContent += `JWT_SECRET="elirama-school-super-secret-jwt-key-2026"\n`;
}

writeFileSync(envPath, envContent);
console.log('✅ Updated .env with cloud DATABASE_URL');

// Step 2: Push Prisma schema to the cloud database
console.log('📦 Pushing schema to cloud database...');
execSync('npx prisma db push --accept-data-loss', { cwd: rootDir, stdio: 'inherit' });

// Step 3: Seed the cloud database
console.log('🌱 Seeding cloud database...');
execSync('node prisma/seed.mjs', { cwd: rootDir, stdio: 'inherit' });

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  ✅ Cloud database ready!');
console.log('');
console.log('  NEXT: Add these to Vercel Environment Variables:');
console.log(`  DATABASE_URL = ${dbUrl}`);
console.log('  JWT_SECRET = elirama-school-super-secret-jwt-key-2026');
console.log('');
console.log('  Then redeploy your Vercel project.');
console.log('═══════════════════════════════════════════════════════════');
