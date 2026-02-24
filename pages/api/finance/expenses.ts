import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';
import { postTransaction } from '../../../utils/finance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            const { status, category, department, page = '1', limit = '50' } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            const where: any = {};
            if (status) where.status = status as string;
            if (category) where.category = category as string;
            if (department) where.department = department as string;

            const [expenses, total] = await Promise.all([
                prisma.expenseRequest.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take,
                }),
                prisma.expenseRequest.count({ where })
            ]);

            return res.status(200).json({
                expenses,
                meta: {
                    total,
                    page: parseInt(page as string),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            });
        } catch (error) {
            console.error('API GET Expenses Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve expense ledger' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'finance', 'CREATE', res)) return;
        try {
            const { category, description, department, amount, requestedById, requestedByName } = req.body;
            const expAmount = parseFloat(amount);

            if (!category || !description || !expAmount || expAmount <= 0) {
                return res.status(400).json({ error: 'Valid category, description, and positive amount are required' });
            }

            const expense = await prisma.expenseRequest.create({
                data: {
                    category,
                    description,
                    department: department || 'General',
                    amount: expAmount,
                    requestedById: requestedById || user.id,
                    requestedByName: requestedByName || user.name,
                    status: 'Pending'
                }
            });

            await logAction(
                user.id,
                user.name,
                'REQUEST_EXPENSE',
                `Expense request submitted: ${description} (KSh ${expAmount})`,
                { module: 'finance' }
            );

            // Notify Principal for approval
            await prisma.notification.create({
                data: {
                    role: 'Principal',
                    title: 'Action Required: Expense Approval',
                    message: `${expense.requestedByName} requested KSh ${expAmount} for ${description}`,
                    type: 'APPROVAL',
                    link: '/finance?tab=Expenditure'
                }
            }).catch(e => console.warn('Notification failed:', e));

            return res.status(201).json(expense);
        } catch (error) {
            console.error('API POST Expense Error:', error);
            return res.status(500).json({ error: 'Failed to submit expense request' });
        }
    }

    if (method === 'PUT') {
        const { id, action } = req.body;
        if (!id || !action) return res.status(400).json({ error: 'Expense ID and action are required' });

        try {
            const current = await prisma.expenseRequest.findUnique({ where: { id } });
            if (!current) return res.status(404).json({ error: 'Expense request not found' });

            if (action === 'APPROVE') {
                if (!checkPermission(user, 'finance', 'APPROVE', res)) return;
                const updated = await prisma.expenseRequest.update({
                    where: { id },
                    data: {
                        status: 'Approved',
                        approvedById: user.id,
                        approvedByName: user.name
                    }
                });
                await logAction(user.id, user.name, 'APPROVE_EXPENSE', `Approved expense: ${current.description}`, { module: 'finance' });
                return res.status(200).json(updated);
            }

            if (action === 'PAY') {
                if (!checkPermission(user, 'finance', 'PAY', res)) return;
                if (current.status !== 'Approved') return res.status(400).json({ error: 'Only approved requests can be paid' });

                const categoryMap: Record<string, string> = {
                    'Utilities': '5003',
                    'Maintenance': '5004',
                    'Feeding': '5005',
                    'Academic Materials': '5006',
                    'Administration': '5007',
                    'Salaries': '5001'
                };
                const expenseAccountCode = categoryMap[current.category] || '5007';

                // Use transaction to ensure status and ledger are in sync
                const result = await prisma.$transaction(async (tx) => {
                    const updated = await tx.expenseRequest.update({
                        where: { id },
                        data: {
                            status: 'Paid',
                            paidAt: new Date(),
                            journalPosted: true
                        }
                    });

                    await postTransaction(
                        `EXP-${current.id}`,
                        [
                            { accountCode: expenseAccountCode, description: `Expense: ${current.description}`, debit: current.amount, credit: 0 },
                            { accountCode: '1001', description: `Payment for ${current.description}`, debit: 0, credit: current.amount }
                        ],
                        current.id,
                        new Date(),
                        tx // Pass transaction client
                    );

                    return updated;
                });

                await logAction(user.id, user.name, 'PAY_EXPENSE', `Paid expense: ${current.description} (KSh ${current.amount})`, { module: 'finance' });
                return res.status(200).json(result);
            }

            if (action === 'REJECT') {
                if (!checkPermission(user, 'finance', 'APPROVE', res)) return;
                const updated = await prisma.expenseRequest.update({
                    where: { id },
                    data: { status: 'Rejected' }
                });
                return res.status(200).json(updated);
            }

            return res.status(400).json({ error: 'Invalid action provided' });
        } catch (error: any) {
            console.error('API PUT Expense Error:', error);
            return res.status(500).json({ error: 'Failed to process expense update' });
        }
    }

    res.setHeader('Allow', 'GET, POST, PUT');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
