import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'elirama-school-secret-2026';

export function signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function getAuthUser(req: NextApiRequest): any {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    return verifyToken(token);
}

export function requireAuth(req: NextApiRequest, res: NextApiResponse): any {
    const user = getAuthUser(req);
    if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
    return user;
}

export function checkPermission(user: any, module: string, action: string, res?: NextApiResponse): boolean {
    if (!user) {
        if (res) res.status(401).json({ error: 'Unauthorized' });
        return false;
    }

    if (user.role === 'Super Admin') return true;

    const permissions = user.permissions || {};
    const modulePermissions = permissions[module] || [];
    const hasPerm = modulePermissions.includes(action.toUpperCase());

    if (!hasPerm && res) {
        res.status(403).json({ error: `Forbidden: Missing ${action} permission for ${module}` });
    }

    return hasPerm;
}

export function corsHeaders(res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}
