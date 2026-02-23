import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            const suppliers = await prisma.supplier.findMany({
                orderBy: { name: 'asc' }
            });
            return res.status(200).json(suppliers);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch suppliers' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        try {
            const data = req.body;
            const supplier = await prisma.supplier.create({ data });

            await logAction(
                user.id,
                user.name,
                'REGISTER_SUPPLIER',
                `Registered new supplier: ${supplier.name}`,
                { module: 'Finance' }
            );

            return res.status(201).json(supplier);
        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'A supplier with this KRA PIN already exists' });
            }
            return res.status(500).json({ error: 'Failed to register supplier' });
        }
    }

    if (req.method === 'PUT') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        try {
            const { id } = req.query;
            const data = req.body;
            const supplier = await prisma.supplier.update({
                where: { id: id as string },
                data
            });
            return res.status(200).json(supplier);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update supplier' });
        }
    }

    if (req.method === 'DELETE') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        try {
            const { id } = req.query;
            await prisma.supplier.delete({
                where: { id: id as string }
            });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete supplier' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
