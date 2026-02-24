import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'students', 'VIEW', res)) return;
        try {
            const student = await prisma.student.findUnique({
                where: { id: id as string },
                include: {
                    _count: {
                        select: {
                            attendance: true,
                            payments: true,
                            results: true
                        }
                    }
                }
            });
            if (!student) return res.status(404).json({ error: 'Student not found' });
            return res.status(200).json(student);
        } catch (error) {
            console.error('API GET Student Detail Error:', error);
            return res.status(500).json({ error: 'Failed to fetch student details' });
        }
    }

    if (req.method === 'PUT') {
        if (!checkPermission(user, 'students', 'EDIT', res)) return;
        try {
            const data = req.body;
            const existing = await prisma.student.findUnique({ where: { id: id as string } });
            if (!existing) return res.status(404).json({ error: 'Student not found' });

            // Recalculate balance if fee fields are modified
            if (data.totalFees !== undefined || data.paidFees !== undefined) {
                const totalFees = parseFloat(data.totalFees ?? existing.totalFees);
                const paidFees = parseFloat(data.paidFees ?? existing.paidFees);
                data.totalFees = totalFees;
                data.paidFees = paidFees;
                data.feeBalance = totalFees - paidFees;
            }

            // Clean data for Prisma (prevent updating metadata or ID)
            const cleanData = { ...data };
            delete cleanData.id;
            delete cleanData.createdAt;
            delete cleanData.updatedAt;
            delete cleanData.admissionNumber; // Prevent changing admission number via PUT

            const student = await prisma.student.update({
                where: { id: id as string },
                data: cleanData
            });

            await logAction(
                user.id,
                user.name,
                'UPDATE_STUDENT',
                `Updated details for student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`,
                { module: 'students' }
            );

            await touchSync();
            return res.status(200).json(student);
        } catch (error: any) {
            console.error('API PUT Student Error:', error);
            return res.status(500).json({ error: 'Failed to update student records' });
        }
    }

    if (req.method === 'DELETE') {
        if (!checkPermission(user, 'students', 'DELETE', res)) return;
        try {
            const student = await prisma.student.findUnique({ where: { id: id as string } });
            if (!student) return res.status(404).json({ error: 'Student record not found' });

            // Use transaction for atomic deletion
            await prisma.$transaction([
                prisma.attendance.deleteMany({ where: { studentId: id as string } }),
                prisma.payment.deleteMany({ where: { studentId: id as string } }),
                prisma.result.deleteMany({ where: { studentId: id as string } }),
                prisma.assessmentScore.deleteMany({ where: { studentId: id as string } }),
                prisma.student.delete({ where: { id: id as string } })
            ]);

            await logAction(
                user.id,
                user.name,
                'DELETE_STUDENT',
                `Full record deletion for student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`,
                { module: 'students' }
            );

            await touchSync();
            return res.status(200).json({ success: true, message: 'Student and related records deleted successfully' });
        } catch (error: any) {
            console.error('Delete student transaction error:', error);
            return res.status(500).json({ error: 'Failed to safely delete student and related data' });
        }
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
