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
        return res.status(403).json({ error: 'Insufficient permissions to publish fee structures' });
    }

    if (req.method === 'POST') {
        try {
            const { grade } = req.query;

            // 1. Get relevant fee structures
            const structures = await prisma.feeStructure.findMany({
                where: grade ? { grade: grade as string } : {}
            });

            if (structures.length === 0) {
                return res.status(400).json({ error: 'No fee structures found to apply' });
            }

            // 2. Group totals by grade
            const gradeTotals = structures.reduce((acc: Record<string, number>, item) => {
                acc[item.grade] = (acc[item.grade] || 0) + item.amount;
                return acc;
            }, {});

            const gradesToUpdate = Object.keys(gradeTotals);
            let totalUpdated = 0;

            // Use transaction for the entire bulk operation
            await prisma.$transaction(async (tx) => {
                for (const g of gradesToUpdate) {
                    const totalForGrade = gradeTotals[g];

                    // Performance Optimization: Use Raw SQL for bulk dynamic updates
                    // This is much faster than iterating through students
                    const count = await tx.$executeRaw`
                        UPDATE "Student" 
                        SET "totalFees" = ${totalForGrade}, 
                            "feeBalance" = ${totalForGrade} - "paidFees" 
                        WHERE "grade" = ${g} AND "status" = 'Active'
                    `;
                    totalUpdated += count;
                }

                // Lock the structures
                await tx.feeStructure.updateMany({
                    where: grade ? { grade: grade as string } : {},
                    data: { status: 'Published' }
                });

                // Audit Log within transaction
                await tx.auditLog.create({
                    data: {
                        userId: user.id || 'unknown',
                        userName: user.name || 'Unknown',
                        action: 'PUBLISH_FEE_STRUCTURE',
                        details: `Published fee structure${grade ? ` for ${grade}` : ''}. Optimized bulk update for ${totalUpdated} students.`
                    }
                });
            });

            // --- Post to General Ledger (Side Effect) ---
            const totalBilled = Object.values(gradeTotals).reduce((sum: number, val: number) => sum + val, 0);
            if (totalBilled > 0) {
                try {
                    const { postTransaction } = require('../../../utils/finance');
                    await postTransaction(
                        `BILL-${Date.now()}`,
                        [
                            { accountCode: '1003', description: `Periodic Fee Billing${grade ? ` for ${grade}` : ''}`, debit: totalBilled, credit: 0 },
                            { accountCode: '4001', description: `Periodic Fee Billing${grade ? ` for ${grade}` : ''}`, debit: 0, credit: totalBilled }
                        ]
                    );
                } catch (ledgerError) {
                    console.error('Billing Ledger Posting Failed:', ledgerError);
                }
            }

            await touchSync();
            return res.status(200).json({ success: true, updatedCount: totalUpdated });
        } catch (error) {
            console.error('Critical Apply Fee Error:', error);
            return res.status(500).json({ error: 'Failed to safely publish fee structure. Database remains unchanged.' });
        }
    }

    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
