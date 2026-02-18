import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'PUT') {
        const teacher = await prisma.teacher.update({ where: { id: id as string }, data: req.body });
        return res.status(200).json(teacher);
    }

    if (req.method === 'DELETE') {
        await prisma.teacher.delete({ where: { id: id as string } });
        return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
