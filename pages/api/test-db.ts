import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const student = await prisma.student.create({
            data: {
                firstName: 'Test',
                lastName: 'Student',
                admissionNumber: 'TEST-' + Date.now(),
                gender: 'Male',
                grade: 'Grade 1',
                parentName: 'Test Parent',
                parentPhone: '0000000000',
                status: 'Active',
                enrollmentDate: new Date().toISOString().split('T')[0],
                totalFees: 1000,
                paidFees: 0,
                feeBalance: 1000,
            }
        });
        return res.status(200).json({ success: true, student });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
