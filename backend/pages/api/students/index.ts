import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        const { grade, search } = req.query;
        const where: any = {};
        if (grade) where.grade = grade as string;
        if (search) {
            where.OR = [
                { firstName: { contains: search as string, mode: 'insensitive' } },
                { lastName: { contains: search as string, mode: 'insensitive' } },
                { admissionNumber: { contains: search as string, mode: 'insensitive' } },
            ];
        }
        const students = await prisma.student.findMany({ where, orderBy: { createdAt: 'desc' } });
        return res.status(200).json(students);
    }

    if (req.method === 'POST') {
        const data = req.body;
        const student = await prisma.student.create({
            data: {
                ...data,
                feeBalance: data.totalFees - (data.paidFees || 0),
            },
        });
        return res.status(201).json(student);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
