import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { postTransaction } from '../../../utils/finance';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const expenses = await prisma.expenseRequest.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(expenses);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch expenses' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { category, description, department, amount, requestedById, requestedByName } = req.body;
            const expense = await prisma.expenseRequest.create({
                data: {
                    category,
                    description,
                    department,
                    amount,
                    requestedById,
                    requestedByName,
                    status: 'Pending'
                }
            });

            // Log activity
            await prisma.auditLog.create({
                data: {
                    userId: requestedById,
                    userName: requestedByName,
                    action: 'REQUEST_EXPENSE',
                    module: 'Finance',
                    details: `Expense request of ${amount} for ${description} submitted.`
                }
            });

            return res.status(201).json(expense);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create expense request' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id, action, userId, userName } = req.body; // action: APPROVE, PAY, REJECT

            const currentExpense = await prisma.expenseRequest.findUnique({ where: { id } });
            if (!currentExpense) return res.status(404).json({ error: 'Expense not found' });

            if (action === 'APPROVE') {
                const updated = await prisma.expenseRequest.update({
                    where: { id },
                    data: {
                        status: 'Approved',
                        approvedById: userId,
                        approvedByName: userName
                    }
                });
                return res.status(200).json(updated);
            }

            if (action === 'PAY') {
                if (currentExpense.status !== 'Approved') {
                    return res.status(400).json({ error: 'Only approved expenses can be paid' });
                }

                // 1. Mark as Paid
                const updated = await prisma.expenseRequest.update({
                    where: { id },
                    data: {
                        status: 'Paid',
                        paidAt: new Date(),
                        journalPosted: true
                    }
                });

                // 2. Post to Ledger
                // Map category to account code (simple mapping for now)
                const categoryMap: Record<string, string> = {
                    'Utilities': '5003',
                    'Maintenance': '5004',
                    'Feeding': '5005',
                    'Academic Materials': '5006',
                    'Administration': '5007',
                    'Salaries': '5001' // Example
                };

                const expenseAccountCode = categoryMap[currentExpense.category] || '5007'; // Fallback to Admin

                await postTransaction(
                    `EXP-${currentExpense.id}`,
                    [
                        { accountCode: expenseAccountCode, description: `Expense: ${currentExpense.description}`, debit: currentExpense.amount, credit: 0 },
                        { accountCode: '1001', description: `Payment for ${currentExpense.description}`, debit: 0, credit: currentExpense.amount }
                    ],
                    currentExpense.id
                );

                return res.status(200).json(updated);
            }

            if (action === 'REJECT') {
                const updated = await prisma.expenseRequest.update({
                    where: { id },
                    data: { status: 'Rejected' }
                });
                return res.status(200).json(updated);
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to update expense status' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
