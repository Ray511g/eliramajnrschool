
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
    // Mask the password for security
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

    res.status(200).json({
        dbUrl: maskedUrl,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
}
