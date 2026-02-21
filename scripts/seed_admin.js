import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@elirama.ac.ke' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'admin@elirama.ac.ke',
            username: 'admin',
            password: hashedPassword,
            role: 'Super Admin',
            firstName: 'Super',
            lastName: 'Admin',
            permissions: ['MANAGE_USERS', 'MANAGE_SETTINGS', 'VIEW_REPORTS']
        }
    });
    console.log('Seeded admin user:', admin.email);
    await prisma.$disconnect();
    process.exit(0);
}

main().catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
});
