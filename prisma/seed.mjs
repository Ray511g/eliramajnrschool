// Seed script — run with: node prisma/seed.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data to avoid conflicts
    await prisma.journalEntry.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.payrollEntry.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    console.log('🧹 Cleared existing financial, user, and role data');

    // Create Roles
    const roles = [
        { name: 'Super Admin', permissions: {} },
        { name: 'Teacher', permissions: {} },
        { name: 'Accountant', permissions: {} },
        { name: 'Principal', permissions: {} },
        { name: 'Auditor', permissions: {} },
    ];
    for (const r of roles) {
        await prisma.role.upsert({ where: { name: r.name }, update: {}, create: r });
    }
    console.log('✅ Roles created');

    const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
    const teacherRole = await prisma.role.findUnique({ where: { name: 'Teacher' } });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@schoolsystem.ac.ke',
            password: hashedPassword,
            roleId: superAdminRole.id
        },
    });
    console.log('✅ Admin user created');

    // Create teacher user
    await prisma.user.create({
        data: {
            name: 'Teacher User',
            email: 'teacher@schoolsystem.ac.ke',
            password: await bcrypt.hash('teacher123', 10),
            roleId: teacherRole.id
        },
    });
    console.log('✅ Teacher user created');
    console.log('✅ Teacher user created');

    // Create Settings
    await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            schoolName: 'School Management System',
            motto: 'Academic Excellence',
            phone: '+254 700 000 000',
            email: 'info@schoolsystem.ac.ke',
            address: 'Nairobi, Kenya',
            currentTerm: 'Term 1',
            currentYear: 2026
        },
    });
    console.log('✅ Settings created');

    // Create Chart of Accounts
    const accounts = [
        { code: '1001', name: 'Cash on Hand', type: 'ASSET', category: 'Current Asset', isSystem: true },
        { code: '1002', name: 'Bank Account', type: 'ASSET', category: 'Current Asset', isSystem: true },
        { code: '1003', name: 'Accounts Receivable (Fees)', type: 'ASSET', category: 'Current Asset', isSystem: true },
        { code: '4001', name: 'Tuition Fees', type: 'INCOME', category: 'Direct Income', isSystem: true },
        { code: '4002', name: 'Transport Fees', type: 'INCOME', category: 'Direct Income', isSystem: true },
        { code: '4003', name: 'Activity Fees', type: 'INCOME', category: 'Direct Income', isSystem: true },
        { code: '4004', name: 'Other Income', type: 'INCOME', category: 'Indirect Income', isSystem: true },
        { code: '5001', name: 'Salaries – BOM Teachers', type: 'EXPENSE', category: 'Operating Expense', isSystem: true },
        { code: '5002', name: 'Salaries – Support Staff', type: 'EXPENSE', category: 'Operating Expense', isSystem: true },
        { code: '5003', name: 'Utilities', type: 'EXPENSE', category: 'Operating Expense', isSystem: true },
        { code: '5004', name: 'Maintenance', type: 'EXPENSE', category: 'Operating Expense', isSystem: true },
        { code: '5005', name: 'Feeding', type: 'EXPENSE', category: 'Operating Expense', isSystem: true },
        { code: '5006', name: 'Academic Materials', type: 'EXPENSE', category: 'Operating Expense', isSystem: true },
        { code: '5007', name: 'Administration', type: 'EXPENSE', category: 'Operating Expense', isSystem: true },
        { code: '2001', name: 'Pending Payments', type: 'LIABILITY', category: 'Current Liability', isSystem: true },
        { code: '2002', name: 'Accruals', type: 'LIABILITY', category: 'Current Liability', isSystem: true },
    ];
    for (const a of accounts) {
        await prisma.account.upsert({ where: { code: a.code }, update: {}, create: a });
    }
    console.log(`✅ ${accounts.length} accounts created`);

    // Create sync status
    await prisma.syncStatus.upsert({ where: { id: 'global' }, update: {}, create: { id: 'global' } });
    console.log('✅ Sync status created');

    console.log('🌱 Seeding complete! (Infrastructure Ready)');
}

main()
    .catch((e) => { console.error('Seeding failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
