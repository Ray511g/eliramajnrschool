import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        let settings = await prisma.settings.findFirst({
            include: { timeSlots: { orderBy: { order: 'asc' } } }
        });
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    schoolName: 'ELIRAMA SCHOOL',
                    motto: 'Excellence in Education',
                    phone: '+254 700 000 000',
                    email: 'info@elirama.ac.ke',
                    address: 'Nairobi, Kenya',
                    currentTerm: 'Term 1',
                    currentYear: 2026,
                    timeSlots: {
                        create: [
                            { label: '8:00 - 8:40', type: 'Lesson', order: 1 },
                            { label: '8:40 - 9:20', type: 'Lesson', order: 2 },
                            { label: '9:20 - 10:00', type: 'Lesson', order: 3 },
                            { label: '10:00 - 10:30', type: 'Break', order: 4 },
                            { label: '10:30 - 11:10', type: 'Lesson', order: 5 },
                            { label: '11:10 - 11:50', type: 'Lesson', order: 6 },
                            { label: '11:50 - 12:30', type: 'Lesson', order: 7 },
                            { label: '12:30 - 1:10', type: 'Lunch', order: 8 },
                            { label: '1:10 - 1:50', type: 'Lesson', order: 9 },
                            { label: '1:50 - 2:30', type: 'Lesson', order: 10 },
                        ]
                    }
                },
                include: { timeSlots: { orderBy: { order: 'asc' } } }
            });
        }
        return res.status(200).json(settings);
    }

    if (req.method === 'PUT') {
        const { timeSlots, ...otherData } = req.body;
        let settings = await prisma.settings.findFirst();

        if (settings) {
            // Update settings basic info
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: otherData,
                include: { timeSlots: { orderBy: { order: 'asc' } } }
            });

            // If timeSlots provided, replace them all for simplicity in a sync-heavy app
            if (timeSlots && Array.isArray(timeSlots)) {
                await prisma.timeSlot.deleteMany({ where: { settingsId: settings.id } });
                settings = await prisma.settings.update({
                    where: { id: settings.id },
                    data: {
                        timeSlots: {
                            create: timeSlots.map((ts: any, index: number) => ({
                                label: ts.label,
                                type: ts.type,
                                order: ts.order || index + 1
                            }))
                        }
                    },
                    include: { timeSlots: { orderBy: { order: 'asc' } } }
                });
            }
        } else {
            settings = await prisma.settings.create({
                data: {
                    ...otherData,
                    timeSlots: {
                        create: timeSlots?.map((ts: any, index: number) => ({
                            label: ts.label,
                            type: ts.type,
                            order: ts.order || index + 1
                        })) || []
                    }
                },
                include: { timeSlots: { orderBy: { order: 'asc' } } }
            });
        }
        await touchSync();
        return res.status(200).json(settings);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
