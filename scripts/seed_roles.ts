import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const roles = [
        {
            name: 'Super Admin',
            permissions: {
                users: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
                settings: ['VIEW', 'EDIT'],
                fees: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PUBLISH', 'APPROVE', 'REVERT'],
                academic: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PUBLISH'],
                students: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
                teachers: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
                audit: ['VIEW']
            }
        },
        {
            name: 'School Admin',
            permissions: {
                users: ['VIEW'],
                settings: ['VIEW'],
                fees: ['VIEW', 'CREATE', 'EDIT', 'PUBLISH'],
                academic: ['VIEW', 'CREATE', 'EDIT', 'PUBLISH'],
                students: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
                teachers: ['VIEW', 'CREATE', 'EDIT'],
                audit: ['VIEW']
            }
        },
        {
            name: 'Finance Officer',
            permissions: {
                fees: ['VIEW', 'CREATE', 'EDIT', 'PUBLISH'],
                students: ['VIEW'],
                audit: ['VIEW']
            }
        },
        {
            name: 'Academic Officer',
            permissions: {
                academic: ['VIEW', 'CREATE', 'EDIT', 'PUBLISH'],
                students: ['VIEW'],
                teachers: ['VIEW']
            }
        },
        {
            name: 'Teacher',
            permissions: {
                academic: ['VIEW', 'CREATE', 'EDIT'],
                students: ['VIEW']
            }
        },
        {
            name: 'Auditor',
            permissions: {
                fees: ['VIEW'],
                academic: ['VIEW'],
                students: ['VIEW'],
                audit: ['VIEW']
            }
        }
    ];

    console.log('Seeding roles...');

    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: { permissions: role.permissions as any },
            create: { name: role.name, permissions: role.permissions as any }
        });
    }

    // Assign Super Admin role to existing admin users
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
    if (superAdminRole) {
        await prisma.user.updateMany({
            where: { email: 'admin@elirama.ac.ke' },
            data: { roleId: superAdminRole.id }
        });
        console.log('Assigned Super Admin role to admin@elirama.ac.ke');
    }

    console.log('Roles seeded successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
