import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';
import { touchSync } from '../../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const currentUser = requireAuth(req, res);
    if (!currentUser) return;
    if (currentUser.role !== 'admin' && currentUser.role !== 'Super Admin') {
        return res.status(403).json({ error: 'Only admins can reset passwords' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    try {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await prisma.user.update({
            where: { id: id as string },
            data: { password: hashedPassword }
        });
        await touchSync();
        return res.status(200).json({ success: true, message: 'Password reset to default (123456)' });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(500).json({ error: 'Failed to reset password' });
    }
}
