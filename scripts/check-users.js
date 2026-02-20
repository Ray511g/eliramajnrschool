
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log('---USERS_LIST---');
    console.log(JSON.stringify(users, null, 2));
    console.log('---END---');
}
main().catch(console.error).finally(() => prisma.$disconnect());
