import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const [
                incomeAccounts,
                expenseAccounts,
                payroll,
                liquidAccounts,
                arAccount,
                budgets,
                journalEntries,
                cashFlowEntries
            ] = await Promise.all([
                prisma.account.findMany({ where: { type: 'INCOME' } }),
                prisma.account.findMany({ where: { type: 'EXPENSE' } }),
                prisma.payrollEntry.aggregate({
                    where: { month: now.getMonth() + 1, year: now.getFullYear(), status: 'Locked' },
                    _sum: { netPay: true }
                }),
                prisma.account.findMany({ where: { code: { in: ['1001', '1002'] } } }),
                prisma.account.findUnique({ where: { code: '1003' } }),
                prisma.budget.findMany({ where: { year: now.getFullYear() } }),
                prisma.journalEntry.findMany({
                    take: 50,
                    orderBy: { date: 'desc' },
                    include: { account: true }
                }),
                prisma.journalEntry.findMany({
                    where: {
                        date: { gte: sixMonthsAgo },
                        account: { type: { in: ['INCOME', 'EXPENSE'] } }
                    },
                    include: { account: true }
                })
            ]);

            const totalIncome = incomeAccounts.reduce((sum: any, a: any) => sum + a.balance, 0);
            const totalExpenses = expenseAccounts.reduce((sum: any, a: any) => sum + a.balance, 0);
            const payrollTotal = payroll._sum.netPay || 0;
            const netBalance = liquidAccounts.reduce((sum: any, a: any) => sum + a.balance, 0);
            const outstandingFees = arAccount?.balance || 0;

            const totalAllocated = budgets.reduce((sum: any, b: any) => sum + b.allocatedAmount, 0);
            const totalSpent = budgets.reduce((sum: any, b: any) => sum + b.spentAmount, 0);
            const budgetUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

            // Cash Flow Processing
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const cashFlowMap = new Map();

            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthName = months[d.getMonth()];
                cashFlowMap.set(monthName, { month: monthName, income: 0, expense: 0 });
            }

            cashFlowEntries.forEach((entry: any) => {
                const monthName = months[new Date(entry.date).getMonth()];
                if (cashFlowMap.has(monthName)) {
                    const data = cashFlowMap.get(monthName);
                    if (entry.account.type === 'INCOME') data.income += (entry.credit - entry.debit);
                    if (entry.account.type === 'EXPENSE') data.expense += (entry.debit - entry.credit);
                }
            });

            const cashFlow = Array.from(cashFlowMap.values());

            return res.status(200).json({
                stats: {
                    totalIncome,
                    totalExpenses,
                    payrollTotal,
                    netBalance,
                    outstandingFees,
                    budgetUtilization
                },
                cashFlow,
                budgets,
                journalEntries
            });
        } catch (error: any) {
            console.error('FINANCE STATS ERROR:', error);
            return res.status(500).json({
                error: 'Failed to fetch finance stats',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
    return res.status(405).json({ message: 'Method not allowed' });
}
