import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'teachers', 'VIEW', res)) return;
        const { search } = req.query;
        const where: any = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search as string, mode: 'insensitive' } },
                { lastName: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
            ];
        }
        const teachers = await prisma.teacher.findMany({ where, orderBy: { createdAt: 'desc' } });
        return res.status(200).json(teachers);
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'teachers', 'CREATE', res)) return;
        const teacher = await prisma.teacher.create({ data: req.body });

        await logAction(
            user.id,
            user.name,
            'CREATE_TEACHER',
            `Registered new teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`,
            (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
        );

        await touchSync();
        return res.status(201).json(teacher);
    }

    res.status(405).json({ error: 'Method not allowed' });
}
