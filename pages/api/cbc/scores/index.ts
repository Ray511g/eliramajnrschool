import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../../lib/auth';
import { touchSync } from '../../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        const { studentId, assessmentItemId } = req.query;
        const where: any = {};
        if (studentId) where.studentId = studentId as string;
        if (assessmentItemId) where.assessmentItemId = assessmentItemId as string;

        const scores = await prisma.assessmentScore.findMany({ where });
        return res.status(200).json(scores);
    }

    if (req.method === 'POST') {
        const data = req.body;
        const { assessmentItemId, studentId } = data;

        const score = await prisma.assessmentScore.upsert({
            where: {
                studentId_assessmentItemId: {
                    studentId: data.studentId,
                    assessmentItemId: data.assessmentItemId
                }
            },
            update: {
                score: data.score,
                level: data.level,
                remarks: data.remarks
            },
            create: data
        });

        await touchSync();
        return res.status(200).json(score);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
