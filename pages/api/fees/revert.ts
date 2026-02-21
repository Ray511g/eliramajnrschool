
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'POST') {
        try {
            const { grade } = req.query;
            if (!grade) return res.status(400).json({ error: 'Grade required' });

            // Update all fee structure items for this grade to Draft
            await prisma.feeStructure.updateMany({
                where: { grade: grade as string },
                data: { status: 'Draft' }
            });

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: user.id || 'unknown',
                    userName: user.name || 'Unknown',
                    action: 'REVERT_FEE_STRUCTURE',
                    details: `Reverted fee structure for ${grade} to Draft.`
                }
            });

            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Revert fee structure error:', error);
            return res.status(500).json({ error: 'Failed to revert fee structure' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
