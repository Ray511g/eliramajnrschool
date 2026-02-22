import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing direct database write...');
    try {
        const student = await prisma.student.create({
            data: {
                firstName: 'ScriptTest',
                lastName: 'Student',
                admissionNumber: 'STEST-' + Date.now(),
                gender: 'Male',
                grade: 'Grade 1',
                parentName: 'Test Parent',
                parentPhone: '0000000000',
                status: 'Active',
                enrollmentDate: new Date().toISOString().split('T')[0],
                totalFees: 1000,
                paidFees: 0,
                feeBalance: 1000,
            }
        });
        console.log('SUCCESS: Student created with ID:', student.id);
    } catch (error: any) {
        console.error('FAILURE: Could not write to database:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
