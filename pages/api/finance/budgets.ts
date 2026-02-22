import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        try {
            const { department, category, allocatedAmount, year } = req.body;
            const budget = await prisma.budget.create({
                data: {
                    department,
                    category,
                    allocatedAmount,
                    year,
                    spentAmount: 0 // New budget starts at 0 spent
                }
            });

            await logAction(user.id, user.name, 'CREATE_BUDGET', `Created budget for ${category} in ${department}`, { module: 'Finance' });
            return res.status(201).json(budget);
        } catch (error) {
            console.error('Create Budget Error:', error);
            return res.status(500).json({ error: 'Failed to create budget allocation' });
        }
    }

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            const budgets = await prisma.budget.findMany({
                orderBy: { year: 'desc' }
            });
            return res.status(200).json(budgets);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch budgets' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
