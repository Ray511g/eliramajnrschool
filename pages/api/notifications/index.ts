import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        const roleName = typeof user.role === 'string' ? user.role : (user.role as any)?.name;

        try {
            const notifications = await prisma.notification.findMany({
                where: {
                    OR: [
                        { userId: user.id },
                        { role: roleName }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            });
            return res.status(200).json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id } = req.body;
            await prisma.notification.update({
                where: { id },
                data: { read: true }
            });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update notification' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
