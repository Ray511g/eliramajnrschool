import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // corsHeaders(res); // Handled by next.config.js
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const data = req.body;
            delete data.id;
            const updated = await prisma.timetableEntry.update({
                where: { id: id as string },
                data
            });
            await touchSync();
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update timetable entry' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await prisma.timetableEntry.delete({ where: { id: id as string } });
            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete timetable entry' });
        }
    }

    res.setHeader('Allow', 'PUT, DELETE');
    res.status(405).json({ error: 'Method not allowed', receivedMethod: req.method, query: req.query });
}
