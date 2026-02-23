import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { createApprovalRequest } from '../../../../utils/approvals';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const agreements = await prisma.creditAgreement.findMany({
            include: { installments: true },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(agreements);
    }

    if (req.method === 'POST') {
        const { studentId, studentName, guardianId, guardianName, totalAmount, installments, requestedBy } = req.body;

        const agreement = await prisma.creditAgreement.create({
            data: {
                studentId,
                studentName,
                guardianId,
                guardianName,
                totalAmount,
                status: 'PENDING',
                installments: {
                    create: installments.map((inst: any) => ({
                        dueDate: new Date(inst.dueDate),
                        amount: inst.amount,
                        status: 'SCHEDULED'
                    }))
                }
            },
            include: { installments: true }
        });

        // Request approval
        await createApprovalRequest({
            entityType: 'FEE_AGREEMENT',
            entityId: agreement.id,
            requestedById: requestedBy.id,
            requestedByName: requestedBy.name,
            details: {
                student: studentName,
                total: totalAmount,
                installments: installments.length
            }
        });

        return res.status(201).json(agreement);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
