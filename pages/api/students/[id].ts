import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const student = await prisma.student.findUnique({ where: { id: id as string } });
            if (!student) return res.status(404).json({ error: 'Student not found' });
            return res.status(200).json(student);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch student' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const data = req.body;
            if (data.totalFees !== undefined || data.paidFees !== undefined) {
                const existing = await prisma.student.findUnique({ where: { id: id as string } });
                if (existing) {
                    const totalFees = data.totalFees ?? existing.totalFees;
                    const paidFees = data.paidFees ?? existing.paidFees;
                    data.feeBalance = totalFees - paidFees;
                }
            }
            // Remove fields that shouldn't be sent to Prisma
            delete data.id;
            delete data.createdAt;
            delete data.updatedAt;
            const student = await prisma.student.update({ where: { id: id as string }, data });
            await touchSync();
            return res.status(200).json(student);
        } catch (error: any) {
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'Student not found' });
            }
            return res.status(500).json({ error: 'Failed to update student' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            // First delete related records to avoid foreign key constraints
            await prisma.attendance.deleteMany({ where: { studentId: id as string } });
            await prisma.payment.deleteMany({ where: { studentId: id as string } });
            await prisma.result.deleteMany({ where: { studentId: id as string } });
            await prisma.student.delete({ where: { id: id as string } });
            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Delete student error:', error);
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'Student not found in database' });
            }
            return res.status(500).json({ error: 'Failed to delete student' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
