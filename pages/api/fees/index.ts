import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'fees', 'VIEW', res)) return;
        const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
        return res.status(200).json(payments);
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'fees', 'CREATE', res)) return;
        const { studentId, amount, method, reference, date, term, studentName, grade } = req.body;
        const receiptNumber = `RCT-${Date.now().toString().slice(-6)}`;

        const payment = await prisma.payment.create({
            data: { studentId, studentName, grade, amount, method, reference: reference || '', date, term, receiptNumber },
        });

        // Update student's paid fees and balance
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (student) {
            const newPaid = student.paidFees + amount;
            await prisma.student.update({
                where: { id: studentId },
                data: { paidFees: newPaid, feeBalance: student.totalFees - newPaid },
            });
        }

        // --- NEW: Post to General Ledger ---
        try {
            const { postTransaction } = require('../../../utils/finance');
            const cashAccountCode = method === 'Cash' ? '1001' : '1002'; // Cash or Bank

            await postTransaction(
                receiptNumber,
                [
                    { accountCode: cashAccountCode, description: `Fee Payment: ${studentName}`, debit: amount, credit: 0 },
                    { accountCode: '1003', description: `Fee Payment: ${studentName}`, debit: 0, credit: amount }
                ],
                payment.id
            );
        } catch (ledgerError) {
            console.error('Ledger Posting Failed:', ledgerError);
            // We don't fail the whole request here if it's a legacy system or missing configuration, 
            // but in a strict system we might.
        }
        // ------------------------------------

        await logAction(
            user.id,
            user.name,
            'RECORD_PAYMENT',
            `Recorded payment of KSh ${amount.toLocaleString()} for student ${studentName} (${receiptNumber})`,
            (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
        );

        await touchSync();
        return res.status(201).json(payment);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
