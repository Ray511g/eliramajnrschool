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
        const { date, grade } = req.query;
        const where: any = {};
        if (date) where.date = date as string;
        if (grade) where.grade = grade as string;
        const records = await prisma.attendance.findMany({ where, orderBy: { createdAt: 'desc' } });
        return res.status(200).json(records);
    }

    if (req.method === 'POST') {
        // Bulk upsert attendance records for a date
        const { records } = req.body as { records: Array<{ studentId: string; studentName: string; grade: string; date: string; status: string }> };
        if (!records || !Array.isArray(records)) return res.status(400).json({ error: 'records array required' });

        const upserted = await Promise.all(
            records.map(r =>
                prisma.attendance.upsert({
                    where: { studentId_date: { studentId: r.studentId, date: r.date } },
                    update: { status: r.status },
                    create: r,
                })
            )
        );
        await touchSync();
        return res.status(200).json(upserted);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
