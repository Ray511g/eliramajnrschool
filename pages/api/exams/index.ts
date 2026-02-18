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
        const { grade, term } = req.query;
        const where: any = {};
        if (grade) where.grade = grade as string;
        if (term) where.term = term as string;
        const exams = await prisma.exam.findMany({ where, orderBy: { date: 'desc' } });
        return res.status(200).json(exams);
    }

    if (req.method === 'POST') {
        const exam = await prisma.exam.create({ data: req.body });
        await touchSync();
        return res.status(201).json(exam);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
