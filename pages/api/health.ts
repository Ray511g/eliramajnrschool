import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const diagnostics: any = {
        env: {
            DATABASE_URL: process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0, 30) + '...)' : 'NOT SET',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
            NODE_ENV: process.env.NODE_ENV,
        },
        prisma: 'untested',
        bcrypt: 'untested',
        jwt: 'untested',
    };

    // Test Prisma
    try {
        const { prisma } = require('../../../lib/prisma');
        await prisma.$queryRaw`SELECT 1`;
        diagnostics.prisma = 'OK - connected';

        const userCount = await prisma.user.count();
        diagnostics.userCount = userCount;
    } catch (e: any) {
        diagnostics.prisma = 'FAILED: ' + e.message;
    }

    // Test bcrypt
    try {
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('test', 10);
        diagnostics.bcrypt = 'OK';
    } catch (e: any) {
        diagnostics.bcrypt = 'FAILED: ' + e.message;
    }

    // Test JWT
    try {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ test: true }, process.env.JWT_SECRET || 'test');
        diagnostics.jwt = 'OK';
    } catch (e: any) {
        diagnostics.jwt = 'FAILED: ' + e.message;
    }

    res.status(200).json(diagnostics);
}
