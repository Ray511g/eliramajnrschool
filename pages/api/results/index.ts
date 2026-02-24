import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'exams', 'VIEW', res)) return;
        try {
            const { examId, studentId, subject, page = '1', limit = '100' } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            const where: any = {};
            if (examId) where.examId = examId as string;
            if (studentId) where.studentId = studentId as string;
            if (subject) where.subject = subject as string;

            const [results, total] = await Promise.all([
                prisma.result.findMany({
                    where,
                    orderBy: { marks: 'desc' },
                    skip,
                    take,
                    include: { student: { select: { firstName: true, lastName: true, admissionNumber: true } } }
                }),
                prisma.result.count({ where })
            ]);

            return res.status(200).json({
                results,
                meta: {
                    total,
                    page: parseInt(page as string),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            });
        } catch (error: any) {
            console.error('API GET Results Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve academic results' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'exams', 'EDIT', res)) return;
        try {
            const data = req.body;
            const records = Array.isArray(data) ? data : [data];

            if (records.length === 0) return res.status(400).json({ error: 'No results provided to save' });

            // Atomic bulk upsert
            const savedResults = await prisma.$transaction(
                records.map(r =>
                    prisma.result.upsert({
                        where: {
                            studentId_examId_subject: {
                                studentId: r.studentId,
                                examId: r.examId,
                                subject: r.subject
                            }
                        },
                        update: {
                            marks: parseFloat(r.marks),
                            level: r.level || 'ME', // Default to Meeting Expectations
                            remarks: r.remarks || null,
                            studentName: r.studentName
                        },
                        create: {
                            studentId: r.studentId,
                            examId: r.examId,
                            subject: r.subject,
                            studentName: r.studentName,
                            marks: parseFloat(r.marks),
                            level: r.level || 'ME',
                            remarks: r.remarks || null
                        }
                    })
                )
            );

            await logAction(
                user.id,
                user.name,
                'RECORD_RESULTS',
                `Recorded academic scores for ${savedResults.length} students.`,
                { module: 'exams' }
            );

            await touchSync();
            return res.status(200).json({
                success: true,
                count: savedResults.length,
                results: savedResults.slice(0, 10) // Return sample
            });
        } catch (error: any) {
            console.error('API POST Results Error:', error);
            return res.status(500).json({ error: 'Failed to save academic records' });
        }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
