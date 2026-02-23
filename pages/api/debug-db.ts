
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

    try {
        const counts = {
            users: await prisma.user.count(),
            students: await prisma.student.count(),
            accounts: await prisma.account.count(),
            journalEntries: await prisma.journalEntry.count(),
            expenseRequests: await prisma.expenseRequest.count(),
            budgets: await prisma.budget.count(),
            payrollEntries: await prisma.payrollEntry.count(),
        };

        res.status(200).json({
            dbUrl: maskedUrl,
            nodeEnv: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            counts
        });
    } catch (error: any) {
        res.status(500).json({
            dbUrl: maskedUrl,
            error: error.message,
            stack: error.stack
        });
    }
}
