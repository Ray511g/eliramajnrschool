import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            const status = await prisma.syncStatus.findUnique({
                where: { id: 'global' },
            });

            return res.status(200).json({
                lastUpdated: status?.lastUpdated || new Date(0).toISOString()
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch sync status' });
        }
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
