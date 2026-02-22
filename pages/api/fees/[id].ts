import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const { amount, method, reference, date, term } = req.body;
            const oldPayment = await prisma.payment.findUnique({ where: { id: id as string } });
            if (!oldPayment) return res.status(404).json({ error: 'Payment not found' });

            const updatedPayment = await prisma.payment.update({
                where: { id: id as string },
                data: { amount, method, reference, date, term }
            });

            // If amount changed, update student balance
            if (amount !== oldPayment.amount) {
                const student = await prisma.student.findUnique({ where: { id: oldPayment.studentId } });
                if (student) {
                    const diff = amount - oldPayment.amount;
                    const newPaid = student.paidFees + diff;
                    await prisma.student.update({
                        where: { id: oldPayment.studentId },
                        data: { paidFees: newPaid, feeBalance: student.totalFees - newPaid },
                    });
                }
            }

            await touchSync();
            return res.status(200).json(updatedPayment);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update payment' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            // Get payment details before deleting
            const payment = await prisma.payment.findUnique({ where: { id: id as string } });
            if (!payment) return res.status(404).json({ error: 'Payment not found' });

            // Delete payment
            await prisma.payment.delete({ where: { id: id as string } });

            // Revert student balance
            const student = await prisma.student.findUnique({ where: { id: payment.studentId } });
            if (student) {
                const newPaid = Math.max(0, student.paidFees - payment.amount);
                await prisma.student.update({
                    where: { id: payment.studentId },
                    data: { paidFees: newPaid, feeBalance: student.totalFees - newPaid },
                });
            }

            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Delete payment error:', error);
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'Payment not found' });
            }
            return res.status(500).json({ error: 'Failed to delete payment' });
        }
    }

    res.setHeader('Allow', 'DELETE');
    res.status(405).json({ error: 'Method not allowed', receivedMethod: req.method, query: req.query });
}
