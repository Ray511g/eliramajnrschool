
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

            // 1. Get relevant fee structures
            const structures = await prisma.feeStructure.findMany({
                where: grade ? { grade: grade as string } : {}
            });

            // 2. Group totals by grade
            const gradeTotals = structures.reduce((acc: any, item) => {
                if (!acc[item.grade]) acc[item.grade] = 0;
                acc[item.grade] += item.amount;
                return acc;
            }, {});

            // 3. Process grades
            const gradesToUpdate = Object.keys(gradeTotals);
            let totalUpdated = 0;

            for (const g of gradesToUpdate) {
                const totalForGrade = gradeTotals[g];

                // Update all students in this grade
                const students = await prisma.student.findMany({ where: { grade: g } });

                for (const student of students) {
                    await prisma.student.update({
                        where: { id: student.id },
                        data: {
                            totalFees: totalForGrade,
                            feeBalance: totalForGrade - student.paidFees
                        }
                    });
                    totalUpdated++;
                }
            }

            // 4. Lock the fee structures (Set status to Published)
            await prisma.feeStructure.updateMany({
                where: grade ? { grade: grade as string } : {},
                data: { status: 'Published' }
            });

            // 5. Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: user.id || 'unknown',
                    userName: user.name || 'Unknown',
                    action: 'PUBLISH_FEE_STRUCTURE',
                    details: `Published fee structure${grade ? ` for ${grade}` : ''}. Updated ${totalUpdated} student balances.`
                }
            });

            await touchSync();
            return res.status(200).json({ success: true, updatedCount: totalUpdated });
        } catch (error) {
            console.error('Apply fee structure error:', error);
            return res.status(500).json({ error: 'Failed to publish fee structure' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
