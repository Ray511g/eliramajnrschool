import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'students', 'VIEW', res)) return;
        try {
            const { date, grade, studentId } = req.query;
            const where: any = {};
            if (date) where.date = date as string;
            if (grade) where.grade = grade as string;
            if (studentId) where.studentId = studentId as string;

            const records = await prisma.attendance.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(records);
        } catch (error) {
            console.error('API GET Attendance Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve attendance logs' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'teachers', 'EDIT', res) && !checkPermission(user, 'students', 'EDIT', res)) return;

        const { records } = req.body as { records: Array<{ studentId: string; studentName: string; grade: string; date: string; status: string }> };
        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ error: 'Attendance records array is required' });
        }

        try {
            // Bulk upsert within a transaction for data consistency
            const result = await prisma.$transaction(
                records.map(r =>
                    prisma.attendance.upsert({
                        where: { studentId_date: { studentId: r.studentId, date: r.date } },
                        update: { status: r.status },
                        create: r,
                    })
                )
            );

            await touchSync();
            return res.status(200).json({
                success: true,
                message: `Successfully recorded attendance for ${result.length} students`
            });
        } catch (error) {
            console.error('API POST Attendance Error:', error);
            return res.status(500).json({ error: 'System error while saving attendance data' });
        }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
