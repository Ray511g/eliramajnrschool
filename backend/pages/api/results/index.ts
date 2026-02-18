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
        const { examId, studentId } = req.query;
        const where: any = {};
        if (examId) where.examId = examId as string;
        if (studentId) where.studentId = studentId as string;

        const results = await prisma.result.findMany({ where });
        return res.status(200).json(results);
    }

    if (req.method === 'POST') {
        const data = req.body;

        if (Array.isArray(data)) {
            // Bulk save
            const results = await Promise.all(
                data.map(r =>
                    prisma.result.upsert({
                        where: {
                            studentId_examId_subject: {
                                studentId: r.studentId,
                                examId: r.examId,
                                subject: r.subject
                            }
                        },
                        update: r,
                        create: r
                    })
                )
            );
            await touchSync();
            return res.status(200).json(results);
        } else {
            // Single save
            const result = await prisma.result.upsert({
                where: {
                    studentId_examId_subject: {
                        studentId: data.studentId,
                        examId: data.examId,
                        subject: data.subject
                    }
                },
                update: data,
                create: data
            });
            await touchSync();
            return res.status(200).json(result);
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
