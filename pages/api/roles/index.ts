import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    // Check if user is Super Admin or Admin
    if (user.role !== 'Super Admin' && user.role !== 'Admin') {
        return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    if (req.method === 'GET') {
        try {
            const roles = await prisma.role.findMany({
                include: { _count: { select: { users: true } } },
                orderBy: { name: 'asc' }
            });
            return res.status(200).json(roles);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch roles' });
        }
    }

    if (req.method === 'POST') {
        const { name, permissions } = req.body;
        if (!name || !permissions) return res.status(400).json({ error: 'Name and permissions are required' });

        try {
            const role = await prisma.role.create({
                data: { name, permissions }
            });

            await logAction(
                user.id,
                user.name,
                'CREATE_ROLE',
                `Created new role: ${name}`,
                (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
            );

            return res.status(201).json(role);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create role' });
        }
    }

    if (req.method === 'PUT') {
        const { id, name, permissions } = req.body;
        if (!id) return res.status(400).json({ error: 'Role ID required' });

        try {
            const role = await prisma.role.update({
                where: { id },
                data: { name, permissions }
            });

            await logAction(
                user.id,
                user.name,
                'UPDATE_ROLE',
                `Updated role: ${name || id}`,
                (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
            );

            return res.status(200).json(role);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update role' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Role ID required' });

        try {
            // Check if any users are assigned to this role
            const userCount = await prisma.user.count({ where: { roleId: id } });
            if (userCount > 0) {
                return res.status(400).json({ error: 'Cannot delete role assigned to users' });
            }

            await prisma.role.delete({ where: { id } });

            await logAction(
                user.id,
                user.name,
                'DELETE_ROLE',
                `Deleted role ID: ${id}`,
                (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
            );

            return res.status(200).json({ message: 'Role deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete role' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
