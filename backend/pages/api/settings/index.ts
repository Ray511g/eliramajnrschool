import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        let settings = await prisma.settings.findFirst();
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
                },
            });
        }
        return res.status(200).json(settings);
    }

    if (req.method === 'PUT') {
        let settings = await prisma.settings.findFirst();
        if (settings) {
            settings = await prisma.settings.update({ where: { id: settings.id }, data: req.body });
        } else {
            settings = await prisma.settings.create({ data: req.body });
        }
        await touchSync();
        return res.status(200).json(settings);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
