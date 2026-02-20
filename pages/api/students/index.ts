import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
        await logAction(
            user.id,
            user.name,
            'CREATE_STUDENT',
            `Registered new student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`,
            (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
        );

        await touchSync();
        return res.status(201).json(student);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
