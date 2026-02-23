import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { createApprovalRequest } from '../../../../utils/approvals';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const pos = await prisma.purchaseOrder.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(pos);
    }

    if (req.method === 'POST') {
        const { supplierId, supplierName, items, totalAmount, department, requestedBy } = req.body;

        const po = await prisma.purchaseOrder.create({
            data: {
                poNumber: `PO-${Date.now()}`,
                supplierId,
                supplierName,
                items,
                totalAmount,
                department,
                status: 'PENDING',
                budgetCheck: true // Simplified
            }
        });

        // Request approval
        await createApprovalRequest({
            entityType: 'PURCHASE_ORDER',
            entityId: po.id,
            requestedById: requestedBy.id,
            requestedByName: requestedBy.name,
            details: {
                supplier: supplierName,
                total: totalAmount,
                department
            }
        });

        return res.status(201).json(po);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
