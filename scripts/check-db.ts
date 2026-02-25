import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const serviceOrders = await prisma.schoolServiceOrder.count();
    const purchaseOrders = await prisma.purchaseOrder.count();
    console.log('Service Orders:', serviceOrders);
    console.log('Purchase Orders:', purchaseOrders);
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
