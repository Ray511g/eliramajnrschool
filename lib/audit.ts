import { prisma } from './prisma';

export async function logAction(userId: string, userName: string, action: string, details: string, ipAddress?: string) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                userName,
                action,
                details,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Audit log failed:', error);
    }
}
