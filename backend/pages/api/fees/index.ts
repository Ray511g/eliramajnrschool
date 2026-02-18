import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
        return res.status(200).json(payments);
    }

    if (req.method === 'POST') {
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

        return res.status(201).json(payment);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
