import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
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
