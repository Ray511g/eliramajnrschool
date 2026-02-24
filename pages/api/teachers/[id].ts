import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;
    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'teachers', 'VIEW', res)) return;
        try {
            const teacher = await prisma.teacher.findUnique({ where: { id: id as string } });
            if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });
            return res.status(200).json(teacher);
        } catch (error) {
            console.error('API GET Teacher Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve teacher information' });
        }
    }

    if (method === 'PUT') {
        if (!checkPermission(user, 'teachers', 'EDIT', res)) return;
        try {
            const data = req.body;
            // Guard against direct ID or metadata manipulation
            const cleanData = { ...data };
            delete cleanData.id;
            delete cleanData.createdAt;
            delete cleanData.updatedAt;

            const teacher = await prisma.teacher.update({
                where: { id: id as string },
                data: cleanData
            });

            await logAction(
                user.id,
                user.name,
                'UPDATE_TEACHER',
                `Updated profile for teacher: ${teacher.firstName} ${teacher.lastName}`,
                { module: 'teachers' }
            );

            await touchSync();
            return res.status(200).json(teacher);
        } catch (error: any) {
            console.error('API PUT Teacher Error:', error);
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'Teacher record to update not found' });
            }
            return res.status(500).json({ error: 'Failed to update teacher profile' });
        }
    }

    if (method === 'DELETE') {
        if (!checkPermission(user, 'teachers', 'DELETE', res)) return;
        try {
            const teacher = await prisma.teacher.findUnique({ where: { id: id as string } });
            if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

            await prisma.teacher.delete({ where: { id: id as string } });

            await logAction(
                user.id,
                user.name,
                'DELETE_TEACHER',
                `Removed teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`,
                { module: 'teachers' }
            );

            await touchSync();
            return res.status(200).json({ success: true, message: 'Teacher record removed successfully' });
        } catch (error: any) {
            console.error('Delete teacher error:', error);
            return res.status(500).json({ error: 'Failed to delete teacher record' });
        }
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
