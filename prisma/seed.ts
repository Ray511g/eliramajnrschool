import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Cleaning existing data and seeding roles/admin...');

    // Clear all existing data in correct order for foreign keys
    await prisma.assessmentScore.deleteMany({});
    await prisma.assessmentItem.deleteMany({});
    await prisma.subStrand.deleteMany({});
    await prisma.strand.deleteMany({});
    await prisma.learningArea.deleteMany({});
    await prisma.timetableEntry.deleteMany({});
    await prisma.payment.deleteMany({}); // Note: Model is Payment, not feePayment
    await prisma.result.deleteMany({}); // Note: Model is Result, not studentResult
    await prisma.attendance.deleteMany({}); // Note: Model is Attendance, not attendanceRecord
    await prisma.exam.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.feeStructure.deleteMany({});
    await prisma.timeSlot.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});

    // Create roles
    const roles = [
        { name: 'Super Admin', permissions: { users: ['VIEW', 'CREATE', 'EDIT', 'DELETE'], settings: ['VIEW', 'EDIT'], fees: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PUBLISH', 'APPROVE', 'REVERT'], academic: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PUBLISH'], students: ['VIEW', 'CREATE', 'EDIT', 'DELETE'], teachers: ['VIEW', 'CREATE', 'EDIT', 'DELETE'], audit: ['VIEW'] } },
        { name: 'Principal', permissions: { users: ['VIEW'], settings: ['VIEW'], fees: ['VIEW', 'APPROVE'], academic: ['VIEW', 'PUBLISH'], students: ['VIEW', 'EDIT'], teachers: ['VIEW'], audit: ['VIEW'] } },
        { name: 'Teacher', permissions: { academic: ['VIEW', 'CREATE', 'EDIT'], students: ['VIEW'] } },
        { name: 'Bursar', permissions: { fees: ['VIEW', 'CREATE', 'EDIT'], students: ['VIEW'] } }
    ];

    for (const r of roles) {
        await prisma.role.create({
            data: { name: r.name, permissions: r.permissions as any },
        });
    }
    console.log('✅ Roles created');

    // Create default school admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: {
            name: 'School Administrator',
            email: 'admin@elirama.ac.ke',
            username: 'admin',
            password: hashedPassword,
            role: { connect: { name: 'Super Admin' } },
            permissions: []
        },
    });
    console.log('✅ Production Admin user created');

    // Create default settings
    await prisma.settings.upsert({
        where: { id: 'default' },
        update: {
            schoolName: 'Elirama School',
            motto: 'Knowledge is Power',
            phone: '+254700000000',
            email: 'info@elirama.ac.ke',
            address: 'P.O. Box 1234, Nairobi',
            currentTerm: 'Term 1',
            currentYear: new Date().getFullYear(),
        },
        create: {
            id: 'default',
            schoolName: 'Elirama School',
            motto: 'Knowledge is Power',
            phone: '+254700000000',
            email: 'info@elirama.ac.ke',
            address: 'P.O. Box 1234, Nairobi',
            currentTerm: 'Term 1',
            currentYear: new Date().getFullYear(),
        },
    });
    console.log('✅ Default settings initialized');

    // Ensure sync status exists
    await prisma.syncStatus.upsert({
        where: { id: 'global' },
        update: { lastUpdated: new Date() },
        create: { id: 'global', lastUpdated: new Date() },
    });

    console.log('✅ Clean production environment ready!');
}

main()
    .catch((e) => {
        console.error('Environment cleanup failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
