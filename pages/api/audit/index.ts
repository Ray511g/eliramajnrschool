
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    // Only Admin can view audit logs
    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    if (req.method === 'GET') {
        try {
            const logs = await prisma.auditLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 100 // Limit to last 100 logs for performance
            });
            return res.status(200).json(logs);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            return res.status(500).json({ error: 'Failed to fetch audit logs' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
