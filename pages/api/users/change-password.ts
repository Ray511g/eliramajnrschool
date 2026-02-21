import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

    const currentUser = requireAuth(req, res);
    if (!currentUser) return;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(401).json({ error: 'Incorrect current password' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { password: hashedNewPassword }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                userName: user.name,
                action: 'PASSWORD_CHANGE',
                details: 'User changed their own password'
            }
        });

        await touchSync();
        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        return res.status(500).json({ error: 'Failed to change password' });
    }
}
