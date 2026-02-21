import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const currentUser = requireAuth(req, res);
    if (!currentUser) return;
    if (currentUser.role !== 'admin' && currentUser.role !== 'Super Admin') {
        return res.status(403).json({ error: 'Only admins can manage users' });
    }

    if (req.method === 'GET') {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true, permissions: true }
        });
        return res.status(200).json(users);
    }

    if (req.method === 'POST') {
        const { name, email, password, role, firstName, lastName, username, permissions } = req.body;
        const hashedPassword = await bcrypt.hash(password || 'elirama123', 10);

        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    username: username || email.split('@')[0],
                    permissions: permissions || []
                }
            });
            await touchSync();
            return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions });
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
}
