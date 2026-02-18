import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // corsHeaders(res); // Handled by next.config.js
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'PUT') {
        const exam = await prisma.exam.update({ where: { id: id as string }, data: req.body });
        await touchSync();
        return res.status(200).json(exam);
    }

    if (req.method === 'DELETE') {
        await prisma.exam.delete({ where: { id: id as string } });
        await touchSync();
        return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'PUT, DELETE');
    res.status(405).json({ error: 'Method not allowed', receivedMethod: req.method, query: req.query });
}
