import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';
import { postTransaction } from '../../../utils/finance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        const { type } = req.query; // 'staff' or 'entries'
        try {
            if (type === 'staff') {
                const staff = await prisma.staff.findMany({
                    orderBy: { lastName: 'asc' }
                });
                return res.status(200).json(staff);
            } else {
                const entries = await prisma.payrollEntry.findMany({
                    include: { staff: true },
                    orderBy: [{ year: 'desc' }, { month: 'desc' }]
                });
                return res.status(200).json(entries);
            }
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch payroll data' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        // Generate Payroll for a specific month/year
        const { month, year } = req.body;
        try {
            const staffMembers = await prisma.staff.findMany({ where: { status: 'Active' } });
            const entries = [];

            for (const staff of staffMembers) {
                // Calculate allowances and deductions
                const allowances = (staff.allowances as any[])?.reduce((sum, a) => sum + a.amount, 0) || 0;
                const deductions = (staff.deductions as any[])?.reduce((sum, d) => sum + d.amount, 0) || 0;
                const netPay = staff.basicSalary + allowances - deductions;

                const entry = await prisma.payrollEntry.upsert({
                    where: {
                        staffId_month_year: {
                            staffId: staff.id,
                            month,
                            year
                        }
                    },
                    update: {
                        basicSalary: staff.basicSalary,
                        totalAllowances: allowances,
                        totalDeductions: deductions,
                        netPay: netPay,
                        status: 'Draft'
                    },
                    create: {
                        staffId: staff.id,
                        month,
                        year,
                        basicSalary: staff.basicSalary,
                        totalAllowances: allowances,
                        totalDeductions: deductions,
                        netPay: netPay,
                        status: 'Draft'
                    }
                });
                entries.push(entry);
            }
            await logAction(user.id, user.name, 'GENERATE_PAYROLL', `Generated payroll for ${month}/${year}`, { module: 'Finance' });
            return res.status(201).json({ message: `Payroll generated for ${month}/${year}`, count: entries.length });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to generate payroll' });
        }
    }

    if (req.method === 'PUT') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        // Update Payroll status (Review -> Approve -> Lock)
        const { id, status } = req.body;
        try {
            const entry = await prisma.payrollEntry.findUnique({
                where: { id },
                include: { staff: true }
            });
            if (!entry) return res.status(404).json({ error: 'Payroll entry not found' });

            const updated = await prisma.payrollEntry.update({
                where: { id },
                data: { status }
            });

            await logAction(user.id, user.name, 'UPDATE_PAYROLL', `Updated payroll status to ${status} for ${entry.staff.firstName} ${entry.staff.lastName}`, { module: 'Finance' });

            if (status === 'Locked') {
                // Post to Ledger once locked
                const expenseAccountCode = entry.staff.type === 'BOM_TEACHER' ? '5001' : '5002';

                await postTransaction(
                    `PAY-${entry.id}`,
                    [
                        { accountCode: expenseAccountCode, description: `Payroll: ${entry.staff.firstName} ${entry.staff.lastName} (${entry.month}/${entry.year})`, debit: entry.netPay, credit: 0 },
                        { accountCode: '1002', description: `Salary payment to ${entry.staff.lastName}`, debit: 0, credit: entry.netPay }
                    ],
                    entry.id
                );
            }

            return res.status(200).json(updated);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to update payroll' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
