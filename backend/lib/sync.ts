import { prisma } from './prisma';

/**
 * Updates the global synchronization timestamp.
 * This should be called whenever any data in the system is modified.
 */
export async function touchSync() {
    try {
        await prisma.syncStatus.upsert({
            where: { id: 'global' },
            update: { lastUpdated: new Date() },
            create: { id: 'global', lastUpdated: new Date() },
        });
    } catch (error) {
        console.error('Failed to update sync status:', error);
    }
}
