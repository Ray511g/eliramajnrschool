import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const currentUser = requireAuth(req, res);
    if (!currentUser) return;

    const userRole = typeof currentUser.role === 'string' ? currentUser.role : (currentUser.role as any)?.name;
    if (userRole?.toLowerCase() !== 'super admin' && userRole?.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Only administrators can manage system accounts' });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: id as string },
                include: { role: true }
            });
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.status(200).json({
                ...user,
                role: user.role?.name || 'Teacher',
                permissions: user.role?.permissions || {}
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { name, email, roleId, permissions, password, firstName, lastName, username } = req.body;
            const updateData: any = {
                name,
                email,
                roleId,
                permissions,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                username: username || undefined
            };

            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            const user = await prisma.user.update({
                where: { id: id as string },
                data: updateData,
                include: { role: true }
            });

            const mappedUser = {
                ...user,
                role: user.role?.name || 'Teacher',
                permissions: user.role?.permissions || {}
            };

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    action: 'UPDATE_USER',
                    details: `Updated user ${user.name} (${user.email}). ${password ? 'Password was reset.' : ''}`
                }
            });

            await touchSync();
            return res.status(200).json(mappedUser);
        } catch (error: any) {
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(500).json({ error: 'Failed to update user' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const user = await prisma.user.findUnique({ where: { id: id as string } });
            await prisma.user.delete({ where: { id: id as string } });

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    action: 'DELETE_USER',
                    details: `Deleted user ${user?.name || id}`
                }
            });

            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Delete user error:', error);
            if (error?.code === 'P2025') {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(405).json({ error: 'Method not allowed' });
}
