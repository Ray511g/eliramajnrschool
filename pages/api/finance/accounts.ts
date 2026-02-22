import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            const accounts = await prisma.account.findMany({
                orderBy: { code: 'asc' }
            });
            return res.status(200).json(accounts);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch accounts' });
        }
    }
    return res.status(405).json({ message: 'Method not allowed' });
}
