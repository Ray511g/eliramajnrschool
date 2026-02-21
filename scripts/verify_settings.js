const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst({
        include: { timeSlots: true }
    });
    console.log('--- SETTINGS ---');
    console.log(JSON.stringify(settings, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
