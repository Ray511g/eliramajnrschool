import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const accounts = [
    { code: '1001', name: 'Cash at Hand', type: 'ASSET', category: 'Current Asset' },
    { code: '1002', name: 'Bank Account', type: 'ASSET', category: 'Current Asset' },
    { code: '1003', name: 'Accounts Receivable (Fees)', type: 'ASSET', category: 'Current Asset' },

    { code: '4001', name: 'Tuition Income', type: 'INCOME', category: 'Operating Income' },
    { code: '4002', name: 'Admission Fees', type: 'INCOME', category: 'Operating Income' },
    { code: '4003', name: 'Transport Fees', type: 'INCOME', category: 'Operating Income' },
    { code: '4004', name: 'Exam Fees', type: 'INCOME', category: 'Operating Income' },
    { code: '4005', name: 'Activity Fees', type: 'INCOME', category: 'Operating Income' },

    { code: '5001', name: 'Teaching Salaries', type: 'EXPENSE', category: 'Personnel Expense' },
    { code: '5002', name: 'Support Staff Salaries', type: 'EXPENSE', category: 'Personnel Expense' },
    { code: '5003', name: 'Utilities (Rent/Water/Elec)', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5004', name: 'Repairs & Maintenance', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5005', name: 'Food & Feeding', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5006', name: 'Educational Materials', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5007', name: 'General Administration', type: 'EXPENSE', category: 'Operating Expense' },
];

async function seed() {
    console.log('🚀 Seeding Chart of Accounts...');
    for (const acc of accounts) {
        await prisma.account.upsert({
            where: { code: acc.code },
            update: { name: acc.name, type: acc.type, category: acc.category },
            create: { ...acc, isSystem: true }
        });
    }
    console.log('✅ Accounts seeded!');
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
