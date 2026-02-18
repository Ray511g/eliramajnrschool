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

    if (req.method === 'GET') {
        try {
            const teacher = await prisma.teacher.findUnique({ where: { id: id as string } });
            if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
            return res.status(200).json(teacher);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch teacher' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const data = req.body;
            // Remove fields that shouldn't be sent to Prisma
            delete data.id;
            delete data.createdAt;
            delete data.updatedAt;
            const teacher = await prisma.teacher.update({ where: { id: id as string }, data });
            await touchSync();
            return res.status(200).json(teacher);
        } catch (error: any) {
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'Teacher not found' });
            }
            return res.status(500).json({ error: 'Failed to update teacher' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await prisma.teacher.delete({ where: { id: id as string } });
            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Delete teacher error:', error);
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'Teacher not found in database' });
            }
            return res.status(500).json({ error: 'Failed to delete teacher' });
        }
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(405).json({ error: 'Method not allowed', receivedMethod: req.method, query: req.query });
}
