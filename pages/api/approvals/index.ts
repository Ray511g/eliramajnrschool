import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { status } = req.query;
        const requests = await prisma.approvalRequest.findMany({
            where: status ? { status: status as string } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { logs: true }
        });
        return res.status(200).json(requests);
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
