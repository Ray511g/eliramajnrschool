import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const user = requireAuth(req, res);
    if (!user) return;

    try {
        const report: any = {
            timestamp: new Date().toISOString(),
            dbStatus: 'Unknown',
            arrears: {
                totalStudents: 0,
                totalArrears: 0,
                discrepanciesFixed: 0,
                details: [] as any[],
            },
            orphans: {
                paymentOrphans: 0,
                attendanceOrphans: 0,
                resultOrphans: 0,
                cleaned: 0,
            }
        };

        // 1. DB Health Check
        try {
            await prisma.$queryRaw`SELECT 1`;
            report.dbStatus = 'Connected';
        } catch (e) {
            report.dbStatus = 'Failed';
            return res.status(500).json(report);
        }

        // 2. Arrears & Balance Audit
        const students = await prisma.student.findMany({ include: { payments: true } });
        report.arrears.totalStudents = students.length;

        for (const student of students) {
            // Calculate true totals from source documents (payments)
            const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
            const expectedBalance = student.totalFees - totalPaid;

            // Check for discrepancy
            if (student.paidFees !== totalPaid || student.feeBalance !== expectedBalance) {
                // FIX IT
                await prisma.student.update({
                    where: { id: student.id },
                    data: {
                        paidFees: totalPaid,
                        feeBalance: expectedBalance
                    }
                });
                report.arrears.discrepanciesFixed++;
                report.arrears.details.push({
                    student: student.firstName + ' ' + student.lastName,
                    oldPaid: student.paidFees,
                    newPaid: totalPaid,
                    oldBal: student.feeBalance,
                    newBal: expectedBalance
                });
            }

            if (expectedBalance > 0) {
                report.arrears.totalArrears += expectedBalance;
            }
        }

        // 3. Orphan Cleanup (Rows pointing to non-existent students)
        // Prisma usually handles this with foreign keys, but we'll do a sanity check in case cascading failed or was missing
        const allStudentIds = students.map(s => s.id);

        // Find orphans (payments where studentId is not in valid list)
        // Note: Prisma's deleteMany with 'where studentId not in' is safer if relations aren't enforced
        // But for this generic script, we'll assume foreign keys might be loose in some setups

        // Count orphans
        const orphanPayments = await prisma.payment.count({ where: { NOT: { studentId: { in: allStudentIds } } } });
        const orphanAttendance = await prisma.attendance.count({ where: { NOT: { studentId: { in: allStudentIds } } } });
        const orphanResults = await prisma.result.count({ where: { NOT: { studentId: { in: allStudentIds } } } });

        report.orphans.paymentOrphans = orphanPayments;
        report.orphans.attendanceOrphans = orphanAttendance;
        report.orphans.resultOrphans = orphanResults;

        if (orphanPayments > 0) await prisma.payment.deleteMany({ where: { NOT: { studentId: { in: allStudentIds } } } });
        if (orphanAttendance > 0) await prisma.attendance.deleteMany({ where: { NOT: { studentId: { in: allStudentIds } } } });
        if (orphanResults > 0) await prisma.result.deleteMany({ where: { NOT: { studentId: { in: allStudentIds } } } });

        report.orphans.cleaned = orphanPayments + orphanAttendance + orphanResults;

        res.status(200).json(report);

    } catch (error) {
        console.error('System health check failed:', error);
        res.status(500).json({ error: 'System health check failed' });
    }
}
