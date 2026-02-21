import { prisma } from './prisma';

export async function logAction(
    userId: string,
    userName: string,
    action: string,
    details: string,
    metadataOrIp?: string | {
        userRole?: string;
        module?: string;
        oldValue?: any;
        newValue?: any;
        ipAddress?: string;
        deviceInfo?: string;
    }
) {
    try {
        const isObj = typeof metadataOrIp === 'object' && metadataOrIp !== null;
        const metadata = isObj ? metadataOrIp : {};
        const ipAddress = isObj ? metadata.ipAddress : metadataOrIp as string;

        await prisma.auditLog.create({
            data: {
                userId,
                userName,
                userRole: (metadata as any).userRole,
                action,
                module: (metadata as any).module,
                details,
                oldValue: (metadata as any).oldValue,
                newValue: (metadata as any).newValue,
                ipAddress,
                deviceInfo: (metadata as any).deviceInfo
            }
        });
    } catch (error) {
        console.error('Audit log failed:', error);
    }
}
