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
        const { grade } = req.query;
        const where: any = {};
        if (grade) where.grade = grade as string;

        const areas = await prisma.learningArea.findMany({
            where,
            include: {
                strands: {
                    include: {
                        subStrands: {
                            include: {
                                assessments: true
                            }
                        }
                    }
                }
            }
        });
        return res.status(200).json(areas);
    }

    if (req.method === 'POST') {
        const { name, grade, strands } = req.body;

        const area = await prisma.learningArea.create({
            data: {
                name,
                grade,
                strands: {
                    create: strands.map((s: any) => ({
                        name: s.name,
                        subStrands: {
                            create: s.subStrands.map((ss: any) => ({
                                name: ss.name,
                                assessments: {
                                    create: ss.assessments.map((a: any) => ({
                                        name: a.name,
                                        type: a.type,
                                        weight: a.weight || 1.0
                                    }))
                                }
                            }))
                        }
                    }))
                }
            },
            include: {
                strands: {
                    include: {
                        subStrands: {
                            include: {
                                assessments: true
                            }
                        }
                    }
                }
            }
        });

        await touchSync();
        return res.status(201).json(area);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
