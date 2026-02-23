import { NextApiRequest, NextApiResponse } from 'next';
import { processApprovalAction } from '../../../utils/approvals';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'POST') {
        const { approverId, approverName, action, comment, signature } = req.body;

        try {
            const result = await processApprovalAction({
                requestId: id as string,
                approverId,
                approverName,
                action,
                comment,
                signature
            });
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
