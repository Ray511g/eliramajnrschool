import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const currentUser = requireAuth(req, res);
    if (!currentUser) return;

    if (req.method === 'GET') {
        if (!checkPermission(currentUser, 'users', 'VIEW', res)) return;
        const users = await prisma.user.findMany({
            include: { role: true }
        });
        const mappedUsers = users.map(u => ({
            ...u,
            role: u.role?.name || 'Teacher',
            permissions: u.role?.permissions || {}
        }));
        return res.status(200).json(mappedUsers);
    }

    if (req.method === 'POST') {
        if (!checkPermission(currentUser, 'users', 'CREATE', res)) return;
        const { name, email, password, roleId, firstName, lastName, username, permissions } = req.body;
        const hashedPassword = await bcrypt.hash(password || 'elirama123', 10);

        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    roleId,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    username: username || email.split('@')[0],
                    permissions: permissions || []
                },
                include: { role: true }
            });

            await logAction(
                currentUser.id,
                currentUser.name,
                'CREATE_USER',
                `Created new system user: ${user.name} (${user.username}) with role ${user.role?.name || 'Teacher'}`,
                { module: 'Users' }
            );

            await touchSync();
            return res.status(201).json({
                ...user,
                role: user.role?.name || 'Teacher',
                permissions: user.role?.permissions || {}
            });
        } catch (error: any) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }
            if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
                return res.status(400).json({ error: 'User with this username already exists' });
            }
            console.error("Error creating user:", error);
            return res.status(500).json({ error: 'Failed to create user' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
