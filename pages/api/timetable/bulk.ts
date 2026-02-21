import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'POST') {
        try {
            const entries = req.body;
            if (!Array.isArray(entries)) {
                return res.status(400).json({ error: 'Expected an array of timetable entries' });
            }

            // We use a transaction to delete old and insert new, or just update
            // For auto-generation, we usually replace the whole timetable for those grades
            // But here we'll just do a simple bulk update/upsert or just create many

            // To be safe and simple: clear existing for the grades mentioned in the entries and re-insert
            const grades = Array.from(new Set(entries.map(e => e.grade)));

            await prisma.$transaction([
                prisma.timetableEntry.deleteMany({
                    where: { grade: { in: grades as string[] } }
                }),
                prisma.timetableEntry.createMany({
                    data: entries.map(e => ({
                        grade: e.grade,
                        day: e.day,
                        slotId: e.slotId,
                        timeSlot: e.timeSlot,
                        subject: e.subject,
                        teacherId: e.teacherId,
                        teacherName: e.teacherName
                    }))
                })
            ]);

            await touchSync();
            return res.status(201).json({ success: true, count: entries.length });
        } catch (error) {
            console.error('Bulk timetable error:', error);
            return res.status(500).json({ error: 'Failed to update timetable' });
        }
    }

    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
}
