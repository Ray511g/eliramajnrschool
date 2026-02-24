import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../../lib/auth';
import { touchSync } from '../../../../lib/sync';
import { logAction } from '../../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    // Permission: Teachers or Admin can record scores
    if (!checkPermission(user, 'exams', 'EDIT', res)) return;

    try {
        const data = req.body; // Array of AssessmentScore
        const records = Array.isArray(data) ? data : [];

        if (records.length === 0) {
            return res.status(400).json({ error: 'Valid array of assessment scores is required' });
        }

        // Use Prisma Transaction for atomic bulk updates
        const results = await prisma.$transaction(
            records.map(s =>
                prisma.assessmentScore.upsert({
                    where: {
                        studentId_assessmentItemId: {
                            studentId: s.studentId,
                            assessmentItemId: s.assessmentItemId
                        }
                    },
                    update: {
                        score: parseFloat(s.score) || 0,
                        level: s.level || 'ME',
                        remarks: s.remarks || null
                    },
                    create: {
                        studentId: s.studentId,
                        assessmentItemId: s.assessmentItemId,
                        score: parseFloat(s.score) || 0,
                        level: s.level || 'ME',
                        remarks: s.remarks || null
                    }
                })
            )
        );

        await logAction(
            user.id,
            user.name,
            'RECORD_CBC_SCORES',
            `Bulk recorded CBC assessment scores for ${results.length} students`,
            { module: 'cbc' }
        );

        await touchSync();
        return res.status(200).json({
            success: true,
            message: `Successfully updated ${results.length} assessment records`,
            count: results.length
        });
    } catch (error: any) {
        console.error('CBC Bulk Save Error:', error);
        return res.status(500).json({ error: 'System error while saving CBC assessments' });
    }
}
