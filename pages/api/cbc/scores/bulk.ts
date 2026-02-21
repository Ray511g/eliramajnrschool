import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../../lib/auth';
import { touchSync } from '../../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'POST') {
        const data = req.body; // Array of AssessmentScore

        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Expected an array of scores' });
        }

        try {
            const results = await Promise.all(
                data.map(s =>
                    prisma.assessmentScore.upsert({
                        where: {
                            studentId_assessmentItemId: {
                                studentId: s.studentId,
                                assessmentItemId: s.assessmentItemId
                            }
                        },
                        update: {
                            score: s.score,
                            level: s.level,
                            remarks: s.remarks
                        },
                        create: {
                            studentId: s.studentId,
                            assessmentItemId: s.assessmentItemId,
                            score: s.score,
                            level: s.level,
                            remarks: s.remarks
                        }
                    })
                )
            );

            await touchSync();
            return res.status(200).json(results);
        } catch (error: any) {
            console.error('Bulk save error:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
