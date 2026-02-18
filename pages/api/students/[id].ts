import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'GET') {
        const student = await prisma.student.findUnique({ where: { id: id as string } });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        return res.status(200).json(student);
    }

    if (req.method === 'PUT') {
        const data = req.body;
        if (data.totalFees !== undefined || data.paidFees !== undefined) {
            const existing = await prisma.student.findUnique({ where: { id: id as string } });
            if (existing) {
                const totalFees = data.totalFees ?? existing.totalFees;
                const paidFees = data.paidFees ?? existing.paidFees;
                data.feeBalance = totalFees - paidFees;
            }
        }
        const student = await prisma.student.update({ where: { id: id as string }, data });
        await touchSync();
        return res.status(200).json(student);
    }

    if (req.method === 'DELETE') {
        await prisma.student.delete({ where: { id: id as string } });
        await touchSync();
        return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
