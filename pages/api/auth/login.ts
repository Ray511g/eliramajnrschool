import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { signToken, corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const loginIdentifier = email; // email field from body now used for both email and username
    if (!loginIdentifier || !password) return res.status(400).json({ error: 'Email/Username and password required' });

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: loginIdentifier },
                    { username: loginIdentifier }
                ]
            }
        });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            permissions: user.permissions // Include permissions in token
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                userName: user.name,
                action: 'LOGIN',
                details: 'User logged in successfully',
                ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
            }
        });

        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}
