import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@elirama.ac.ke' },
        update: {},
        create: { name: 'Admin User', email: 'admin@elirama.ac.ke', password: adminPassword, role: 'admin' },
    });

    await prisma.user.upsert({
        where: { email: 'teacher@elirama.ac.ke' },
        update: {},
        create: { name: 'Jane Teacher', email: 'teacher@elirama.ac.ke', password: teacherPassword, role: 'teacher' },
    });

    // Create school settings
    const existingSettings = await prisma.settings.findFirst();
    if (!existingSettings) {
        await prisma.settings.create({
            data: {
                schoolName: 'ELIRAMA SCHOOL',
                motto: 'Excellence in Education',
                phone: '+254 700 000 000',
                email: 'info@elirama.ac.ke',
                address: 'Nairobi, Kenya',
                currentTerm: 'Term 1',
                currentYear: 2026,
            },
        });
    }

    // Create teachers
    const t1 = await prisma.teacher.upsert({
        where: { email: 'alice@elirama.ac.ke' },
        update: {},
        create: { firstName: 'Alice', lastName: 'Kariuki', email: 'alice@elirama.ac.ke', phone: '0711111111', qualification: 'B.Ed Mathematics', subjects: ['Mathematics', 'Physics'], grades: ['Grade 7', 'Grade 8'], status: 'Active', joinDate: '2020-01-15' },
    });

    const t2 = await prisma.teacher.upsert({
        where: { email: 'bob@elirama.ac.ke' },
        update: {},
        create: { firstName: 'Bob', lastName: 'Omondi', email: 'bob@elirama.ac.ke', phone: '0722222222', qualification: 'B.Ed English', subjects: ['English', 'Literature'], grades: ['Grade 5', 'Grade 6'], status: 'Active', joinDate: '2019-03-01' },
    });

    // Create students
    const s1 = await prisma.student.upsert({
        where: { admissionNumber: 'ELR-001' },
        update: {},
        create: { admissionNumber: 'ELR-001', firstName: 'Amara', lastName: 'Ochieng', gender: 'Female', grade: 'Grade 1', dateOfBirth: '2018-03-15', parentName: 'James Ochieng', parentPhone: '0712345678', parentEmail: 'james@gmail.com', address: 'Nairobi', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 15000, feeBalance: 0 },
    });

    const s2 = await prisma.student.upsert({
        where: { admissionNumber: 'ELR-002' },
        update: {},
        create: { admissionNumber: 'ELR-002', firstName: 'Brian', lastName: 'Kamau', gender: 'Male', grade: 'Grade 2', dateOfBirth: '2017-07-22', parentName: 'Mary Kamau', parentPhone: '0723456789', parentEmail: 'mary@gmail.com', address: 'Westlands', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 10000, feeBalance: 5000 },
    });

    const s3 = await prisma.student.upsert({
        where: { admissionNumber: 'ELR-003' },
        update: {},
        create: { admissionNumber: 'ELR-003', firstName: 'Cynthia', lastName: 'Wanjiku', gender: 'Female', grade: 'Grade 3', dateOfBirth: '2016-11-08', parentName: 'Peter Wanjiku', parentPhone: '0734567890', parentEmail: 'peter@gmail.com', address: 'Kilimani', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 5000, feeBalance: 10000 },
    });

    // Create exams
    await prisma.exam.createMany({
        data: [
            { name: 'Term 1 Mid-Term Mathematics', subject: 'Mathematics', grade: 'Grade 7', date: '2026-03-15', type: 'Midterm', term: 'Term 1', status: 'Scheduled', totalMarks: 100 },
            { name: 'Science Quiz - Grade 3', subject: 'Science', grade: 'Grade 3', date: '2026-02-20', type: 'Quiz', term: 'Term 1', status: 'Completed', totalMarks: 50 },
        ],
        skipDuplicates: true,
    });

    // Create timetable entries
    await prisma.timetableEntry.createMany({
        data: [
            { grade: 'Grade 7', day: 'Monday', timeSlot: '8:00 - 9:00', subject: 'Mathematics', teacherId: t1.id, teacherName: 'Alice Kariuki' },
            { grade: 'Grade 7', day: 'Monday', timeSlot: '9:00 - 10:00', subject: 'English', teacherId: t2.id, teacherName: 'Bob Omondi' },
            { grade: 'Grade 7', day: 'Tuesday', timeSlot: '8:00 - 9:00', subject: 'Mathematics', teacherId: t1.id, teacherName: 'Alice Kariuki' },
        ],
        skipDuplicates: true,
    });

    // Create payment
    await prisma.payment.createMany({
        data: [
            { studentId: s1.id, studentName: 'Amara Ochieng', grade: 'Grade 1', amount: 15000, method: 'M-Pesa', reference: 'QAB123456', date: '2026-01-15', term: 'Term 1', receiptNumber: 'RCT-001' },
            { studentId: s2.id, studentName: 'Brian Kamau', grade: 'Grade 2', amount: 10000, method: 'Cash', reference: '', date: '2026-02-01', term: 'Term 1', receiptNumber: 'RCT-002' },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Seeding complete!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
