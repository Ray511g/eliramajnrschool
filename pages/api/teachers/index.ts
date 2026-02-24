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

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'teachers', 'VIEW', res)) return;
        try {
            const { search, page = '1', limit = '50', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            const where: any = {};
            if (search) {
                const searchStr = search as string;
                where.OR = [
                    { firstName: { contains: searchStr, mode: 'insensitive' } },
                    { lastName: { contains: searchStr, mode: 'insensitive' } },
                    { email: { contains: searchStr, mode: 'insensitive' } },
                    { phone: { contains: searchStr, mode: 'insensitive' } },
                ];
            }

            const [teachers, total] = await Promise.all([
                prisma.teacher.findMany({
                    where,
                    orderBy: { [sortBy as string]: sortOrder as string },
                    skip,
                    take,
                }),
                prisma.teacher.count({ where })
            ]);

            return res.status(200).json({
                teachers,
                meta: {
                    total,
                    page: parseInt(page as string),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            });
        } catch (error) {
            console.error('API GET Teachers Error:', error);
            return res.status(500).json({ error: 'Failed to fetch teachers directory' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'teachers', 'CREATE', res)) return;

        const data = req.body;
        const { firstName, lastName, email, phone, joinDate } = data;

        // Validation logic
        if (!firstName || !lastName || !email || !phone || !joinDate) {
            return res.status(400).json({ error: 'Personal details (name, email, phone) and hire date are required.' });
        }

        try {
            const teacher = await prisma.teacher.create({
                data: {
                    ...data,
                    // Ensure arrays are initialized if missing
                    subjects: data.subjects || [],
                    grades: data.grades || []
                }
            });

            await logAction(
                user.id,
                user.name,
                'CREATE_TEACHER',
                `Registered new teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`,
                (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
            );

            await touchSync();
            return res.status(201).json(teacher);
        } catch (error: any) {
            console.error('Error creating teacher:', error);
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'A teacher with this email address is already registered.' });
            }
            return res.status(500).json({ error: 'System error during teacher registration.' });
        }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
