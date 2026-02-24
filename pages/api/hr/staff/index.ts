import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../../lib/auth';
import { logAction } from '../../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    const method = req.method?.toUpperCase();

    if (method === 'GET') {
        if (!checkPermission(user, 'hr', 'VIEW', res)) return;
        try {
            const { search, type, department, page = '1', limit = '50', sortBy = 'lastName', sortOrder = 'asc' } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            const where: any = {};
            if (type) where.type = type as string;
            if (department) where.department = department as string;
            if (search) {
                const searchStr = search as string;
                where.OR = [
                    { firstName: { contains: searchStr, mode: 'insensitive' } },
                    { lastName: { contains: searchStr, mode: 'insensitive' } },
                    { email: { contains: searchStr, mode: 'insensitive' } },
                    { kraPin: { contains: searchStr, mode: 'insensitive' } },
                ];
            }

            const [staff, total] = await Promise.all([
                prisma.staff.findMany({
                    where,
                    orderBy: { [sortBy as string]: sortOrder as string },
                    skip,
                    take,
                    include: {
                        contracts: { where: { status: 'Active' }, take: 1 },
                        payrollEntries: { take: 1, orderBy: { createdAt: 'desc' } }
                    }
                }),
                prisma.staff.count({ where })
            ]);

            return res.status(200).json({
                staff,
                meta: {
                    total,
                    page: parseInt(page as string),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            });
        } catch (error: any) {
            console.error('API GET Staff Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve staff directory' });
        }
    }

    if (method === 'POST') {
        if (!checkPermission(user, 'hr', 'CREATE', res)) return;
        try {
            const data = req.body;
            const { firstName, lastName, email, phone, type, basicSalary } = data;

            if (!firstName || !lastName || !type) {
                return res.status(400).json({ error: 'First name, last name, and staff type are mandatory' });
            }

            const staff = await prisma.staff.create({
                data: {
                    firstName,
                    lastName,
                    email: email?.trim() || null,
                    phone: phone?.trim() || null,
                    type,
                    role: data.role || null,
                    designation: data.designation || null,
                    department: data.department || null,
                    kraPin: data.kraPin || null,
                    nssfNumber: data.nssfNumber || null,
                    nhifNumber: data.nhifNumber || null,
                    bankName: data.bankName || null,
                    accountNumber: data.accountNumber || null,
                    salaryType: data.salaryType || 'Fixed',
                    basicSalary: parseFloat(basicSalary) || 0,
                    allowances: data.allowances || [],
                    deductions: data.deductions || [],
                    status: 'Active'
                }
            });

            await logAction(
                user.id,
                user.name,
                'ADD_STAFF',
                `Registered new staff member: ${staff.firstName} ${staff.lastName} (${staff.type})`,
                { module: 'hr' }
            );

            return res.status(201).json(staff);
        } catch (error: any) {
            console.error('API POST Staff Error:', error);
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'A staff member with this email or KRA PIN already exists' });
            }
            return res.status(500).json({ error: 'System error during staff registration' });
        }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
