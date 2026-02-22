const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const keys = Object.keys(prisma).filter(key => !key.startsWith('_'));
    console.log('Available models/keys in prisma:');
    console.log(keys);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
