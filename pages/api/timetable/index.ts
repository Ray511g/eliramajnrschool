import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        const { grade } = req.query;
        const where: any = {};
        if (grade) where.grade = grade as string;
        const entries = await prisma.timetableEntry.findMany({ where, orderBy: { day: 'asc' } });
        return res.status(200).json(entries);
    }

    if (req.method === 'POST') {
        const entry = await prisma.timetableEntry.create({ data: req.body });
        await touchSync();
        return res.status(201).json(entry);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
