import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            // 1. Total Income
            const incomeAccounts = await prisma.account.findMany({ where: { type: 'INCOME' } });
            const totalIncome = incomeAccounts.reduce((sum, a) => sum + a.balance, 0);

            // 2. Total Expenses
            const expenseAccounts = await prisma.account.findMany({ where: { type: 'EXPENSE' } });
            const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);

            // 3. Payroll Total (Current Month)
            const now = new Date();
            const payroll = await prisma.payrollEntry.aggregate({
                where: { month: now.getMonth() + 1, year: now.getFullYear(), status: 'Locked' },
                _sum: { netPay: true }
            });
            const payrollTotal = payroll._sum.netPay || 0;

            // 4. Net Balance (Cash + Bank)
            const liquidAccounts = await prisma.account.findMany({
                where: { code: { in: ['1001', '1002'] } }
            });
            const netBalance = liquidAccounts.reduce((sum, a) => sum + a.balance, 0);

            // 5. Outstanding Fees (Accounts Receivable)
            const arAccount = await prisma.account.findUnique({ where: { code: '1003' } });
            const outstandingFees = arAccount?.balance || 0;

            // 6. Budget Utilization
            const budgets = await prisma.budget.findMany({
                where: { year: now.getFullYear() }
            });
            const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
            const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
            const budgetUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

            // 7. Recent Journal Entries
            const journalEntries = await prisma.journalEntry.findMany({
                take: 50,
                orderBy: { date: 'desc' },
                include: { account: true }
            });

            // 8. Cash Flow (Real aggregation from Journal Entries)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const entries = await prisma.journalEntry.findMany({
                where: {
                    date: { gte: sixMonthsAgo },
                    account: { type: { in: ['INCOME', 'EXPENSE'] } }
                },
                include: { account: true }
            });

            // Group by month
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const cashFlowMap = new Map();

            // Initialize last 6 months
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthName = months[d.getMonth()];
                cashFlowMap.set(monthName, { month: monthName, income: 0, expense: 0 });
            }

            entries.forEach(entry => {
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
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch finance stats' });
        }
    }
    return res.status(405).json({ message: 'Method not allowed' });
}
