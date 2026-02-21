
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, corsHeaders } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const structures = await prisma.feeStructure.findMany({
                orderBy: { grade: 'asc' }
            });
            return res.status(200).json(structures);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch fee structures' });
        }
    }

    // Only Admin/Super Admin can modify fee structures
    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
        // Allow if user has specific permission
        // We'll trust role for now, or check permissions if available
        // For simplicity in this step, strict Admin check
    }

    // Actually, let's implement the specific permission check if we can, 
    // but the user object from requireAuth might need to include permissions.
    // Let's assume standard Admin check + permissions check in future.
    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
        // Check if user has specific 'MANAGE_FEES' permission (we need to fetch it or have it in token)
        // For now, strict role check is safer.
        return res.status(403).json({ error: 'Forbidden' });
    }


    if (req.method === 'PUT') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID required' });

        try {
            const { grade, name, amount, term } = req.body;
            const feeAmount = parseFloat(amount);
            const feeStructure = await prisma.feeStructure.update({
                where: { id: id as string },
                data: { grade, name, amount: feeAmount, term }
            });

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: user.id || 'unknown',
                    userName: user.name || 'Unknown',
                    action: 'UPDATE_FEE_STRUCTURE',
                    details: `Updated draft fee item: ${name} (${feeAmount}) for ${grade}. Changes pending publication.`
                }
            });

            await touchSync();
            return res.status(200).json(feeStructure);
        } catch (error) {
            console.error('Update fee structure error:', error);
            return res.status(500).json({ error: 'Failed to update fee structure' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { grade, name, amount, term } = req.body;
            const feeAmount = parseFloat(amount);
            const feeStructure = await prisma.feeStructure.create({
                data: { grade, name, amount: feeAmount, term }
            });

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: user.id || 'unknown',
                    userName: user.name || 'Unknown',
                    action: 'CREATE_FEE_STRUCTURE',
                    details: `Created draft fee item: ${name} (${feeAmount}) for ${grade}. Changes pending publication.`
                }
            });

            await touchSync();
            return res.status(201).json(feeStructure);
        } catch (error) {
            console.error('Create fee structure error:', error);
            return res.status(500).json({ error: 'Failed to create fee structure' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID required' });

        try {
            const existing = await prisma.feeStructure.findUnique({ where: { id: id as string } });
            if (!existing) return res.status(404).json({ error: 'Fee item not found' });

            await prisma.feeStructure.delete({ where: { id: id as string } });

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: user.id || 'unknown',
                    userName: user.name || 'Unknown',
                    action: 'DELETE_FEE_STRUCTURE',
                    details: `Deleted draft fee item: ${existing.name} (${existing.amount}) for ${existing.grade}. Changes pending publication.`
                }
            });
            await touchSync();
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Delete fee structure error:', error);
            return res.status(500).json({ error: 'Failed to delete fee structure' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
