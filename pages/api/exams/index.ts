import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'exams', 'VIEW', res)) return;
        try {
            const { grade, term, subject, page = '1', limit = '50', search } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            const where: any = {};
            if (grade) where.grade = grade as string;
            if (term) where.term = term as string;
            if (subject) where.subject = subject as string;
            if (search) {
                where.name = { contains: search as string, mode: 'insensitive' };
            }

            const [exams, total] = await Promise.all([
                prisma.exam.findMany({
                    where,
                    orderBy: { date: 'desc' },
                    skip,
                    take,
                }),
                prisma.exam.count({ where })
            ]);

            return res.status(200).json({
                exams,
                meta: {
                    total,
                    page: parseInt(page as string),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            });
        } catch (error: any) {
            console.error('API GET Exams Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve examination schedule' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'exams', 'EDIT', res)) return;
        try {
            const { name, subject, grade, date, term, totalMarks, type } = req.body;

            if (!name || !subject || !grade || !date || !term) {
                return res.status(400).json({ error: 'Missing required exam details (Name, Subject, Grade, Date, Term)' });
            }

            const exam = await prisma.exam.create({
                data: {
                    name,
                    subject,
                    grade,
                    date,
                    term,
                    type: type || 'Final',
                    totalMarks: parseInt(totalMarks?.toString()) || 100
                }
            });

            await logAction(
                user.id,
                user.name,
                'CREATE_EXAM',
                `Scheduled ${exam.type} exam: ${exam.name} for ${exam.grade} [${exam.subject}]`,
                { module: 'exams' }
            );

            await touchSync();
            return res.status(201).json(exam);
        } catch (error: any) {
            console.error('API POST Exam Error:', error);
            return res.status(500).json({ error: 'System error while scheduling exam' });
        }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
