import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Use a transaction to clear all data tables
        await prisma.$transaction([
            prisma.attendance.deleteMany(),
            prisma.payment.deleteMany(),
            prisma.exam.deleteMany(),
            prisma.timetableEntry.deleteMany(),
            prisma.student.deleteMany(),
            prisma.teacher.deleteMany(),
            prisma.result.deleteMany(),
            prisma.settings.deleteMany(),
        ]);

        // Re-initialize default settings
        await prisma.settings.create({
            data: {
                schoolName: 'ELIRAMA SCHOOL',
                motto: 'Excellence in Education',
                phone: '+254 700 000 000',
                email: 'info@elirama.ac.ke',
                address: 'Nairobi, Kenya',
                currentTerm: 'Term 1',
                currentYear: 2026,
            }
        });

        await touchSync();

        return res.status(200).json({
            success: true,
            message: 'All system data has been cleared globally.'
        });
    } catch (error) {
        console.error('Reset error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to clear system data. Please check your database connection.'
        });
    }
}
